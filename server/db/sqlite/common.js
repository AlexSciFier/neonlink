export function columnExists(db, tableName, columnName) {
    let columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.map((col) => col.name).includes(columnName);
}

export function getTableCount(db, tableName) {
    return db
        .prepare("SELECT count(*) as count FROM sqlite_master WHERE type=? AND name=?")
        .get('table', tableName)
        .count;
};

export function setDatabaseVersion(db, version) {
    console.log('Updating version number to ' + version.toString() + '...');
    return db
      .prepare("INSERT INTO migrations(name, version) VALUES('database', ?) ON CONFLICT(name) DO UPDATE SET version=?")
      .run(version, version);
};

export function getDatabaseVersion (db) {
    let res = db.prepare("SELECT version FROM migrations WHERE name='database'").get();
    return res === undefined ? 0 : res.version;
};
