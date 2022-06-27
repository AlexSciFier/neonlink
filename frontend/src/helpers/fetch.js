//const BASE_URL = "http://localhost:3333";
const PORT = process.env.NODE_ENV === "production" ? "" : ":3333";
const BASE_URL =
  window.location.protocol + "//" + window.location.hostname + PORT;

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
export async function postFormData(endpoint, object) {
  let url = new URL(endpoint, BASE_URL).toString();
  let formData = new FormData();
  for (const name in object) {
    formData.append(name, object[name]);
  }
  return await fetch(url, {
    method: "POST",
    body: formData,
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
