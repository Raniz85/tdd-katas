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

class InvalidKeyError extends Error {}

async function decrypt(blob: Crypto, passphrase: string): Promise<string> {
  const key = await getKey(passphrase);
  console.log(`Key: ${base64.stringify(new Uint8Array(key))}`)
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  const { ciphertext, hash }  = blob;
  const ciphertextRaw = base64.parse(ciphertext);
  let plaintext;
  try {
    plaintext = await crypto.subtle.decrypt({
      name: "AES-CBC",
      iv: key,
    }, cryptoKey, ciphertextRaw);
  } catch (OperationError) {
      throw new InvalidKeyError();
  }
  const decryptedHash = buf2hex(await crypto.subtle.digest("SHA-256", plaintext));
  console.log(new TextDecoder().decode(plaintext))
  console.log(`Hash: ${decryptedHash}`)
  if (decryptedHash === hash) {
      return new TextDecoder().decode(plaintext);
  } else {
      throw new InvalidKeyError();
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
        .catch((error) => {
            const errorModal = assertElement("error");
            const errorTitleContainer = assertElement("error-title");
            const errorTextContainer = assertElement("error-text");
            let errorTitle = "Error"
            let errorText = error.toString();
            if (error instanceof InvalidKeyError) {
                errorTitle = "Invalid answer";
                errorText = "That is not the correct answer. Check your implementation and try again.";
            }
            errorTitleContainer.textContent = errorTitle;
            errorTextContainer.textContent = errorText;
            errorModal.style.display = "block";
        })
}