import path, { basename, join } from "path";
import { rootPath, saveFileStream, deleteFile } from "../helpers/fileSystem.js";
import { appContext } from "../contexts/appContext.js";
import { URLSearchParams } from "url";

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
    return { id: lastRow, url: fileUrl, thumbs:getThumbnails(fileName) };
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
  let items = appContext.stores.backgrounds.getAll(userId);
  return items.map((item) => {
    if (item.url.startsWith("/")) {
      const imageName = path.basename(item.url);
      return { ...item, thumbs:getThumbnails(imageName) };
    }
    return item;
  });
}

function getThumbnails(imageName) {
  return {
    small: getThumbnailUrl(imageName, 150, 150),
    medium: getThumbnailUrl(imageName, 300, 300),
    large: getThumbnailUrl(imageName, 600, 600),
  };
}

function getThumbnailUrl(imageName, w, h) {
  const urlEndpoint = "/api/image/" + imageName;
  const urlParams = new URLSearchParams();
  urlParams.append("w", w);
  urlParams.append("h", h);
  return urlEndpoint + "?" + urlParams.toString();
}

export function getBackgroundById(id, userId) {
  const item = appContext.stores.backgrounds.getItemById(id, userId)[0];
  if (item.url.startsWith("/")) {
    const imageName = path.basename(item.url);
    const thumbs = {
      small: getThumbnailUrl(imageName, 150, 150),
      medium: getThumbnailUrl(imageName, 300, 300),
      large: getThumbnailUrl(imageName, 600, 600),
    };
    return { ...item, thumbs };
  }
  return item;
}

export function isBackgroundExist(url, userId) {
  if (appContext.stores.backgrounds.getItemByUrl(url).length > 0) return true;
  return false
}
