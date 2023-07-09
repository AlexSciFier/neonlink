import fs from "../helpers/fileSystem.js";
import { readFileContent, saveFileContent } from "../helpers/fileSystem.js";

const defaultSecrets = {
  cookie: "6139a3c94e6b61063c3834942338e2be",
  database: { type: "sqlite", settings: {} }
}

let currentSecrets = structuredClone(defaultSecrets);

export const appSecretKeys = {
  Cookie: "cookie",
  Database: "database"
}

export class AppSecrets {
  constructor(secretPath) {
    this.secretPath = secretPath;
  }

  get(key) {
    return currentSecrets[key];
  }

  set(key, value) {
    currentSecrets[key] = value;
    console.log(`Changed secret ${key}`);
  }

  async load() {
    const fileContent = await readFileContent(this.secretPath);
    currentSecrets = JSON.parse(fileContent);
  }

  async save() {
    const directory = fs.extractDirectory(this.secretPath);
    const filename = fs.parsePath(this.secretPath).basename; 
    await saveFileContent(directory, filename, JSON.stringify(currentSecrets));
    console.log("Secrets saved.")
  }
}