const crypto = require("crypto");

const TOKEN_ALGO = "HS256";

const base64UrlEncode = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (input) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
};

const createSignature = (data, secret) =>
  base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest());

const signJwt = (payload, secret, expiresInSec = 60 * 60 * 24 * 7) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: TOKEN_ALGO, typ: "JWT" };
  const body = { ...payload, iat: now, exp: now + expiresInSec };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const unsigned = `${encodedHeader}.${encodedBody}`;
  const signature = createSignature(unsigned, secret);
  return `${unsigned}.${signature}`;
};

const verifyJwt = (token, secret) => {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedBody, receivedSig] = parts;
  const unsigned = `${encodedHeader}.${encodedBody}`;
  const expectedSig = createSignature(unsigned, secret);

  if (!crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig))) {
    throw new Error("Invalid token signature");
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader));
  if (header.alg !== TOKEN_ALGO) {
    throw new Error("Invalid token algorithm");
  }

  const payload = JSON.parse(base64UrlDecode(encodedBody));
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    throw new Error("Token expired");
  }
  return payload;
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
};

module.exports = {
  signJwt,
  verifyJwt,
  hashPassword,
  verifyPassword,
};

