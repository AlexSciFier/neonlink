import sharp from "sharp";
import fileSystem from "./fileSystem.js";
import fs from "fs/promises";
import path from "node:path";

const backgroundsPath = path.join(
  fileSystem.rootPath,
  "public/static/media/background"
);
const backgroundCachePath = path.join(backgroundsPath, "cache");

/**
 *
 * @param {string} imageName
 * @param {number?} width
 * @param {number?} height
 * @returns {Promise<Buffer>}
 */
export async function getOptimizedImage(imageName, width, height) {
  if (width && height === undefined) {
    height = width;
    return getImageBySize(imageName, width, height);
  }
  if (width && height) {
    return getImageBySize(imageName, width, height);
  }
  return getImage(imageName);
}

async function getImage(imageName) {
  const originalFilePath = path.join(backgroundsPath, imageName);

  await fileSystem.ensureDirectoryExists(backgroundCachePath);

  const optimizedFileName = imageName.replace(path.extname(imageName), ".webp");
  const optimizedFilePath = path.join(backgroundCachePath, optimizedFileName);

  const optimizedImageExist = await fileSystem.checkWhetherPathIsExistingFile(
    optimizedFilePath
  );

  if (optimizedImageExist) {
    return await fs.readFile(optimizedFilePath);
  } else {
    let optimizedImage = sharp(originalFilePath)
      .webp({ quality: 80 })
      .withMetadata()
      .toBuffer();
    await fs.writeFile(optimizedFilePath, await optimizedImage);
    return optimizedImage;
  }
}

async function getImageBySize(imageName, width, height) {
  await fileSystem.ensureDirectoryExists(backgroundCachePath);

  const originalFilePath = path.join(backgroundsPath, imageName);

  const optimizedFileNameWithoutExt = imageName.replace(
    path.extname(imageName),
    ""
  );
  const optimizedFileName = `${optimizedFileNameWithoutExt}_${width}_${height}.webp`;
  const minimizedFilePath = path.join(backgroundCachePath, optimizedFileName);

  const minimizedImageExist = await fileSystem.checkWhetherPathIsExistingFile(
    minimizedFilePath
  );

  if (minimizedImageExist) {
    return await fs.readFile(minimizedFilePath);
  } else {
    let minimizedImage = sharp(originalFilePath)
      .resize(width, height)
      .webp({ quality: 80 })
      .withMetadata()
      .toBuffer();
    await fs.writeFile(minimizedFilePath, await minimizedImage);
    return minimizedImage;
  }
}
