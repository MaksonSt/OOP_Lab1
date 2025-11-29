"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const spreadsheet_1 = require("./spreadsheet");
const app = (0, express_1.default)();
const PORT = 3001;
const SAVE_FILE = path_1.default.join(__dirname, '..', 'data.json');
let spreadsheet = new spreadsheet_1.Spreadsheet(15, 8);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const loadSpreadsheet = () => {
    if (fs_1.default.existsSync(SAVE_FILE)) {
        try {
            const data = JSON.parse(fs_1.default.readFileSync(SAVE_FILE, 'utf-8'));
            spreadsheet.fromJSON(data);
        }
        catch (e) {
            console.log('Помилка при завантаженні, використовуємо нову таблицю');
        }
    }
};
const saveSpreadsheet = () => {
    try {
        fs_1.default.writeFileSync(SAVE_FILE, JSON.stringify(spreadsheet.toJSON(), null, 2));
    }
    catch (e) {
        console.error('Помилка при збереженні:', e);
    }
};
app.get('/api/info', (_req, res) => {
    res.json(spreadsheet.getInfo());
});
app.get('/api/spreadsheet', (_req, res) => {
    res.json(spreadsheet.getCells2D());
});
app.post('/api/cell', (req, res) => {
    try {
        const { address, expression } = req.body;
        if (!address || expression === undefined) {
            return res.status(400).json({ error: 'address та expression обов\'язкові' });
        }
        spreadsheet.setCell(address, expression);
        saveSpreadsheet();
        res.json(spreadsheet.getCell(address));
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
app.post('/api/add-row', (_req, res) => {
    spreadsheet.addRow();
    saveSpreadsheet();
    res.json(spreadsheet.getCells2D());
});
app.post('/api/add-column', (_req, res) => {
    spreadsheet.addColumn();
    saveSpreadsheet();
    res.json(spreadsheet.getCells2D());
});
app.post('/api/remove-row', (_req, res) => {
    try {
        spreadsheet.removeRow();
        saveSpreadsheet();
        res.json(spreadsheet.getCells2D());
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
app.post('/api/remove-column', (_req, res) => {
    try {
        spreadsheet.removeColumn();
        saveSpreadsheet();
        res.json(spreadsheet.getCells2D());
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
app.post('/api/save', (_req, res) => {
    saveSpreadsheet();
    res.json({ message: 'Таблиця збережена' });
});
app.post('/api/load', (_req, res) => {
    loadSpreadsheet();
    res.json(spreadsheet.getCells2D());
});
app.post('/api/clear', (_req, res) => {
    spreadsheet = new spreadsheet_1.Spreadsheet(15, 8);
    saveSpreadsheet();
    res.json(spreadsheet.getCells2D());
});
loadSpreadsheet();
app.listen(PORT, () => {
    console.log(` Backend запущений на http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map