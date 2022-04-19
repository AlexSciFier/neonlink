export async function postJSON(url, json) {
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}
export async function getJSON(url) {
  return await fetch(url, { credentials: "include" });
}
