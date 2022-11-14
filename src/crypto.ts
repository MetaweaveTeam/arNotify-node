const cryptojs = require("crypto");
require("dotenv").config();

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY;

export function encrypt(text: String) {
  const iv = cryptojs.randomBytes(16);

  const cipher = cryptojs.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

export function decrypt(content: String, iv: String) {
  const decipher = cryptojs.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}
