import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Column {
  name: string;
  dataTypeID: number;
}

interface QueryResult {
  rows: any[];
  fields: Column[];
  rowCount: number;
}

function App() {
  const [connectionString, setConnectionString] = useState('');
  const [connected, setConnected] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [query, setQuery] = useState('');
  const [rowLimit, setRowLimit] = useState(50);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await fetch(`${API_URL}/api/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString }),
      });

      const data = await response.json();

      if (response.ok) {
        setConnected(true);
        fetchDatabases();
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabases = async () => {
    try {
      const response = await fetch(`${API_URL}/api/databases`);
      const data = await response.json();

      if (response.ok) {
        setDatabases(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectDatabase = async (database: string) => {
    try {
      setError('');
      setSelectedDatabase(database);
      setSelectedTable('');
      setTableData(null);
      setQuery('');

      const response = await fetch(`${API_URL}/api/tables/${database}`);
      const data = await response.json();

      if (response.ok) {
        setTables(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectTable = async (table: string) => {
    setSelectedTable(table);
    setQuery(`SELECT * FROM ${table}`);
    fetchTableData(table);
  };

  const fetchTableData = async (table: string, sort?: { column: string; order: 'ASC' | 'DESC' }) => {
    try {
      setError('');
      setLoading(true);

      const sortBy = sort?.column || sortColumn;
      const order = sort?.order || sortOrder;

      let url = `${API_URL}/api/table-data/${selectedDatabase}/${table}?limit=${rowLimit}`;
      if (sortBy) {
        url += `&sortBy=${sortBy}&sortOrder=${order}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setTableData(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database: selectedDatabase,
          query,
          limit: rowLimit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTableData(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    const newOrder = sortColumn === column && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortOrder(newOrder);

    if (selectedTable) {
      fetchTableData(selectedTable, { column, order: newOrder });
    }
  };

  const handleRowLimitChange = (newLimit: number) => {
    setRowLimit(newLimit);
    if (selectedTable) {
      setTimeout(() => fetchTableData(selectedTable), 100);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PostgreSQL Database Viewer</h1>
        <div className="connection-bar">
          <input
            type="text"
            placeholder="Enter PostgreSQL connection string (e.g., postgresql://user:password@localhost:5432/dbname)"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            disabled={connected}
            className="connection-input"
          />
          <button onClick={handleConnect} disabled={connected || !connectionString || loading} className="connect-btn">
            {connected ? 'Connected' : 'Connect'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Databases</h3>
            <ul className="list">
              {databases.map((db) => (
                <li
                  key={db}
                  className={selectedDatabase === db ? 'active' : ''}
                  onClick={() => handleSelectDatabase(db)}
                >
                  {db}
                </li>
              ))}
            </ul>
          </div>

          {selectedDatabase && (
            <div className="sidebar-section">
              <h3>Tables</h3>
              <ul className="list">
                {tables.map((table) => (
                  <li
                    key={table}
                    className={selectedTable === table ? 'active' : ''}
                    onClick={() => handleSelectTable(table)}
                  >
                    {table}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="content">
          {selectedTable && (
            <>
              <div className="query-section">
                <div className="query-controls">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="query-input"
                    placeholder="Enter SQL query"
                  />
                  <button onClick={handleExecuteQuery} className="execute-btn" disabled={loading}>
                    Execute
                  </button>
                </div>
                <div className="row-limit">
                  <label>Rows per page:</label>
                  <select value={rowLimit} onChange={(e) => handleRowLimitChange(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </div>
              </div>

              {loading && <div className="loading">Loading...</div>}

              {tableData && !loading && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {tableData.fields.map((field) => (
                          <th key={field.name} onClick={() => handleSort(field.name)} className="sortable">
                            {field.name}
                            {sortColumn === field.name && (
                              <span className="sort-indicator">{sortOrder === 'ASC' ? ' ↑' : ' ↓'}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx}>
                          {tableData.fields.map((field) => (
                            <td key={field.name}>
                              {row[field.name] !== null && row[field.name] !== undefined
                                ? String(row[field.name])
                                : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="table-info">Showing {tableData.rowCount} rows</div>
                </div>
              )}
            </>
          )}

          {!selectedTable && connected && (
            <div className="placeholder">
              <p>Select a database and table to view data</p>
            </div>
          )}

          {!connected && (
            <div className="placeholder">
              <p>Enter a connection string and click Connect to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
