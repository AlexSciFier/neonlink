import fs from 'fs';
import util from 'util';
import { join, relative } from 'path';
import { pipeline } from 'stream';
import { fileURLToPath, pathToFileURL } from 'url';

const pump = util.promisify(pipeline)

export const rootPath = process.cwd();

export function relativeToExecution(path) {
  return relative(rootPath, path);
}

export function relativeToPath(from, to) {
  return relative(from, fileURLToPath(to));
}

export function convertToPath(url) {
  return fileURLToPath(url);
}

export function convertToUrl(path) {
  return pathToFileURL(path)?.href;
}

export function ensureDirectoryExistsSync(directoryPath) {
  let accessError;
  const accessCallback = (err) => { if (err) { accessError = err } }
  const mkdirCallback = (err) => { if (err) { console.error(accessError); throw (err); }}

  if (!fs.access(directoryPath, accessCallback))
  {
    fs.mkdir(directoryPath, { recursive: true }, mkdirCallback);
  }
}

export async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.promises.access(directoryPath);
  }
  catch (error) {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  }
}

export async function saveFileStream(directory, fileName, sourceStream) {
  let destinationPath = join(directory, fileName);

  await ensureDirectoryExists(directory);

  let destinationStream = fs.createWriteStream(destinationPath);
  try {
    await pump(sourceStream, destinationStream);
  }
  finally {
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