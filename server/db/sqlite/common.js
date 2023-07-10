export function databaseIsEmpty(db) {
  const selectQuery =
    "SELECT count(*) as count FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'";
  return db.prepare(selectQuery).get().count == 0;
}

export function dataColumnExists(db, tableName, columnName) {
  const selectQuery = `PRAGMA table_info(${tableName})`;
  return db
    .prepare(selectQuery)
    .all()
    .map((col) => col.name)
    .includes(columnName);
}

export function dataTableExists(db, tableName) {
  return dataTypeExists(db, "table", tableName);
}

function dataTypeExists(db, dataType, dataName) {
  const selectQuery =
    "SELECT count(*) as count FROM sqlite_master WHERE type=? AND name=?";
  return (db.prepare(selectQuery).get(dataType, dataName).count || 0) > 0;
}
