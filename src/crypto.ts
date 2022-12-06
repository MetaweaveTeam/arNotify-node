import crypto from "crypto";
import * as dotenv from "dotenv";
import { ENCRYPTION_ALGO, ENCRYPTION_SECRET_KEY } from "./types";
dotenv.config();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);

  // ensure the encryption key is the right length
  let key = crypto
    .createHash("sha256")
    .update(String(ENCRYPTION_SECRET_KEY))
    .digest("base64")
    .substring(0, 32);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, key, iv, {});

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

export function decrypt(content: String, iv: String) {
  let key = crypto
    .createHash("sha256")
    .update(String(ENCRYPTION_SECRET_KEY))
    .digest("base64")
    .substring(0, 32);

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGO,
    key,
    Buffer.from(iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}
