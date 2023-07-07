export function columnExists(db, tableName, columnName) {
  let columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.map((col) => col.name).includes(columnName);
}

export function getTableCount(db, tableName) {
  return db
    .prepare(
      "SELECT count(*) as count FROM sqlite_master WHERE type=? AND name=?"
    )
    .get("table", tableName).count;
}
