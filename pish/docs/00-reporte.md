# Examen Final — Seguridad Informática y Hackeo Ético
## Campaña de phishing y concientización

**Materia:** Seguridad Informática y Hackeo Ético — ITAM
**Profesora:** Dra. Alejandra Flores Mosri
**Equipo:** _[nombres]_
**Fecha:** _[fecha]_

---

## Resumen ejecutivo

Diseñamos y ejecutamos una campaña de phishing de concientización con tres niveles de
dificultad creciente sobre _[N]_ participantes adultos que dieron su consentimiento.
El objetivo fue medir su madurez digital **real**, contrastarla con la hipótesis del equipo
y con su autoevaluación, y entregar material de concientización personalizado.

Para ello construimos **PhishLab**, una plataforma propia (Docker + Node + PostgreSQL) que
sirve las tres campañas y mide la conversión **sin almacenar ningún dato personal** de los
participantes, aplicando el principio de minimización de datos.

> _Hallazgo principal (a completar):_ en general, la madurez **percibida** de los
> participantes resultó mayor que la **real**; la urgencia, la curiosidad y la
> personalización siguieron siendo eficaces incluso en usuarios que conocían la teoría.

---

## 1. Metodología

1. **Catálogo** anonimizado de participantes y estimación de su madurez (hipótesis).
2. **Cuestionario de madurez** contestado por el equipo simulando a cada participante.
3. **Tres campañas** de dificultad creciente, enviadas a todos los participantes.
4. **Medición** de en qué nivel "cayó" cada quien (plataforma PhishLab).
5. **Concientización** inmediata y personalizada por nivel.
6. **Re-medición:** los participantes contestaron ellos mismos el cuestionario.
7. **Análisis de discrepancia** entre hipótesis, resultado real y autoevaluación.

### Consideraciones éticas

- Solo participantes **adultos** con **consentimiento** para "un experimento de clase".
- Marcas **ficticias**; no se usó al ITAM ni comercios cercanos; no se suplantó a nadie real.
- **No se capturaron** credenciales ni datos personales (ver sección de herramientas).
- Todo corrió **localmente**; nada se publicó en internet.
- Todos los participantes recibieron el material de concientización al terminar.

### Herramientas utilizadas

- **PhishLab** (desarrollo propio): Docker Compose con un servicio Node.js + Express que
  sirve las tres campañas y un panel de resultados, y una base de datos PostgreSQL que
  registra **únicamente eventos** (visita / envío) por token anónimo y nivel.
- **Decisión clave de diseño — minimización de datos:** cuando un participante envía el
  formulario, su navegador solo manda al servidor `{token, nivel, "submit"}`. Lo que teclea
  (nombre, tarjeta, CURP…) **nunca sale de su navegador**. Esto nos da la métrica de
  conversión sin convertirnos nosotros en un riesgo para nuestros conocidos. Es la diferencia
  entre una simulación de concientización y un robo real de credenciales.
- Distribución de los enlaces por _[WhatsApp / SMS / redes]_, generando un enlace único por
  participante desde el panel.

---

## 2. Catálogo de usuarios *(Entregable 1)*

Ver `docs/01-catalogo-usuarios.md`. _[Insertar la tabla final aquí.]_

## 3. Cuestionario de madurez — hipótesis *(Entregable 2)*

Ver `docs/02-cuestionario-madurez.md`. _[Insertar resultados de la hipótesis por participante.]_

## 4. Campañas de phishing *(Entregable 3)*

Tres niveles, todos enviados a todos los participantes:

- **Nivel 1 — genérico (cupón "SuperCuponazo MX").** Premio inesperado, errores de
  ortografía, dominio `.win` falso, urgencia, pide datos de más. _[Captura de pantalla.]_
- **Nivel 2 — urgencia (paquetería "PaqueExpress").** Paquete retenido en aduana, cobro de
  $48, diseño profesional con candado, pide datos de tarjeta. _[Captura de pantalla.]_
- **Nivel 3 — dirigido (alerta "NubeSegura" + QR).** Alerta de seguridad personalizada con
  el nombre del usuario, miedo (acceso desde el extranjero) y un código QR (quishing).
  _[Captura de pantalla.]_

Cada campaña, al ser enviada, registra una visita; al "caer" el usuario, muestra de inmediato
la pantalla de concientización (ver entregable 6b). _[Incluir capturas de las tres campañas y
de sus pantallas de revelación.]_

## 5. Respuesta de los usuarios a la campaña *(Entregable 4)*

Datos tomados del panel de PhishLab. _[Insertar capturas del dashboard.]_

| Nivel | Visitaron | Cayeron (enviaron) | % conversión |
|-------|:--------:|:------------------:|:------------:|
| 1 | _[ ]_ | _[ ]_ | _[ ]_ |
| 2 | _[ ]_ | _[ ]_ | _[ ]_ |
| 3 | _[ ]_ | _[ ]_ | _[ ]_ |

_[Comentar: ¿en qué nivel cayó más gente? ¿hubo quien no cayó en ninguno?]_

## 6. Cuestionario de madurez — real *(Entregable 5)*

Ver `docs/02-cuestionario-madurez.md`, contestado por los participantes.
_[Insertar resultados reales por participante y capturas.]_

## 7. Análisis de discrepancia *(Entregable 6a)*

Ver `docs/06a-analisis-discrepancia.md`. _[Insertar tabla comparativa y conclusiones,
incluyendo las entrevistas si las hubo.]_

## 8. Materiales de concientización *(Entregable 6b)*

Tres planes personalizados, uno por nivel, ligados al phishing enviado:

- `docs/concientizacion/nivel1.md` — para quienes cayeron en lo genérico.
- `docs/concientizacion/nivel2.md` — para quienes cayeron en la urgencia.
- `docs/concientizacion/nivel3.md` — para quienes cayeron en el spear phishing.

Además, cada campaña entrega la concientización **dentro de la propia página**: al enviar el
formulario, el participante ve de inmediato las señales que debió notar. _[Incluir evidencia de
que se concientizó a cada participante: capturas de la entrega del material, mensajes, etc.]_

---

## 9. Conclusiones

_[Resumir: brecha entre madurez percibida y real; qué nivel fue más efectivo y por qué; qué
medios funcionaron mejor; qué aprendieron los participantes; recomendaciones.]_

## 10. Anexos

- Capturas de las tres campañas y sus pantallas educativas.
- Capturas del panel de resultados.
- Evidencia de concientización por participante.
- Código fuente de la plataforma (este repositorio).
