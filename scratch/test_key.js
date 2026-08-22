import fs from "fs";
import crypto from "crypto";

process.loadEnvFile();

const privateKey = process.env.GCP_PRIVATE_KEY;
if (!privateKey) {
  console.log("No GCP_PRIVATE_KEY found in .env");
  process.exit(1);
}

try {
  let cleanPrivateKey = privateKey.replace(/\\n/g, "\n").replace(/"/g, "");
  // Try removing the leading 'n' or 'N' after each newline
  cleanPrivateKey = cleanPrivateKey.replace(/\n[nN]/g, "\n");
  
  const sign = crypto.createSign("RSA-SHA256");
  sign.update("test");
  sign.sign(cleanPrivateKey);
  console.log("KEY DECODING WITH N-STRIP SUCCESS!");
} catch (err) {
  console.error("KEY DECODING WITH N-STRIP FAIL:", err.message);
}
