const fs = require("fs/promises");
const path = require("path");

async function saveFileToPublic(filename, data) {
  let dirPath = path.join(__dirname, "../../../public/static/media/background");
  let publicPath = path.join(dirPath, filename);
  await fs.access(dirPath).catch(async (err) => {
    console.error(err.message);
    console.log(`Creating ${dirPath}`);
    await fs.mkdir(dirPath,{recursive:true});
  });

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
  let dirPath = path.join(__dirname, "../../../public/static/media/background");
  let publicPath = path.join(dirPath, filename);
  console.log(`Delete ${publicPath}`);
  try {
    await fs.rm(publicPath);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { saveFileToPublic, deleteFileFromPublic };
