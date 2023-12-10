import { argv } from "node:process";
import { updatePassword } from "./logics/users.js";
import { appContext } from "./contexts/appContext.js";
import { initializeConfig } from "./plugins/001-config.js";
import { initializeDatabase } from "./plugins/010-database.js";

await initializeConfig();
const databaseManager = await initializeDatabase();

const username = argv[2];
const password = argv[3];

function resetPassword(username, password) {
  if (username === undefined) {
    console.error(
      "Username not set. Specify the username as the first argument. ex: npm run reset-password username password"
    );
    return;
  }

  const user = appContext.stores.users.getItemByUsername(username)?.id;
  if (user === undefined) {
    console.error(
      "Username not found. Please check your first argument. ex: npm run reset-password username password"
    );
  }

  if (password === undefined) {
    console.error(
      "Password not set. Specify the password as the second argument. ex: npm run reset-password username password"
    );
    return;
  }

  updatePassword(user, password);
  console.log("Password changed!");
}

resetPassword(username, password);

databaseManager.close();
