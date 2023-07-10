import { argv } from "node:process";
import { updateIsAdmin } from "./logics/users.js";
import { appContext } from "./contexts/appContext.js";
import { initializeConfig } from "./plugins/001-config.js";
import { initializeDatabase } from "./plugins/010-database.js";

await initializeConfig();
const databaseManager = await initializeDatabase();

const username = argv[2];

function SwitchAdmin(username, password) {
  if (username === undefined) {
    console.error(
      "Username not set. Specify the username as the first argument. ex: npm run switch-admin username password"
    );
    return;
  }

  const user = appContext.stores.users.getItemByUsername(username)?.id;
  if (user === undefined) {
    console.error(
      "Username not found. Please check your first argument. ex: npm run switch-admin username password"
    );
  }

  updateIsAdmin(user.id, !user.isAdmin);
  console.log(`Admin flag changed to ${!user.isAdmin}!`);
}

SwitchAdmin(username, password);

databaseManager.close();
