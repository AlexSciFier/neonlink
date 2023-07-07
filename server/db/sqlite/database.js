import * as fs from 'fs';
import * as path from 'path';
import sqlite from 'better-sqlite3';
import { convertToPath, convertToUrl, ensureDirectoryExistsSync, relativeToExecution } from "../../helpers/fileSystem.js"

import { getTableCount } from './common.js';

const migrationFilesFullPath = path.join(path.dirname(convertToPath(import.meta.url)), "./migrations/");
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

function getMigrationFiles(version) {
    return fs
      .readdirSync(relativeToExecution(migrationFilesFullPath))
      .filter(item => {
        let filePath = path.join(migrationFilesFullPath, item);
        let fileData = path.parse(filePath);
        return updateFileRegex.test(fileData.name) 
            && Number(fileData.name.replace(updateFileRegex, "$1")) > version
            && fileData.ext === ".js" 
            && fs.statSync(relativeToExecution(filePath)).isFile();
      })
      .sort();
};

async function applyMigrationFile(db, filename) {
    let filePath = path.join(migrationFilesFullPath, filename);
    let fileData = path.parse(filePath);

    if (fileData.name === "initial" || updateFileRegex.test(fileData.name))
    {
        console.log(`Attempt to apply ${filename}...`);

        const migrationPlugin = await import(convertToUrl(filePath));
        migrationPlugin.default(db);

        if (fileData.name === "initial")
        {
            setDatabaseVersion(db, getMigrationFiles(0).length);
        }
        else
        {
            let version = Number(fileData.name.replace(updateFileRegex, "$1"));
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
        ensureDirectoryExistsSync(path.dirname(path.resolve(file)));
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
            let migrationFiles = getMigrationFiles(version);
            console.log('Found ' + migrationFiles.length + ' applicable migration files.');
            for(const migrationFile of migrationFiles) {
                if (!await applyMigrationFile(this.db, migrationFile))
                    throw new Error("Migration failed");
            }
        }
        
        console.log("Migrations completed.");
    }
}