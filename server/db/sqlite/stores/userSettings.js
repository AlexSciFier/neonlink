
export default class UserSettingsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(uuid, 
    maxNumberOfLinks = 20, linkInNewTab = 1, useBgImage = 0, bgImage = "", 
    columns = 3, cardStyle = "default", enableNeonShadows = 1, cardPosition = "top") {
    
    const insertQuery = 
      `INSERT INTO userSettings (
        uuid, maxNumberOfLinks, linkInNewTab, useBgImage, bgImage, columns, cardStyle, enableNeonShadows, cardPosition) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.db.prepare(insertQuery)
      .run(uuid, maxNumberOfLinks, linkInNewTab, useBgImage, bgImage, columns, cardStyle, enableNeonShadows, cardPosition);
  }

  getItem(uuid) {
    const settingsSelectQuery = `SELECT * FROM userSettings WHERE uuid=?`;
    return this.db.prepare(settingsSelectQuery).get(uuid);
  }

  updateItem(uuid, parameter, value) {
    if (uuid === undefined) uuid = "guest";

    const selectQuery = `SELECT uuid FROM userSettings WHERE uuid=:uuid`;
    let foundUUID = this.db.prepare(selectQuery).get({ uuid });
    if (typeof value === "boolean") {
      value = Number(value);
    }

    if (foundUUID) {
      const updateQuery = `UPDATE userSettings SET ${parameter}=:value WHERE uuid=:uuid`;
      return this.db.prepare(updateQuery).run({ uuid, value });
    }
  }
}