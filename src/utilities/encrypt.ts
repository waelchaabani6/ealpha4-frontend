import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('hGw2HS0GiANBiTZn');
const iv = CryptoJS.enc.Utf8.parse('mB6qVUwsuN0Jjg1G');

export default function encryptMessage(message: string): string {
  return CryptoJS.AES.encrypt(message, key, {
    iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  }).toString();
}
