#!/usr/bin/env python3
# Copyright (c) 2026 Vincent Hiribarren
# 
# Permission is granted to redistribute this file in its original,
# unmodified form, provided that this copyright notice is preserved.
# 
# All other rights are reserved.

import base64
import argparse

def obfuscate(text, key="VG"):
    """
    Obfuscates text to be decoded by decodeContacts() in script.js.
    
    The JS decoding logic is: B64Decode -> Reverse -> XOR with key.
    The encoding logic is: XOR with key -> Reverse -> B64Encode.
    """
    # 1. XOR the input text with the key
    xored = "".join(
        chr(ord(c) ^ ord(key[i % len(key)])) 
        for i, c in enumerate(text)
    )
    
    # 2. Reverse the XORed string
    reversed_str = xored[::-1]
    
    # 3. Base64 encode the result
    encoded_bytes = base64.b64encode(reversed_str.encode('latin1'))
    return encoded_bytes.decode('ascii')

def main():
    parser = argparse.ArgumentParser(description="Obfuscate contact information for CV.")
    parser.add_argument("text", help="The text to obfuscate (e.g., email or phone number)")
    parser.add_argument("--key", default="VG", help="The obfuscation key (default: VG)")
    
    args = parser.parse_args()
    
    result = obfuscate(args.text, args.key)
    print(result)

if __name__ == "__main__":
    main()
