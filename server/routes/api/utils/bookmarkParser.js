import { parse } from "node-html-parser";

/**
 *
 * @param {Buffer} data
 */
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
