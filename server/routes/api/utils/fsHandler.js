const fs = require("fs/promises");
const path = require("path");

async function saveFileToPublic(filename, data) {
  let publicPath = path.join(
    __dirname,
    "../../../public/static/media",
    filename
  );
  console.log(`Create ${publicPath}`);
  return await fs
    .writeFile(publicPath, data)
    .then(() => {
      return true;
    })
    .catch((err) => {
      return err;
    });
}
async function deleteFileFromPublic(filename) {
  let publicPath = path.join(
    __dirname,
    "../../../public/static/media",
    filename
  );
  console.log(`Delete ${publicPath}`);
  return await fs.rm(publicPath);
}

module.exports = { saveFileToPublic, deleteFileFromPublic };
