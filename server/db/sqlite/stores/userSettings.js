export default class UserSettingsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(
    userId,
    maxNumberOfLinks = 20,
    linkInNewTab = 1,
    useBgImage = 0,
    bgImage = "",
    columns = 3,
    cardStyle = "default",
    enableNeonShadows = 1,
    cardPosition = "top"
  ) {
    const insertQuery = `INSERT INTO userSettings (
        id, maxNumberOfLinks, linkInNewTab, useBgImage, 
        bgImage, columns, cardStyle, enableNeonShadows, 
        cardPosition) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    return this.db
      .prepare(insertQuery)
      .run(
        userId,
        maxNumberOfLinks,
        linkInNewTab,
        useBgImage,
        bgImage,
        columns,
        cardStyle,
        enableNeonShadows,
        cardPosition
      );
  }

  getItem(userId) {
    const settingsSelectQuery = `SELECT * FROM userSettings WHERE id=?`;
    return this.db.prepare(settingsSelectQuery).get(userId);
  }

  updateItem(userId, parameter, value) {
    const updateQuery = `UPDATE userSettings SET ${parameter}=:value WHERE id=:userId`;
    if (typeof value === "boolean") {
      value = Number(value);
    }
    return this.db.prepare(updateQuery).run({ userId, value });
  }
}
