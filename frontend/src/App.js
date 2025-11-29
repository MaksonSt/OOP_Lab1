import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
function App() {
    const [cells, setCells] = useState([]);
    const [viewMode, setViewMode] = useState('expression');
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [info, setInfo] = useState(null);
    const API = 'http://localhost:3001/api';
    useEffect(() => {
        fetchSpreadsheet();
        fetchInfo();
    }, []);
    const fetchSpreadsheet = async () => {
        try {
            const res = await axios.get(`${API}/spreadsheet`);
            setCells(res.data);
        }
        catch (e) {
            console.error('Помилка при завантаженні таблиці:', e);
        }
    };
    const fetchInfo = async () => {
        try {
            const res = await axios.get(`${API}/info`);
            setInfo(res.data);
        }
        catch (e) {
            console.error('Помилка при завантаженні інформації:', e);
        }
    };
    const handleCellClick = (cell) => {
        setEditingCell(cell.address);
        setEditValue(cell.expression);
    };
    const handleCellChange = (e) => {
        setEditValue(e.target.value);
    };
    const handleCellBlur = async () => {
        if (!editingCell)
            return;
        try {
            await axios.post(`${API}/cell`, {
                address: editingCell,
                expression: editValue,
            });
            fetchSpreadsheet();
        }
        catch (e) {
            const error = e;
            alert('Помилка: ' + (error.response?.data?.error || error.message));
        }
        setEditingCell(null);
        setEditValue('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCellBlur();
        }
        else if (e.key === 'Escape') {
            setEditingCell(null);
            setEditValue('');
        }
    };
    const addRow = async () => {
        try {
            const res = await axios.post(`${API}/add-row`);
            setCells(res.data);
        }
        catch (e) {
            console.error('Помилка при додаванні рядка:', e);
        }
    };
    const addColumn = async () => {
        try {
            const res = await axios.post(`${API}/add-column`);
            setCells(res.data);
        }
        catch (e) {
            console.error('Помилка при додаванні стовпця:', e);
        }
    };
    const removeRow = async () => {
        try {
            const res = await axios.post(`${API}/remove-row`);
            setCells(res.data);
        }
        catch (e) {
            const error = e;
            alert('Помилка: ' + (error.response?.data?.error || error.message));
        }
    };
    const removeColumn = async () => {
        try {
            const res = await axios.post(`${API}/remove-column`);
            setCells(res.data);
        }
        catch (e) {
            const error = e;
            alert('Помилка: ' + (error.response?.data?.error || error.message));
        }
    };
    const save = async () => {
        try {
            await axios.post(`${API}/save`);
            alert('Таблиця збережена!');
        }
        catch (e) {
            console.error('Помилка при збереженні:', e);
        }
    };
    const clear = async () => {
        if (window.confirm('Ви впевнені? Всі дані будуть видалені.')) {
            try {
                const res = await axios.post(`${API}/clear`);
                setCells(res.data);
            }
            catch (e) {
                console.error('Помилка при очищенні:', e);
            }
        }
    };
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "header", children: [_jsx("h1", { children: " \u0415\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0430 \u0442\u0430\u0431\u043B\u0438\u0446\u044F" }), _jsx("p", { className: "subtitle", children: "\u041E\u043D\u043B\u0430\u0439\u043D \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u0442\u0430\u0431\u043B\u0438\u0446\u044C \u0437 \u043F\u0430\u0440\u0441\u0438\u043D\u0433\u043E\u043C \u0432\u0438\u0440\u0430\u0437\u0456\u0432" })] }), _jsx("section", { className: "info-panel", children: info && (_jsxs("div", { className: "info-content", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u0412\u0438\u043A\u043E\u043D\u0430\u0432:" }), " \u0421\u0442\u043E\u043B\u044F\u0440 \u041C\u0430\u043A\u0441\u0438\u043C \u041A-24"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0417\u0430\u0432\u0434\u0430\u043D\u043D\u044F:" }), " \u0420\u043E\u0437\u0440\u043E\u0431\u043A\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u0442\u0430\u0431\u043B\u0438\u0446\u0456 \u0437 \u043F\u0430\u0440\u0441\u0438\u043D\u0433\u043E\u043C \u0442\u0430 \u043E\u0431\u0447\u0438\u0441\u043B\u0435\u043D\u043D\u044F\u043C \u0432\u0438\u0440\u0430\u0437\u0456\u0432"] }), _jsx("p", { children: _jsx("strong", { children: "\u041F\u0456\u0434\u0442\u0440\u0438\u043C\u0443\u0432\u0430\u043D\u0456 \u043E\u043F\u0435\u0440\u0430\u0446\u0456\u0457:" }) }), _jsx("ul", { children: info.operations.map((op, idx) => (_jsx("li", { children: op }, idx))) }), _jsxs("p", { children: [_jsx("strong", { children: "\u0420\u043E\u0437\u043C\u0456\u0440 \u0442\u0430\u0431\u043B\u0438\u0446\u0456:" }), " ", info.rows, " \u0440\u044F\u0434\u043A\u0456\u0432 \u00D7 ", info.cols, " \u0441\u0442\u043E\u0432\u043F\u0446\u0456\u0432"] })] })) }), _jsxs("section", { className: "controls", children: [_jsxs("div", { className: "mode-toggle", children: [_jsx("button", { className: viewMode === 'expression' ? 'active' : '', onClick: () => setViewMode('expression'), children: "\u0412\u0438\u0440\u0430\u0437\u0438" }), _jsx("button", { className: viewMode === 'value' ? 'active' : '', onClick: () => setViewMode('value'), children: "\u0417\u043D\u0430\u0447\u0435\u043D\u043D\u044F" })] }), _jsxs("div", { className: "table-controls", children: [_jsx("button", { onClick: addRow, title: "\u0414\u043E\u0434\u0430\u0442\u0438 \u0440\u044F\u0434\u043E\u043A", children: "\u2795 \u0420\u044F\u0434\u043E\u043A" }), _jsx("button", { onClick: addColumn, title: "\u0414\u043E\u0434\u0430\u0442\u0438 \u0441\u0442\u043E\u0432\u043F\u0435\u0446\u044C", children: "\u2795 \u0421\u0442\u043E\u0432\u043F\u0435\u0446\u044C" }), _jsx("button", { onClick: removeRow, title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0440\u044F\u0434\u043E\u043A", children: "\u2796 \u0420\u044F\u0434\u043E\u043A" }), _jsx("button", { onClick: removeColumn, title: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0441\u0442\u043E\u0432\u043F\u0435\u0446\u044C", children: "\u2796 \u0421\u0442\u043E\u0432\u043F\u0435\u0446\u044C" })] }), _jsxs("div", { className: "file-controls", children: [_jsx("button", { onClick: save, className: "btn-save", children: " \u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438" }), _jsx("button", { onClick: clear, className: "btn-clear", children: " \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438" })] })] }), _jsx("section", { className: "table-container", children: cells.length > 0 && (_jsx("table", { className: "spreadsheet", children: _jsx("tbody", { children: cells.map((row, rowIdx) => (_jsx("tr", { children: row.map((cell) => (_jsx("td", { className: `cell ${editingCell === cell.address ? 'editing' : ''} ${cell.error ? 'error' : ''}`, onClick: () => handleCellClick(cell), title: cell.error || cell.address, children: editingCell === cell.address ? (_jsx("input", { autoFocus: true, type: "text", value: editValue, onChange: handleCellChange, onBlur: handleCellBlur, onKeyDown: handleKeyDown, className: "cell-input" })) : (_jsxs("div", { className: "cell-content", children: [_jsx("div", { className: "cell-address", children: cell.address }), _jsx("div", { className: "cell-display", children: cell.error ? (_jsxs("span", { className: "error-text", children: [" ", cell.error] })) : viewMode === 'expression' ? (_jsx("span", { children: cell.expression || '—' })) : (_jsx("span", { children: cell.value })) })] })) }, cell.address))) }, rowIdx))) }) })) })] }));
}
export default App;
