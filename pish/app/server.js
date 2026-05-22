/**
 * PhishLab ITAM — servidor del laboratorio de concientizacion.
 *
 * Sirve las tres campanas, registra eventos de conversion (visit/submit)
 * y expone un dashboard de resultados.
 *
 * IMPORTANTE: el endpoint /api/event SOLO acepta {token, level, type}.
 * Cualquier otro campo que llegue en el body se ignora. Los datos que el
 * participante teclea en los formularios NUNCA se envian aqui.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------------
// Inicializacion de la BD con reintentos (espera a que Postgres este listo)
// ---------------------------------------------------------------------
async function initDb(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
      await pool.query(sql);
      console.log('[db] esquema listo');
      return;
    } catch (err) {
      console.log(`[db] esperando a Postgres... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('No se pudo conectar a la base de datos');
}

// ---------------------------------------------------------------------
// Utilidad: sanea un valor de texto corto para inyectar en el HTML
// (evita que el parametro ?n= pueda romper la pagina o inyectar markup)
// ---------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------
// Servir una campana, inyectando token / nivel / nombre en el HTML
// ---------------------------------------------------------------------
function serveCampaign(level) {
  return (req, res) => {
    const file = path.join(__dirname, 'views', `nivel${level}.html`);
    let html = fs.readFileSync(file, 'utf8');

    const token = escapeHtml((req.query.u || 'DEMO').slice(0, 24));
    const name = escapeHtml((req.query.n || '').slice(0, 40));

    html = html
      .replace(/__TOKEN__/g, token)
      .replace(/__LEVEL__/g, String(level))
      .replace(/__NAME__/g, name);

    res.set('Content-Type', 'text/html; charset=utf-8').send(html);
  };
}

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/n1', serveCampaign(1));
app.get('/n2', serveCampaign(2));
app.get('/n3', serveCampaign(3));

// ---------------------------------------------------------------------
// Registro de eventos. Solo token + nivel + tipo. Nada mas se persiste.
// ---------------------------------------------------------------------
app.post('/api/event', async (req, res) => {
  try {
    const { token, level, type } = req.body || {};
    const lvl = parseInt(level, 10);

    if (!token || ![1, 2, 3].includes(lvl) || !['visit', 'submit'].includes(type)) {
      return res.status(400).json({ ok: false, error: 'parametros invalidos' });
    }

    const ua = (req.get('user-agent') || '').slice(0, 200);
    await pool.query(
      'INSERT INTO events (participant_token, level, event_type, user_agent) VALUES ($1,$2,$3,$4)',
      [String(token).slice(0, 24), lvl, type, ua]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[event] error:', err.message);
    res.status(500).json({ ok: false });
  }
});

// ---------------------------------------------------------------------
// Dashboard de resultados
// ---------------------------------------------------------------------
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/api/stats', async (req, res) => {
  try {
    // Embudo por nivel: visitantes unicos vs. quienes enviaron
    const byLevel = await pool.query(`
      SELECT level,
             COUNT(DISTINCT participant_token) FILTER (WHERE event_type='visit')  AS visited,
             COUNT(DISTINCT participant_token) FILTER (WHERE event_type='submit') AS submitted
      FROM events
      GROUP BY level
      ORDER BY level
    `);

    // Por participante: nivel maximo en el que "cayo" (envio)
    const byParticipant = await pool.query(`
      SELECT participant_token AS token,
             ARRAY_AGG(DISTINCT level ORDER BY level)
               FILTER (WHERE event_type='submit') AS submitted_levels,
             MAX(level) FILTER (WHERE event_type='submit') AS max_submitted_level
      FROM events
      GROUP BY participant_token
      ORDER BY participant_token
    `);

    // Linea de tiempo (ultimos eventos)
    const recent = await pool.query(`
      SELECT participant_token AS token, level, event_type AS type, created_at
      FROM events ORDER BY created_at DESC LIMIT 50
    `);

    res.json({
      byLevel: byLevel.rows,
      byParticipant: byParticipant.rows,
      recent: recent.rows
    });
  } catch (err) {
    console.error('[stats] error:', err.message);
    res.status(500).json({ error: 'stats' });
  }
});

// Borrar todos los eventos (util para reiniciar entre demos)
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query('TRUNCATE events RESTART IDENTITY');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`[app] escuchando en http://localhost:${PORT}`)))
  .catch(err => { console.error(err); process.exit(1); });
