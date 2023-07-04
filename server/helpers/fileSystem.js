import fs from 'fs'
import util from 'util';
import { pipeline } from 'stream';
import { dirname, join } from "path";
import { fileURLToPath } from 'url';

const pump = util.promisify(pipeline)

export const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../");

export async function ensureDirectoryExists(directoryPath) {
  try {
      await fs.promises.access(directoryPath);
  }
  catch (error)
  {
      await fs.promises.mkdir(directoryPath, { recursive:true });
  }
}

export async function saveFileStream(directory, fileName, sourceStream) {
  let destinationPath = join(directory, fileName);
  
  await ensureDirectoryExists(directory);

  let destinationStream = fs.createWriteStream(destinationPath);
  try {
    await pump(sourceStream, destinationStream);
  }
  finally
  {
    destinationStream.close();
  }
}

export async function saveFileContent(directory, fileName, content) {
  let destinationPath = join(directory, fileName);
  
  await ensureDirectoryExists(destinationPath);
  await fs.promises.writeFile(destinationPath, data);
}

export async function deleteFile(directory, fileName) {
  let destinationPath = join(directory, fileName);

  await fs.promises.unlink(destinationPath);
}