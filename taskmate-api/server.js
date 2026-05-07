require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'taskmate',
  waitForConnections: true,
  connectionLimit: 10,
});

const ALLOWED_PRIORITIES = ['alta', 'media', 'baja'];

const mapTask = (row) => ({
  ...row,
  completed: Boolean(row.completed),
});

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, status, error) => res.status(status).json({ success: false, error });

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

function validateTaskBody(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!body || typeof body !== 'object') {
    return { errors: ['El cuerpo de la petición debe ser un objeto JSON'] };
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('title debe ser una cadena no vacía');
    } else if (body.title.length > 200) {
      errors.push('title no puede superar los 200 caracteres');
    } else {
      data.title = body.title.trim();
    }
  } else if (!partial) {
    errors.push('title es obligatorio');
  }

  if (body.description !== undefined) {
    if (body.description === null) {
      data.description = null;
    } else if (typeof body.description !== 'string') {
      errors.push('description debe ser una cadena o null');
    } else {
      data.description = body.description;
    }
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      errors.push('completed debe ser booleano (true/false)');
    } else {
      data.completed = body.completed ? 1 : 0;
    }
  }

  if (body.priority !== undefined) {
    if (!ALLOWED_PRIORITIES.includes(body.priority)) {
      errors.push(`priority debe ser uno de: ${ALLOWED_PRIORITIES.join(', ')}`);
    } else {
      data.priority = body.priority;
    }
  }

  return { errors, data };
}

app.get('/', (req, res) => {
  ok(res, { message: 'TaskMate API funcionando correctamente' });
});

app.get('/api/tasks', async (req, res) => {
  try {
    const { completed, priority } = req.query;
    const conditions = [];
    const params = [];

    if (completed !== undefined) {
      if (completed !== 'true' && completed !== 'false') {
        return fail(res, 400, 'completed debe ser true o false');
      }
      conditions.push('completed = ?');
      params.push(completed === 'true' ? 1 : 0);
    }

    if (priority !== undefined) {
      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return fail(res, 400, `priority debe ser uno de: ${ALLOWED_PRIORITIES.join(', ')}`);
      }
      conditions.push('priority = ?');
      params.push(priority);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, title, description, completed, priority, created_at
      FROM tasks
      ${where}
      ORDER BY created_at DESC
    `;

    const [rows] = await pool.query(sql, params);
    ok(res, rows.map(mapTask));
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Error al obtener tareas');
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, 'id no válido');

  try {
    const [rows] = await pool.query(
      'SELECT id, title, description, completed, priority, created_at FROM tasks WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return fail(res, 404, 'Tarea no encontrada');

    ok(res, mapTask(rows[0]));
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Error al obtener la tarea');
  }
});

app.post('/api/tasks', async (req, res) => {
  const { errors, data } = validateTaskBody(req.body);
  if (errors.length > 0) return fail(res, 400, errors);

  try {
    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, completed, priority)
       VALUES (?, ?, ?, ?)`,
      [
        data.title,
        data.description ?? null,
        data.completed ?? 0,
        data.priority ?? 'media',
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, priority, created_at FROM tasks WHERE id = ?',
      [result.insertId]
    );

    ok(res, mapTask(rows[0]), 201);
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Error al crear la tarea');
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, 'id no válido');

  const { errors, data } = validateTaskBody(req.body, { partial: true });
  if (errors.length > 0) return fail(res, 400, errors);

  const fields = Object.keys(data);
  if (fields.length === 0) {
    return fail(res, 400, 'Debes enviar al menos un campo para actualizar');
  }

  try {
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f]);

    const [result] = await pool.query(
      `UPDATE tasks SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) return fail(res, 404, 'Tarea no encontrada');

    const [rows] = await pool.query(
      'SELECT id, title, description, completed, priority, created_at FROM tasks WHERE id = ?',
      [id]
    );

    ok(res, mapTask(rows[0]));
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Error al actualizar la tarea');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return fail(res, 400, 'id no válido');

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) return fail(res, 404, 'Tarea no encontrada');

    ok(res, { id, deleted: true });
  } catch (err) {
    console.error(err);
    fail(res, 500, 'Error al eliminar la tarea');
  }
});

app.use((req, res) => {
  fail(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
