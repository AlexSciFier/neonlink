import sqlite from 'better-sqlite3';
import fs from "../../helpers/fileSystem.js"

import { getTableCount } from './common.js';

const migrationFilesFullPath = fs.joinPath(fs.extractDirectory(fs.convertToPath(import.meta.url)), "./migrations/");
const updateFileRegex = new RegExp("^update-([0-9]{5})$");

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

async function getMigrationFiles(version) {
    const items = await fs.listItemsFromDirectory(fs.relativeToExecution(migrationFilesFullPath));
    const mappedItems = await Promise.all(items.map(async item => {
        let filePath = fs.joinPath(migrationFilesFullPath, item);
        let fileData = fs.parsePath(filePath);
        let isValid = updateFileRegex.test(fileData.filename) 
            && Number(fileData.filename.replace(updateFileRegex, "$1")) > version
            && fileData.fileext === ".js" 
            && await fs.checkWhetherPathIsExistingFile(fs.relativeToExecution(filePath));;
        return { value: item, isValid };
      }));
    return mappedItems.filter(item => item.isValid).map(item => item.value).sort();
};

async function applyMigrationFile(db, filename) {
    let filePath = fs.joinPath(migrationFilesFullPath, filename);
    let fileData = fs.parsePath(filePath);

    if (fileData.filename === "initial" || updateFileRegex.test(fileData.filename))
    {
        console.log(`Attempt to apply ${fileData.filename}...`);

        const migrationPlugin = await import(fs.convertToUrl(filePath));
        migrationPlugin.default(db);

        if (fileData.filename === "initial")
        {
            const migrationFiles = await getMigrationFiles(0);
            setDatabaseVersion(db, migrationFiles.length);
        }
        else
        {
            const version = Number(fileData.filename.replace(updateFileRegex, "$1"));
            setDatabaseVersion(db, version);
        }
        return true;
    }
    else
    {
        console.error('Attempt to apply invalid migration file: ' + fileData.name + '!');
        return false;
    }
}

export default class SqliteManager {
    constructor(options) {
        let file = options.path || "./data/bookmarks.sqlite";
        let opts = options.betterSqlite3options || {};
        fs.ensureDirectoryExistsSync(fs.extractDirectory(fs.resolvePath(file)));
        this.db = new sqlite(file, opts);
    }

    close() { 
        if (this.db) {
            this.db.close()
            this.db = undefined;
        }
    }

    async migrate() { 
        if (!this.db) 
            throw new Error("The database connection is not available for migrations");
        
        console.log("Starting migrations...");

        var migrationTablesCount = getTableCount(this.db, 'migrations');
        if (migrationTablesCount == 0) {
            console.log('Applying initial database script...');
            if (!await applyMigrationFile(this.db, 'initial.js'))
                throw new Error("Migration Failed");
        }
        else
        {
            let version = getDatabaseVersion(this.db);
            console.log('Found database version ' + version.toString());
            let migrationFiles = await getMigrationFiles(version);
            console.log('Found ' + migrationFiles.length + ' applicable migration files.');
            for(const migrationFile of migrationFiles) {
                if (!await applyMigrationFile(this.db, migrationFile))
                    throw new Error("Migration failed");
            }
        }
        
        console.log("Migrations completed.");
    }
}