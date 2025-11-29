import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Spreadsheet } from './spreadsheet';

const app = express();
const PORT = 3001;
const SAVE_FILE = path.join(__dirname, '..', 'data.json');

let spreadsheet = new Spreadsheet(15, 8);

app.use(cors());
app.use(express.json());

const loadSpreadsheet = (): void => {
  if (fs.existsSync(SAVE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf-8'));
      spreadsheet.fromJSON(data);
    } catch (e) {
      console.log('Помилка при завантаженні, використовуємо нову таблицю');
    }
  }
};

const saveSpreadsheet = (): void => {
  try {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(spreadsheet.toJSON(), null, 2));
  } catch (e) {
    console.error('Помилка при збереженні:', e);
  }
};

app.get('/api/info', (_req: Request, res: Response) => {
  res.json(spreadsheet.getInfo());
});

app.get('/api/spreadsheet', (_req: Request, res: Response) => {
  res.json(spreadsheet.getCells2D());
});

app.post('/api/cell', (req: Request, res: Response) => {
  try {
    const { address, expression } = req.body;
    if (!address || expression === undefined) {
      return res.status(400).json({ error: 'address та expression обов\'язкові' });
    }
    spreadsheet.setCell(address, expression);
    saveSpreadsheet();
    res.json(spreadsheet.getCell(address));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/add-row', (_req: Request, res: Response) => {
  spreadsheet.addRow();
  saveSpreadsheet();
  res.json(spreadsheet.getCells2D());
});

app.post('/api/add-column', (_req: Request, res: Response) => {
  spreadsheet.addColumn();
  saveSpreadsheet();
  res.json(spreadsheet.getCells2D());
});

app.post('/api/remove-row', (_req: Request, res: Response) => {
  try {
    spreadsheet.removeRow();
    saveSpreadsheet();
    res.json(spreadsheet.getCells2D());
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/remove-column', (_req: Request, res: Response) => {
  try {
    spreadsheet.removeColumn();
    saveSpreadsheet();
    res.json(spreadsheet.getCells2D());
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/save', (_req: Request, res: Response) => {
  saveSpreadsheet();
  res.json({ message: 'Таблиця збережена' });
});

app.post('/api/load', (_req: Request, res: Response) => {
  loadSpreadsheet();
  res.json(spreadsheet.getCells2D());
});

app.post('/api/clear', (_req: Request, res: Response) => {
  spreadsheet = new Spreadsheet(15, 8);
  saveSpreadsheet();
  res.json(spreadsheet.getCells2D());
});

loadSpreadsheet();

app.listen(PORT, () => {
  console.log(`✅ Backend запущений на http://localhost:${PORT}`);
});

