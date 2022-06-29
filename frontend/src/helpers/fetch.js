const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:3333`;

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
