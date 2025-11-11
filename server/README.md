# PostgreSQL Viewer - Backend Server

Express.js API server for PostgreSQL Database Viewer.

## Environment Variables

- `PORT` - Server port (default: 3001, Railway sets this automatically)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., https://your-frontend.railway.app)

## Local Development

```bash
npm install
npm run dev
```

## Production

```bash
npm install
npm start
```

## API Endpoints

- `POST /api/connect` - Connect to PostgreSQL database
- `GET /api/databases` - List all databases
- `GET /api/tables/:database` - List tables in a database
- `GET /api/table-data/:database/:table` - Get table data with sorting/pagination
- `POST /api/query` - Execute custom SQL query
