import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Cell {
  address: string;
  expression: string;
  value: number;
  error: string | null;
}

function App() {
  const [cells, setCells] = useState<Cell[][]>([]);
  const [viewMode, setViewMode] = useState<'expression' | 'value'>('expression');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [info, setInfo] = useState<{ rows: number; cols: number; operations: string[] } | null>(null);

  const API = 'http://localhost:3001/api';

  useEffect(() => {
    fetchSpreadsheet();
    fetchInfo();
  }, []);

  const fetchSpreadsheet = async () => {
    try {
      const res = await axios.get(`${API}/spreadsheet`);
      setCells(res.data);
    } catch (e) {
      console.error('Помилка при завантаженні таблиці:', e);
    }
  };

  const fetchInfo = async () => {
    try {
      const res = await axios.get(`${API}/info`);
      setInfo(res.data);
    } catch (e) {
      console.error('Помилка при завантаженні інформації:', e);
    }
  };

  const handleCellClick = (cell: Cell) => {
    setEditingCell(cell.address);
    setEditValue(cell.expression);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    try {
      await axios.post(`${API}/cell`, {
        address: editingCell,
        expression: editValue,
      });
      fetchSpreadsheet();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { error?: string } }; message?: string };
      alert('Помилка: ' + (error.response?.data?.error || error.message));
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const addRow = async () => {
    try {
      const res = await axios.post(`${API}/add-row`);
      setCells(res.data);
    } catch (e) {
      console.error('Помилка при додаванні рядка:', e);
    }
  };

  const addColumn = async () => {
    try {
      const res = await axios.post(`${API}/add-column`);
      setCells(res.data);
    } catch (e) {
      console.error('Помилка при додаванні стовпця:', e);
    }
  };

  const removeRow = async () => {
    try {
      const res = await axios.post(`${API}/remove-row`);
      setCells(res.data);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { error?: string } }; message?: string };
      alert('Помилка: ' + (error.response?.data?.error || error.message));
    }
  };

  const removeColumn = async () => {
    try {
      const res = await axios.post(`${API}/remove-column`);
      setCells(res.data);
    } catch (e: unknown) {
      const error = e as { response?: { data?: { error?: string } }; message?: string };
      alert('Помилка: ' + (error.response?.data?.error || error.message));
    }
  };

  const save = async () => {
    try {
      await axios.post(`${API}/save`);
      alert('Таблиця збережена!');
    } catch (e) {
      console.error('Помилка при збереженні:', e);
    }
  };

  const clear = async () => {
    if (window.confirm('Ви впевнені? Всі дані будуть видалені.')) {
      try {
        const res = await axios.post(`${API}/clear`);
        setCells(res.data);
      } catch (e) {
        console.error('Помилка при очищенні:', e);
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Електронна таблиця</h1>
        <p className="subtitle">Онлайн редактор таблиць з парсингом виразів</p>
      </header>

      <section className="info-panel">
        {info && (
          <div className="info-content">
            <p><strong>Виконав:</strong> Столяр Максим К-24</p>
            <p><strong>Завдання:</strong> Розробка електронної таблиці з парсингом та обчисленням виразів</p>
            <p><strong>Підтримувані операції:</strong></p>
            <ul>
              {info.operations.map((op, idx) => (
                <li key={idx}>{op}</li>
              ))}
            </ul>
            <p><strong>Розмір таблиці:</strong> {info.rows} рядків × {info.cols} стовпців</p>
          </div>
        )}
      </section>

      <section className="controls">
        <div className="mode-toggle">
          <button
            className={viewMode === 'expression' ? 'active' : ''}
            onClick={() => setViewMode('expression')}
          >
            📝 Вирази
          </button>
          <button
            className={viewMode === 'value' ? 'active' : ''}
            onClick={() => setViewMode('value')}
          >
            🔢 Значення
          </button>
        </div>

        <div className="table-controls">
          <button onClick={addRow} title="Додати рядок">➕ Рядок</button>
          <button onClick={addColumn} title="Додати стовпець">➕ Стовпець</button>
          <button onClick={removeRow} title="Видалити останній рядок">➖ Рядок</button>
          <button onClick={removeColumn} title="Видалити останній стовпець">➖ Стовпець</button>
        </div>

        <div className="file-controls">
          <button onClick={save} className="btn-save">💾 Зберегти</button>
          <button onClick={clear} className="btn-clear">🗑️ Очистити</button>
        </div>
      </section>

      <section className="table-container">
        {cells.length > 0 && (
          <table className="spreadsheet">
            <tbody>
              {cells.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell) => (
                    <td
                      key={cell.address}
                      className={`cell ${editingCell === cell.address ? 'editing' : ''} ${cell.error ? 'error' : ''}`}
                      onClick={() => handleCellClick(cell)}
                      title={cell.error || cell.address}
                    >
                      {editingCell === cell.address ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={handleCellChange}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          className="cell-input"
                        />
                      ) : (
                        <div className="cell-content">
                          <div className="cell-address">{cell.address}</div>
                          <div className="cell-display">
                            {cell.error ? (
                              <span className="error-text">⚠️ {cell.error}</span>
                            ) : viewMode === 'expression' ? (
                              <span>{cell.expression || '—'}</span>
                            ) : (
                              <span>{cell.value}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

    </div>
  );
}

export default App;

