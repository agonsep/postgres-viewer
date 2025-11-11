# PostgreSQL Database Viewer

A React-based web application for browsing and querying PostgreSQL databases with an intuitive interface.

## Features

- **Connection Management**: Connect to any PostgreSQL database using a connection string
- **Database Browser**: View all databases in your PostgreSQL instance
- **Table Browser**: List all tables within a selected database
- **Data Viewer**: Display table data with:
  - Sortable columns (click column headers to sort)
  - Adjustable row limits (10, 25, 50, 100, 500)
  - Default display of top 50 rows
- **Custom Queries**: Execute custom SQL queries with an editable query box
- **Clean UI**: Modern, responsive interface with sidebar navigation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (local or remote)

## Installation

1. Navigate to the project directory:
   ```bash
   cd postgres-viewer
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

## Running the Application

The application consists of two parts: a frontend React app and a backend Express server.

### Development Mode

**Option 1: Run both simultaneously (Recommended)**

```bash
npm run start:dev
```

**Option 2: Run separately**

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend App:**
```bash
npm run dev
```

The backend server will run on `http://localhost:3001` and the frontend will run on `http://localhost:5173`.

### Production Mode

```bash
npm run build
npm start
```

## Deploy to Railway

This application is configured for easy deployment to Railway.

### Quick Deploy

1. **Push your code to GitHub** (already done!)

2. **Deploy to Railway:**
   - Go to [Railway](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `postgres-viewer` repository
   - Railway will auto-detect the configuration

3. **Add PostgreSQL Database:**
   - In your Railway project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL instance

4. **Configure Environment Variables:**
   - Railway automatically sets `PORT` and database connection variables
   - Add `NODE_ENV=production` in the Variables tab (optional, auto-detected)

5. **Your app is live!**
   - Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)

### Railway Configuration Files

The project includes:
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration
- `Procfile` - Process configuration

### Local Testing of Production Build

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

## Usage

1. **Connect to Database**:
   - Enter your PostgreSQL connection string in the format:
     ```
     postgresql://username:password@host:port/database
     ```
   - For Railway PostgreSQL, use the connection string from your Railway dashboard
   - For empty passwords, use: `postgresql://username@host:port/database`
   - Click the "Connect" button

2. **Browse Databases**:
   - After connecting, the left sidebar will display all available databases
   - Click on a database to view its tables

3. **View Tables**:
   - Once a database is selected, tables appear below the databases list
   - Click on a table to view its contents

4. **Interact with Data**:
   - Click column headers to sort ascending/descending
   - Use the "Rows per page" dropdown to change how many rows are displayed
   - Edit the SQL query in the text box to run custom queries
   - Click "Execute" to run your custom query

## Project Structure

```
postgres-viewer/
├── server/
│   └── index.ts          # Express backend server
├── src/
│   ├── App.tsx           # Main React component
│   ├── App.css           # Application styles
│   ├── index.css         # Global styles
│   └── main.tsx          # React entry point
├── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **Backend**: Express, Node.js
- **Database**: PostgreSQL (pg library)
- **Styling**: CSS

## Security Note

This application is intended for development and local use. For production deployments:
- Implement proper authentication
- Use environment variables for sensitive configuration
- Add input validation and sanitization
- Implement rate limiting
- Use HTTPS
- Add proper error handling and logging

## License

MIT
