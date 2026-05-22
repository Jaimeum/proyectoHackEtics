-- =====================================================================
--  Esquema de la base de datos del laboratorio de concientizacion.
--
--  PRINCIPIO DE DISENO: MINIMIZACION DE DATOS.
--  Esta tabla guarda UNICAMENTE el evento de interaccion (visito / envio),
--  el token anonimo del participante y el nivel de la campana.
--
--  NO existe ninguna columna para almacenar lo que el participante teclea
--  (nombre, telefono, CURP, contrasenas, etc.). Esos datos JAMAS salen del
--  navegador del participante. Asi obtenemos la metrica de conversion que
--  pide el examen, sin crear un deposito real de datos personales.
--
--  Esta es la diferencia entre una SIMULACION de concientizacion (etica)
--  y un robo de credenciales (ataque real).
-- =====================================================================

CREATE TABLE IF NOT EXISTS events (
    id                SERIAL PRIMARY KEY,
    participant_token TEXT        NOT NULL,   -- p.ej. "U-7F3A" (anonimo)
    level             INTEGER     NOT NULL,   -- 1, 2 o 3
    event_type        TEXT        NOT NULL,   -- 'visit' | 'submit'
    user_agent        TEXT,                   -- info gruesa del navegador (para el reporte)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_level  ON events(level);
CREATE INDEX IF NOT EXISTS idx_events_token  ON events(participant_token);
CREATE INDEX IF NOT EXISTS idx_events_type   ON events(event_type);
