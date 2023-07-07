export default class AppSettingsStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  getNologin() {
    return !!this.db.prepare("SELECT useNologin FROM appSettings").get()?.useNologin;
  }

  setNologin(value) {
    console.log("NOLOGIN", value);
    let nologin = this.db.prepare("SELECT useNologin FROM appSettings").get();
    if (nologin)
      return this.db
        .prepare("UPDATE appSettings SET useNologin = :value")
        .run({ value: Number(value) });
    else
      return this.db
        .prepare("INSERT INTO appSettings (useNologin) VALUES(:value)")
        .run({ value: Number(value) });
  }

}