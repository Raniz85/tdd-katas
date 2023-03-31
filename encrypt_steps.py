#!/usr/bin/env python3
import base64
import glob
import os
import re
import json
from typing import Dict

from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def derive_key(passphrase: str) -> bytes:
    return PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=16,
        salt=passphrase.encode(),
        iterations=100000,
    ).derive(passphrase.encode())


def encrypt(passphrase: str, data: str) -> Dict[str, str]:
    key = derive_key(passphrase)
    print(f"  Key: {base64.b64encode(key).decode()}")

    digest = hashes.Hash(hashes.SHA256())
    digest.update(data.encode())
    data_hash = digest.finalize()

    padder = padding.PKCS7(128).padder()
    plaintext = padder.update(data.encode()) + padder.finalize()

    enc = Cipher(algorithms.AES128(key), modes.CBC(key)).encryptor()
    ciphertext = base64.b64encode(enc.update(plaintext) + enc.finalize()).decode()

    return {
        "ciphertext": ciphertext,
        "hash": data_hash.hex(),
    }


PASSPHRASE_REGEX = re.compile(r"^\s*passphrase=\"(?P<passphrase>[^\"]+)\"\s*$")


def encrypt_html(source: str) -> Dict[str, str]:
    lines = source.splitlines()
    first = lines[0]
    match = PASSPHRASE_REGEX.match(first)
    if not match:
        raise ValueError(
            f"Invalid first line '{first}' must be on the form 'passphrase=\"...\""
        )
    passphrase = match.group("passphrase")
    plaintext = "\n".join(lines[1:])
    return encrypt(passphrase, plaintext)


PATH_REGEX = re.compile(r"(?P<kata>.+)/parts/(?P<part>.+)$")


def encrypt_file(path: str):
    match = PATH_REGEX.match(path)
    if not match:
        return
    kata = match.group("kata")
    part = match.group("part")
    destination = os.path.join("public", kata, part + ".json")
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    print(f"Encrypting {path} and storing into {destination}")
    with open(path, "r") as f:
        html = f.read()
    data = encrypt_html(html)
    with open(destination, "w") as f:
        json.dump(data, f)


if __name__ == "__main__":
    for filename in glob.glob("**/parts/**"):
        encrypt_file(filename)
