import { basename, join } from "path";
import { rootPath, saveFileStream, deleteFile } from "../helpers/fileSystem.js";
import { appContext } from "../contexts/appContext.js";

const backgroundsPath = join(rootPath, "public/static/media/background");

export async function addBackground(fileName, sourceStream, userId) {
  let fileUrl = `/static/media/background/${fileName}`;
  if (appContext.stores.backgrounds.getItemByUrl(fileUrl).length > 0)
    return false;

  await saveFileStream(backgroundsPath, fileName, sourceStream);
  if (sourceStream.truncated) {
    return false;
  }
  try {
    let lastRow = appContext.stores.backgrounds.addItem(fileUrl, userId);
    return { id: lastRow, url: fileUrl };
  } catch (error) {
    await deleteFile(backgroundsPath, fileName);
    console.error(error);
    return false;
  }
}

export async function deleteBackground(id, userId) {
  let backgroundImage = appContext.stores.backgrounds.getItemById(id, userId);
  if (backgroundImage.length === 0) return false;

  let imageName = basename(backgroundImage[0].url);
  if (appContext.stores.backgrounds.deleteItem(id, userId) > 0) {
    try {
      await deleteFile(backgroundsPath, imageName);
    } catch (error) {
      console.error(error);
    }
    return true;
  } else {
    return false;
  }
}

export function getAllBackgrounds(userId) {
  return appContext.stores.backgrounds.getAll(userId);
}

export function getBackgroundById(id, userId) {
  return appContext.stores.backgrounds.getItemById(id, userId);
}

export function getBackgroundByUrl(url, userId) {
  if (appContext.stores.backgrounds.getItemByUrl(url).length > 0) return false;
  let lastRow = appContext.stores.backgrounds.addItem(url, userId);
  return { id: lastRow, url };
}
