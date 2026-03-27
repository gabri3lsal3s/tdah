import { today } from "./utils";

export interface Entry {
  id?: number;
  entry_date: string;
  dose_mg: number | null;
  taken_at: string;
  sleep_hours: number | null;
  ate_well: number;
  s1_attention: number;
  s1_organize: number;
  s1_restless: number;
  s1_impulsive: number;
  s2_mindnonstop: number;
  s2_thoughts: number;
  s2_multithink: number;
  s2_brainfog: number;
  s3_blunting: number;
  s3_creativity: number;
  s3_appetite: number;
  s3_fatigue: number;
  s3_irritable: number;
  s3_sleep: number;
  notes: string;
}

/* ─── Local SQLite (sql.js via CDN) ─── */
const STORAGE_KEY = "tdah_db";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

async function getDb() {
  if (db) return db;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const init = (window as any).initSqlJs as (cfg: unknown) => Promise<any>;
  const SQL = await init({ locateFile: (f: string) => `https://sql.js.org/dist/${f}` });

  const saved = localStorage.getItem(STORAGE_KEY);
  db = saved
    ? new SQL.Database(Uint8Array.from(atob(saved), (c) => c.charCodeAt(0)))
    : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_date  TEXT NOT NULL UNIQUE,
      dose_mg     REAL,
      taken_at    TEXT DEFAULT '',
      sleep_hours REAL,
      ate_well    INTEGER DEFAULT 0,
      s1_attention INTEGER DEFAULT 0, s1_organize INTEGER DEFAULT 0,
      s1_restless  INTEGER DEFAULT 0, s1_impulsive INTEGER DEFAULT 0,
      s2_mindnonstop INTEGER DEFAULT 0, s2_thoughts INTEGER DEFAULT 0,
      s2_multithink  INTEGER DEFAULT 0, s2_brainfog INTEGER DEFAULT 0,
      s3_blunting  INTEGER DEFAULT 0, s3_creativity INTEGER DEFAULT 0,
      s3_appetite  INTEGER DEFAULT 0, s3_fatigue   INTEGER DEFAULT 0,
      s3_irritable INTEGER DEFAULT 0, s3_sleep     INTEGER DEFAULT 0,
      notes       TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now'))
    );
  `);
  persist();
  return db;
}

function persist() {
  if (!db) return;
  const data: Uint8Array = db.export();
  localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...data)));
}

/* ─── Public API ─── */
export async function upsertEntry(entry: Entry): Promise<void> {
  const d = await getDb();
  const s = sanitizeEntry(entry);
  d.run(
    `INSERT INTO entries (
      entry_date, dose_mg, taken_at, sleep_hours, ate_well,
      s1_attention, s1_organize, s1_restless, s1_impulsive,
      s2_mindnonstop, s2_thoughts, s2_multithink, s2_brainfog,
      s3_blunting, s3_creativity, s3_appetite, s3_fatigue, s3_irritable, s3_sleep,
      notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(entry_date) DO UPDATE SET
      dose_mg=excluded.dose_mg, taken_at=excluded.taken_at,
      sleep_hours=excluded.sleep_hours, ate_well=excluded.ate_well,
      s1_attention=excluded.s1_attention, s1_organize=excluded.s1_organize,
      s1_restless=excluded.s1_restless, s1_impulsive=excluded.s1_impulsive,
      s2_mindnonstop=excluded.s2_mindnonstop, s2_thoughts=excluded.s2_thoughts,
      s2_multithink=excluded.s2_multithink, s2_brainfog=excluded.s2_brainfog,
      s3_blunting=excluded.s3_blunting, s3_creativity=excluded.s3_creativity,
      s3_appetite=excluded.s3_appetite, s3_fatigue=excluded.s3_fatigue,
      s3_irritable=excluded.s3_irritable, s3_sleep=excluded.s3_sleep,
      notes=excluded.notes`,
    [
      s.entry_date, s.dose_mg, s.taken_at, s.sleep_hours, s.ate_well,
      s.s1_attention, s.s1_organize, s.s1_restless, s.s1_impulsive,
      s.s2_mindnonstop, s.s2_thoughts, s.s2_multithink, s.s2_brainfog,
      s.s3_blunting, s.s3_creativity, s.s3_appetite, s.s3_fatigue,
      s.s3_irritable, s.s3_sleep, s.notes,
    ]
  );
  persist();
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
  const d = await getDb();
  const res = d.exec(`SELECT * FROM entries WHERE entry_date = ?`, [date]);
  if (!res.length || !res[0].values.length) return null;
  return rowToEntry(res[0].columns, res[0].values[0]);
}

export async function getAllEntries(): Promise<Entry[]> {
  const d = await getDb();
  const res = d.exec(`SELECT * FROM entries ORDER BY entry_date DESC`);
  if (!res.length) return [];
  return res[0].values.map((v: (string | number | null)[]) => rowToEntry(res[0].columns, v));
}

export async function deleteEntry(id: number): Promise<void> {
  const d = await getDb();
  d.run(`DELETE FROM entries WHERE id = ?`, [id]);
  persist();
}

export async function countEntries(): Promise<number> {
  const d = await getDb();
  const res = d.exec(`SELECT COUNT(*) FROM entries`);
  return (res[0]?.values[0]?.[0] as number) ?? 0;
}

export async function importData(entries: Entry[]): Promise<void> {
  const d = await getDb();
  // We use the same upsert logic to merge data safely
  for (const entry of entries) {
    if (!entry.entry_date) continue;
    await upsertEntry(entry);
  }
}

function rowToEntry(cols: string[], values: (string | number | null)[]): Entry {
  const obj: Record<string, unknown> = {};
  cols.forEach((c, i) => (obj[c] = values[i]));
  return obj as unknown as Entry;
}

function sanitizeEntry(e: Partial<Entry>): Entry {
  return {
    entry_date: e.entry_date || today(),
    dose_mg: e.dose_mg !== undefined ? e.dose_mg : null,
    taken_at: e.taken_at || "",
    sleep_hours: e.sleep_hours !== undefined ? e.sleep_hours : null,
    ate_well: Number(e.ate_well) || 0,
    s1_attention: Number(e.s1_attention) || 0,
    s1_organize: Number(e.s1_organize) || 0,
    s1_restless: Number(e.s1_restless) || 0,
    s1_impulsive: Number(e.s1_impulsive) || 0,
    s2_mindnonstop: Number(e.s2_mindnonstop) || 0,
    s2_thoughts: Number(e.s2_thoughts) || 0,
    s2_multithink: Number(e.s2_multithink) || 0,
    s2_brainfog: Number(e.s2_brainfog) || 0,
    s3_blunting: Number(e.s3_blunting) || 0,
    s3_creativity: Number(e.s3_creativity) || 0,
    s3_appetite: Number(e.s3_appetite) || 0,
    s3_fatigue: Number(e.s3_fatigue) || 0,
    s3_irritable: Number(e.s3_irritable) || 0,
    s3_sleep: Number(e.s3_sleep) || 0,
    notes: e.notes || "",
  };
}
