import { parse } from "node-html-parser";

/**
 *
 * @param {HTMLElement} doc
 * @param {string} baseUrl
 * @returns {string}
 */
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
/**
 *
 * @param {HTMLElement} doc
 */
function parseTitle(doc) {
  let title = doc.querySelector("title")?.textContent ?? "";
  let desc =
    doc.querySelector("meta[name=description]")?.attributes["content"] ?? "";
  return { title, desc };
}
/**
 *
 * @param {string} html
 * @param {string} baseurl
 */

export async function parseHtml(html, baseurl) {
  let doc = parse(html);
  let icon = parseIcon(doc, baseurl);
  let { title, desc } = parseTitle(doc);
  return { icon, title, desc };
}
