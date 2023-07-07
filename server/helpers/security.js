import { randomBytes, createHmac } from "node:crypto";

export function generateSalt() {
  let length = 32;
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, 16);
}

export function sha512(password, salt) {
  var hash = createHmac("sha512", salt);
  hash.update(password);
  return hash.digest("hex");
}

export function encodePassword(password) {
  var salt = generateSalt(16);
  var hash = sha512(password, salt);
  return { hash, salt };
}

export function comparePasswords(password, passwordToCompare, salt) {
  var sha512Result = sha512(password, salt);
  return passwordToCompare === sha512Result;
}