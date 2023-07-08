import axios from "axios";

export async function imgUrlToBase64(url) {
  try {
    let image = await axios.get(url, { responseType: "arraybuffer" });
    let raw = Buffer.from(image.data).toString("base64");
    return "data:" + image.headers["content-type"] + ";base64," + raw;
  } catch (error) {
    console.error(error.message);
    return undefined;
  }
}
