import fs from 'fs'
import util from 'util';

import { access, mkdir, writeFile, rm } from "fs/promises";
import { dirname, join } from "path";
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pump = util.promisify(pipeline)

export async function saveFileStreamToPublic(fileName, sourceStream) {
  let dirPath = join(__dirname, "../../../public/static/media/background");
  let publicPath = join(dirPath, fileName);
  await access(dirPath).catch(async (err) => {
    console.error(err.message);
    console.log(`Creating ${dirPath}`);
    await mkdir(dirPath,{recursive:true});
  });

  var destinationStream = fs.createWriteStream(publicPath);
  try {
    await pump(sourceStream, destinationStream)
      .then(() => {
        return true;
      })
      .catch((err) => {
        return err;
      });
  }
  finally
  {
    destinationStream.close();
  }
}

export async function saveFileToPublic(filename, data) {
  let dirPath = join(__dirname, "../../../public/static/media/background");
  let publicPath = join(dirPath, filename);
  await access(dirPath).catch(async (err) => {
    console.error(err.message);
    console.log(`Creating ${dirPath}`);
    await mkdir(dirPath,{recursive:true});
  });

  console.log(`Create ${publicPath}`);
  return await writeFile(publicPath, data)
    .then(() => {
      return true;
    })
    .catch((err) => {
      return err;
    });
}

export async function deleteFileFromPublic(filename) {
  let dirPath = join(__dirname, "../../../public/static/media/background");
  let publicPath = join(dirPath, filename);
  console.log(`Delete ${publicPath}`);
  try {
    await rm(publicPath);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
