import fs from "../helpers/fileSystem.js";
import { readFileContent, saveFileContent } from "../helpers/fileSystem.js";

const defaultSettings = {
  authenticationEnabled: true,
  userRegistrationEnabled: true,
  sessionLengthInSeconds: 8 * 30 * 24 * 60 * 60 // 8 months
}

let currentSettings = structuredClone(defaultSettings);

export const appSettingsKeys = {
  AuthenticationEnabled: "authenticationEnabled",
  UserRegistrationEnabled: "userRegistration",
  sessionLengthInSeconds: "sessionLengthInSeconds"
}

export class AppSettings {
  constructor(settingsPath) {
    this.settingsPath = settingsPath;
  }

  get(key) {
    return currentSettings[key];
  }

  set(key, value) {
    currentSettings[key] = value;
    console.log(`Changed settings ${key} to ${value}`);
  }

  async load() {
    const fileContent = await readFileContent(this.settingsPath);
    currentSettings = JSON.parse(fileContent);
  }

  async save() {
    const directory = fs.extractDirectory(this.settingsPath);
    const filename = fs.parsePath(this.settingsPath).basename; 
    await saveFileContent(directory, filename, JSON.stringify(currentSettings));
    console.log("Settings saved.");
  }
}