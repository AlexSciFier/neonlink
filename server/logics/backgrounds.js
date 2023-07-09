import { basename, join } from "path";
import { rootPath, saveFileStream, deleteFile } from "../helpers/fileSystem.js";
import { appContext } from "../contexts/appContext.js";

const backgroundsPath = join(rootPath, "public/static/media/background");

export async function addBackground(fileName, sourceStream, uuid) {
  let fileUrl = `/static/media/background/${fileName}`;
  if (appContext.stores.backgrounds.getItemByUrl(fileUrl).length > 0) return false;

  await saveFileStream(backgroundsPath, fileName, sourceStream);
  try {
    let lastRow = appContext.stores.backgrounds.addItem(fileUrl, uuid);
    return { id: lastRow, url: fileUrl };
  } catch (error) {
    await deleteFile(backgroundsPath, fileName);
    throw error;
  }
}

export async function deleteBackground(id, uuid) {
  let backgroundImage = appContext.stores.backgrounds.getItemById(id, uuid);
  if (backgroundImage.length === 0) return false;

  let imageName = basename(backgroundImage[0].url);
  if (appContext.stores.backgrounds.deleteItem(id, uuid) > 0) {
    await deleteFile(backgroundsPath, imageName);
    return true;
  } else {
    return false;
  }
}

export function getAllBackgrounds(uuid) {
  return appContext.stores.backgrounds.getAll(uuid);
}

export function getBackgroundById(id, uuid) {
  return appContext.stores.backgrounds.getItemById(id, uuid);
}

export function getBackgroundByUrl(url, uuid) {
  if (appContext.stores.backgrounds.getItemByUrl(url).length > 0) return false;
  let lastRow = appContext.stores.backgrounds.addItem(url, uuid);
  return { id: lastRow, url };
}
