import { basename, join } from "path";
import { rootPath, saveFileStream, deleteFile } from "../helpers/fileSystem.js";
import { stores } from "../db/stores.js";

const backgroundsPath = join(rootPath, "public/static/media/background");

export async function addBackground(fileName, sourceStream, uuid) {
    let fileUrl = `/static/media/background/${fileName}`;
    if (stores.backgrounds.getItemByUrl(fileUrl).length > 0)
        return false;

    await saveFileStream(backgroundsPath, fileName, sourceStream);
    try {
        let lastRow = stores.backgrounds.addItem(fileUrl, uuid);
        return { id: lastRow, url: fileUrl };
    }
    catch(error)
    {
        await deleteFile(backgroundsPath, fileName);
        throw(error);
    }
}

export async function deleteBackground(id, uuid) {
    let backgroundImage = stores.backgrounds.getItemById(id, uuid);
    if (backgroundImage.length === 0) 
      return false;

    let imageName = basename(imageInDB[0].url);
    if (stores.backgrounds.deleteItem(id, uuid) > 0) {
      await deleteFile(backgroundsPath, imageName);
      return true;
    }
    else {
      return false;
    }
}

export function getAllBackgrounds(uuid) {
    return stores.backgrounds.getAll(uuid);
}

export function getBackgroundById(id, uuid) {
    return stores.backgrounds.getItemById(id, uuid);
}

export function getBackgroundByUrl(url, uuid) {
  if (stores.backgrounds.getItemByUrl(url).length > 0)
    return false;
  let lastRow = stores.backgrounds.addItem(url, uuid);
  return { id: lastRow, url };
}