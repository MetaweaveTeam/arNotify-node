import crypto from "crypto";
import * as dotenv from "dotenv";
import { ENCRYPTION_ALGO, ENCRYPTION_SECRET_KEY } from "./types";
dotenv.config();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGO,
    ENCRYPTION_SECRET_KEY,
    iv,
    {}
  );

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

export function decrypt(content: String, iv: String) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGO,
    ENCRYPTION_SECRET_KEY,
    Buffer.from(iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}
