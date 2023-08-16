import { dataTableExists } from "../common.js";
import { appContext } from "../../../contexts/appContext.js";
import { appSettingsKeys } from "../../../contexts/appSettings.js";

export default async function (db) {
  if (dataTableExists(db, "appSettings") === false) {
    const noLoginValue = !!this.db.prepare("SELECT useNologin FROM appSettings").get()?.useNologin;
    if (noLoginValue) {
      appContext.settings.set(appSettingsKeys.AuthenticationEnabled, false);
      await appSettings.save();
    }

    db.prepare("DROP TABLE appSettings").run();
  }
};