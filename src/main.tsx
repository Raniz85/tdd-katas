import './index.css';
import { base64 } from "rfc4648";

async function getKey(passphrase: string): Promise<ArrayBuffer> {
  const passwordBuffer = new TextEncoder().encode(passphrase);
  const cryptoKey = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits']);
  return await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: passwordBuffer,
      iterations: 100000,
    },
    cryptoKey,
    128
  );
}

function buf2hex(buffer: ArrayBuffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}
interface Crypto {
    hash: string,
    ciphertext: string,
}
async function decrypt(blob: Crypto, passphrase: string): Promise<string> {
  const key = await getKey(passphrase);
  console.log(`Key: ${base64.stringify(new Uint8Array(key))}`)
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  const { ciphertext, hash }  = blob;
  const ciphertextRaw = base64.parse(ciphertext);
  const plaintext = await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: key,
  }, cryptoKey, ciphertextRaw);
  const decryptedHash = buf2hex(await crypto.subtle.digest("SHA-256", plaintext));
  console.log(new TextDecoder().decode(plaintext))
  console.log(`Hash: ${decryptedHash}`)
  if (decryptedHash === hash) {
      return new TextDecoder().decode(plaintext);
  } else {
      throw new Error("Invalid passphrase");
  }
}

async function loadAndDecrypt(file: string, passphrase: string, target: HTMLElement) {
    const response = await fetch(`${file}`);
    const data = await response.json();
    const content = await decrypt(data, passphrase);
    const node = document.createRange().createContextualFragment(content);
    target.appendChild(node);
}

function assertElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (element == null) {
        throw new Error(`Could not find element with id ${id}`);
    }
    return element;
}

export async function attemptAnswer(file: string, form: string, target: string) {
    const inputs = Array.from(assertElement(form).getElementsByTagName("input"));
    const passphrase = inputs.map(input => input.value).join("");
    const targetNode = assertElement(target);
    const formNode = assertElement(form);
    loadAndDecrypt(file, passphrase, targetNode)
        .then(() => {
            formNode.hidden = true;
        })
        .catch(() => {
            const div = document.createElement("div");
            div.setAttribute("class", "wrong-answer");
            div.appendChild(document.createTextNode("That is not the correct answer"));
        })
}