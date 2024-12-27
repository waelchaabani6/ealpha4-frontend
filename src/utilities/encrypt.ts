import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse(`${import.meta.env.VITE_OBESASS_API_SECRET_KEY}`);
const iv = CryptoJS.enc.Utf8.parse(`${import.meta.env.VITE_OBESASS_API_IV}`);

export default function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString();
}
