const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:3333`;

export async function postJSON(endpoint, json, signal) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal,
  });
}
export async function postFormData(endpoint, object, signal) {
  let url = new URL(endpoint, BASE_URL).toString();
  let formData = new FormData();
  for (const name in object) {
    formData.append(name, object[name]);
  }
  return await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
    signal,
  });
}
/**
 *
 * @param {string} endpoint
 * @param {AbortSignal} signal
 * @returns {Promise<Response>}
 */
export async function getJSON(endpoint, signal) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, { credentials: "include", signal });
}
export async function putJSON(endpoint, json, signal) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "PUT",
    body: JSON.stringify(json),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal,
  });
}
export async function deleteJSON(endpoint, signal) {
  let url = new URL(endpoint, BASE_URL).toString();
  return await fetch(url, {
    method: "DELETE",
    credentials: "include",
    signal,
  });
}
