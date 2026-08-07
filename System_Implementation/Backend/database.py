import sqlite3

conn = sqlite3.connect("bp_records.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    sbp REAL NOT NULL,
    dbp REAL NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    modality_type TEXT NOT NULL,
    signal_config TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS relatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    relative_name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT
)
""")

conn.commit()