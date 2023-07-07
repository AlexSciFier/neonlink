import * as fs from 'fs';
import * as path from 'path';
import sqlite from 'better-sqlite3';

import { getTableCount, getDatabaseVersion, setDatabaseVersion } from './common.js';

const migrationFilesDirectory = "./db/sqlite/migrations/";
const updateFileRegex = new RegExp("^update-([0-9]{5})$");

function getMigrationFiles(version) {
    return fs
      .readdirSync(migrationFilesDirectory)
      .filter(item => {
        let filePath = path.join(migrationFilesDirectory, item);
        let fileData = path.parse(filePath);
        return updateFileRegex.test(fileData.name) 
            && Number(fileData.name.replace(updateFileRegex, "$1")) > version
            && fileData.ext === ".js" 
            && fs.statSync(filePath).isFile();
      })
      .sort();
};

async function applyMigrationFile(db, filename) {
    let filePath = path.join(migrationFilesDirectory, filename);
    let fileData = path.parse(filePath);

    if (fileData.name === "initial" || updateFileRegex.test(fileData.name))
    {
        console.log('Attempt to apply ' + fileData.name + '...');

        const migrationPlugin = await import(filePath);
        migrationPlugin(db);

        if (fileData.name === "initial")
        {
            setDatabaseVersion(db, GetDatabaseModules(0).length);
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
            await applyMigrationFile(this.db, 'initial.sql');
        }
        else
        {
            let version = getDatabaseVersion(this.db);
            console.log('Found database version ' + version.toString());
            let migrationFiles = getMigrationFiles(version);
            console.log('Found ' + migrationFiles.length + ' applicable migration files.');
            for(const migrationFile of migrationFiles) {
                await applyMigrationFile(this.db, migrationFile)
            }
        }
        
        console.log("Migrations completed.");
    }
}