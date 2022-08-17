const fs = require("fs/promises");
const path = require("path");

async function saveFileToPublic(filename, data) {
  let publicPath = path.join(
    __dirname,
    "../../../public/static/media",
    filename
  );

  return await fs
    .writeFile(publicPath, data)
    .then(() => {
      return true;
    })
    .catch((err) => {
      return err;
    });
}
module.exports = saveFileToPublic;
