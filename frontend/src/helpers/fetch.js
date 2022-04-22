const BASE_URL = "http://localhost:3333";

export async function postJSON(endpoint, json) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}
export async function getJSON(endpoint) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, { credentials: "include" });
}
export async function putJSON(endpoint, json) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "PUT",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}
export async function deleteJSON(endpoint, json) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "DELETE",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}
