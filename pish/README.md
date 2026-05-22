# PhishLab ITAM — Plataforma de concientización de phishing

Proyecto del examen final de **Seguridad Informática y Hackeo Ético** (ITAM).
Es una plataforma de **simulación de phishing con fines de concientización**: presenta
tres campañas de dificultad creciente, mide quién "cae" en cada una y entrega de
inmediato material educativo al participante.

> **Principio rector — minimización de datos.**
> La plataforma mide la *conversión* (¿la persona visitó?, ¿envió el formulario?) pero
> **NUNCA guarda lo que el participante teclea** (nombre, teléfono, tarjeta, CURP…).
> Esos datos jamás salen de su navegador. Esto es lo que separa una simulación ética
> de un robo real de credenciales, y es un punto central del proyecto.

---

## 1. Requisitos

- Docker y Docker Compose instalados.
- Nada más. Toda la app corre en contenedores.

## 2. Cómo levantarlo

```bash
cp .env.example .env        # credenciales locales del laboratorio
docker compose up --build   # construye y arranca app + base de datos
```

Luego abre en tu navegador:

- **Panel de resultados:** http://localhost:3000/dashboard
- **Campaña Nivel 1:** http://localhost:3000/n1?u=U-001
- **Campaña Nivel 2:** http://localhost:3000/n2?u=U-001
- **Campaña Nivel 3:** http://localhost:3000/n3?u=U-001&n=Carlos

Para detener: `Ctrl+C` y luego `docker compose down` (agrega `-v` para borrar también la base de datos).

## 3. Exponer al internet con Cloudflare Tunnel

Para que participantes fuera de tu red local puedan acceder, usa **Cloudflare Tunnel** (no requiere cuenta ni configuración).

### Paso a paso

**Terminal 1 — levanta la app:**
```bash
docker compose up --build
```
Espera a ver: `[app] escuchando en http://localhost:3000`

**Terminal 2 — abre el túnel:**
```bash
docker run --rm --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```
En unos segundos aparece una línea como:
```
Your quick Tunnel has been created! Visit it at:
https://nombre-aleatorio.trycloudflare.com
```

Esa URL es tu endpoint público. Comparte los links así:
- `https://nombre-aleatorio.trycloudflare.com/n1`
- `https://nombre-aleatorio.trycloudflare.com/n2`
- `https://nombre-aleatorio.trycloudflare.com/n3`

> **Importante:** la URL cambia cada vez que reinicias el túnel. Si el experimento dura varias horas, mantén la Terminal 2 abierta. Si se cae, repite el comando — los datos en PostgreSQL se conservan.

### Advertencias
- Los túneles sin cuenta de Cloudflare no tienen garantía de uptime. Para un experimento corto (1-2 horas) son más que suficientes.
- El tráfico pasa por los servidores de Cloudflare, pero recuerda que **no se captura ningún dato sensible** — solo eventos `visit`/`submit`.

---

## 4. Cómo correr el experimento (flujo general)

1. Asigna a cada participante un **token anónimo** (p. ej. `U-001`, `U-002`…). Anótalo
   en tu catálogo (ver `docs/01-catalogo-usuarios.md`), nunca su nombre real.
2. En el **dashboard** usa el *Generador de enlaces* para crear el enlace de cada
   persona y cada nivel. Para el nivel 3 puedes añadir su nombre de pila (viaja en la
   URL, no se almacena).
3. Reparte cada enlace por el medio que vayas a probar (WhatsApp, SMS, redes…).
   Recuerda lo que dice el examen: los filtros de Gmail/Hotmail suelen bloquear esto;
   la mensajería personal es más efectiva.
4. Cuando alguien abre el enlace se registra una **visita**; si envía el formulario se
   registra que **"cayó"** y se le muestra de inmediato la pantalla educativa.
5. Observa los resultados en vivo en el dashboard (se actualiza solo cada 5 s).

## 4. Cómo medir sin guardar datos sensibles

Cada página, al cargar, manda al servidor únicamente `{token, nivel, "visit"}`.
Al enviar el formulario manda `{token, nivel, "submit"}`. **Eso es todo lo que viaja.**
Revisa:

- `app/public/tracker.js` — el cliente; verás que no lee los `<input>`.
- `app/server.js` (endpoint `/api/event`) — ignora cualquier otro campo.
- `app/init.sql` — la tabla no tiene columnas para credenciales.

Para medir *quién* abrió sin tocar datos personales, basta el token anónimo del enlace.
(Alternativa sin servidor: un acortador como Bitly también te da métricas de clics.)

## 5. Arquitectura

```
┌─────────────┐      HTTP        ┌──────────────────────┐
│  Navegador  │ ───────────────► │  app (Node + Express)│
│ participante│  visit / submit  │  · sirve campañas     │
└─────────────┘                  │  · /api/event         │
                                 │  · dashboard          │
                                 └──────────┬────────────┘
                                            │ SQL (solo eventos)
                                            ▼
                                 ┌──────────────────────┐
                                 │  db (PostgreSQL)      │
                                 │  tabla: events        │
                                 └──────────────────────┘
```

- **app** — Node.js + Express. Sirve las tres campañas (plantillas con token/nivel/nombre),
  el endpoint de eventos y el dashboard.
- **db** — PostgreSQL. Una sola tabla `events`. No se publica su puerto al exterior.
- La app solo escucha en `127.0.0.1:3000` (no se expone a la red).

## 6. Estructura del repositorio

```
proyecto-phishing-itam/
├── docker-compose.yml          # orquesta app + base de datos
├── .env.example
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js               # Express: campañas, /api/event, /api/stats
│   ├── init.sql                # esquema (solo eventos, sin datos sensibles)
│   ├── public/
│   │   ├── tracker.js          # cliente: registra visit/submit, NO lee inputs
│   │   └── reveal.css          # estilos de la pantalla educativa
│   └── views/
│       ├── nivel1.html         # campaña genérica (cupón)
│       ├── nivel2.html         # campaña con urgencia (paquetería)
│       ├── nivel3.html         # spear phishing (alerta de seguridad + QR)
│       └── dashboard.html      # panel de resultados
└── docs/
    ├── 00-reporte.md           # reporte maestro del examen
    ├── 01-catalogo-usuarios.md # entregable 1
    ├── 02-cuestionario-madurez.md       # entregables 2 y 5
    ├── 06a-analisis-discrepancia.md     # entregable 6a
    └── concientizacion/        # entregable 6b (uno por nivel)
        ├── nivel1.md
        ├── nivel2.md
        └── nivel3.md
```

## 7. Mapa de entregables del examen

| # | Entregable | Dónde está |
|---|-----------|-----------|
| 1 | Catálogo de usuarios | `docs/01-catalogo-usuarios.md` |
| 2 | Cuestionario de madurez (hipótesis) | `docs/02-cuestionario-madurez.md` |
| 3 | Campañas de phishing (3 niveles) | `app/views/nivel1-3.html` + esta plataforma |
| 4 | Respuesta de los usuarios | Dashboard (`/dashboard`) + `docs/00-reporte.md` |
| 5 | Cuestionario de madurez (real) | `docs/02-cuestionario-madurez.md` |
| 6a | Análisis de discrepancia | `docs/06a-analisis-discrepancia.md` |
| 6b | Materiales de concientización (3) | `docs/concientizacion/` + revelación integrada en cada campaña |
| 7 | Reporte en PDF | exporta `docs/00-reporte.md` a PDF |
| 8 | Presentación | pendiente (no incluida por ahora) |

## 8. Ética y alcance

- Solo para participantes **adultos** que dieron su **consentimiento** a participar en
  "un experimento de la clase" (sin decirles cuándo ni qué recibirían, para no invalidar la prueba).
- Marcas **ficticias**: no se suplanta ningún negocio real ni se usa al ITAM o comercios cercanos.
- **No se capturan** credenciales ni datos personales.
- Todo corre **localmente** en la máquina del equipo; **no se publica** en internet.
- Cada participante recibe el material de concientización: una campaña sin educación no tiene sentido.
