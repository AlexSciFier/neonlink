const Database = require("better-sqlite3");
const { changePassword, getUser } = require("./db/users");

const argv = require("node:process").argv;

const username = argv[2];
const password = argv[3];

if (username === undefined) {
  console.error(
    "Username not set. Specify the username as the first argument. ex: npm run reset-password username password"
  );
  return;
}

if (password === undefined) {
  console.error(
    "Password not set. Specify the password as the second argument. ex: npm run reset-password username password"
  );
  return;
}
changePassword(username, password);

console.log("Password changed!");
