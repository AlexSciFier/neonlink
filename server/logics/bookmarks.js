import axios from "axios";
import { parse } from "node-html-parser";
import { imgUrlToBase64 } from "../helpers/images.js";
import { stores } from "../db/stores.js"

export function parseBookmarkFile(data) {
  let document = parse(data.toString());
  let urlArrayRaw = document.querySelectorAll("a");

  let urlArray = urlArrayRaw.map((node) => ({
    href: node.getAttribute("href"),
    date: new Date(Number.parseInt(node.getAttribute("add_date")) * 1000 || Date.now()),
    name: node.textContent,
    icon: node.getAttribute("icon"),
  }));

  return urlArray;
}

export async function batchUpdateLinks() {
  let bookmarks = stores.bookmarks.getAllBookmarks(0, 999999);

  bookmarks.bookmarks.forEach(async (bookmark) => {
    let response;
    try {
      response = await axios.get(bookmark.url);
    } catch (err) {
      //   console.error(err.message);
      return;
    }
    if (response.status !== 200) return;
    let html = await response.data;
    let urlInfo = await parseHtml(html, bookmark.url);
    let icon = await imgUrlToBase64(urlInfo.icon);
    stores.bookmarks.updateBookmarkById(
      bookmark.id,
      bookmark.url,
      urlInfo.title || bookmark.title,
      urlInfo.desc || bookmark.desc,
      icon,
      bookmark.categoryId,
      bookmark.tags
    );
  });
  return true;
}

export function parseHtml(html, baseurl) {
  let doc = parse(html);
  let icon = parseIcon(doc, baseurl);
  let { title, desc } = parseTitle(doc);
  return { icon, title, desc };
}

function parseIcon(doc, baseUrl) {
  let icon =
    doc.querySelector('link[rel="icon"]') ||
    doc.querySelector('link[rel="shortcut icon"]');
  if (icon) {
    let path = icon.attributes["href"];
    return new URL(path, baseUrl).toString();
  }
  return new URL("/favicon.ico", baseUrl).toString();
}

function parseTitle(doc) {
  let title = doc.querySelector("title")?.textContent ?? "";
  let desc =
    doc.querySelector("meta[name=description]")?.attributes["content"] ?? "";
  return { title, desc };
}