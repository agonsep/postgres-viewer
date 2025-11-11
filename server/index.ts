import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let pool: Pool | null = null;
let currentConnectionString = '';
let currentConfig: any = null;

// Connect to PostgreSQL
app.post('/api/connect', async (req, res) => {
  try {
    const { connectionString } = req.body;

    // Close existing pool if any
    if (pool) {
      await pool.end();
    }

    // Parse connection string to handle empty passwords
    const url = new URL(connectionString);
    const config: any = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
    };

    // Only set password if it exists and is not empty
    if (url.password) {
      config.password = url.password;
    }

    pool = new Pool(config);
    currentConnectionString = connectionString;
    currentConfig = config;

    // Test connection
    await pool.query('SELECT NOW()');

    res.json({ success: true, message: 'Connected successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get list of databases
app.get('/api/databases', async (req, res) => {
  try {
    if (!pool) {
      return res.status(400).json({ error: 'Not connected to database' });
    }

    const result = await pool.query(
      `SELECT datname FROM pg_database
       WHERE datistemplate = false
       ORDER BY datname`
    );

    res.json(result.rows.map(row => row.datname));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get list of tables for a specific database
app.get('/api/tables/:database', async (req, res) => {
  try {
    const { database } = req.params;

    // Create a new pool for the specific database using stored config
    const dbConfig = { ...currentConfig, database };
    const dbPool = new Pool(dbConfig);

    const result = await dbPool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    await dbPool.end();

    res.json(result.rows.map(row => row.table_name));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute a query
app.post('/api/query', async (req, res) => {
  try {
    const { database, query, limit = 50 } = req.body;

    if (!currentConfig) {
      return res.status(400).json({ error: 'Not connected to database' });
    }

    // Create a new pool for the specific database using stored config
    const dbConfig = { ...currentConfig, database };
    const dbPool = new Pool(dbConfig);

    // Add LIMIT to query if not already present
    let finalQuery = query.trim();
    if (!finalQuery.toLowerCase().includes('limit') && limit) {
      finalQuery += ` LIMIT ${limit}`;
    }

    const result = await dbPool.query(finalQuery);

    await dbPool.end();

    res.json({
      rows: result.rows,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID
      })),
      rowCount: result.rowCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get table data
app.get('/api/table-data/:database/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = req.query.sortBy as string || '';
    const sortOrder = req.query.sortOrder as string || 'ASC';

    if (!currentConfig) {
      return res.status(400).json({ error: 'Not connected to database' });
    }

    // Create a new pool for the specific database using stored config
    const dbConfig = { ...currentConfig, database };
    const dbPool = new Pool(dbConfig);

    let query = `SELECT * FROM "${table}"`;

    if (sortBy) {
      query += ` ORDER BY "${sortBy}" ${sortOrder}`;
    }

    query += ` LIMIT ${limit}`;

    const result = await dbPool.query(query);

    await dbPool.end();

    res.json({
      rows: result.rows,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID
      })),
      rowCount: result.rowCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
