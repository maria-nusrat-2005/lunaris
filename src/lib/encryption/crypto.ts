// WebCrypto AES-GCM Encryption Layer for Clarity Finance
// All sensitive data is encrypted before storage

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

// Storage key for the encryption key (encrypted with passcode if enabled)
const MASTER_KEY_STORAGE = 'clarity_master_key';
const KEY_CHECK_STORAGE = 'clarity_key_check';

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a key from a passcode
export async function deriveKeyFromPasscode(
  passcode: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder();
  const passcodeData = encoder.encode(passcode);

  const usedSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passcodeData,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: usedSalt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );

  return { key, salt: usedSalt };
}

// Encrypt data using AES-GCM
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ iv: string; encrypted: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encoder.encode(data)
  );

  return {
    iv: arrayBufferToBase64(iv),
    encrypted: arrayBufferToBase64(encrypted),
  };
}

// Decrypt data using AES-GCM
export async function decrypt(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: base64ToArrayBuffer(iv),
    },
    key,
    base64ToArrayBuffer(encryptedData)
  );

  return decoder.decode(decrypted);
}

// Export key to storable format
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from stored format
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyData);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt and store the master key (protected by passcode if enabled)
export async function storeMasterKey(
  masterKey: CryptoKey,
  passcode?: string
): Promise<void> {
  const exportedKey = await exportKey(masterKey);

  if (passcode) {
    const { key: passcodeKey, salt } = await deriveKeyFromPasscode(passcode);
    const { iv, encrypted } = await encrypt(exportedKey, passcodeKey);
    localStorage.setItem(
      MASTER_KEY_STORAGE,
      JSON.stringify({
        protected: true,
        salt: arrayBufferToBase64(salt),
        iv,
        data: encrypted,
      })
    );
  } else {
    localStorage.setItem(
      MASTER_KEY_STORAGE,
      JSON.stringify({
        protected: false,
        data: exportedKey,
      })
    );
  }

  // Store a check value to verify the key is correct
  const { iv, encrypted } = await encrypt('clarity_check', masterKey);
  localStorage.setItem(KEY_CHECK_STORAGE, JSON.stringify({ iv, data: encrypted }));
}

// Retrieve the master key
export async function retrieveMasterKey(passcode?: string): Promise<CryptoKey | null> {
  const stored = localStorage.getItem(MASTER_KEY_STORAGE);
  if (!stored) return null;

  try {
    const keyData = JSON.parse(stored);

    let exportedKey: string;

    if (keyData.protected) {
      if (!passcode) return null;
      const { key: passcodeKey } = await deriveKeyFromPasscode(
        passcode,
        base64ToArrayBuffer(keyData.salt) as Uint8Array
      );
      exportedKey = await decrypt(keyData.data, keyData.iv, passcodeKey);
    } else {
      exportedKey = keyData.data;
    }

    const masterKey = await importKey(exportedKey);

    // Verify the key is correct
    const checkStored = localStorage.getItem(KEY_CHECK_STORAGE);
    if (checkStored) {
      const checkData = JSON.parse(checkStored);
      const decrypted = await decrypt(checkData.data, checkData.iv, masterKey);
      if (decrypted !== 'clarity_check') {
        return null;
      }
    }

    return masterKey;
  } catch {
    return null;
  }
}

// Initialize encryption (create master key if not exists)
export async function initializeEncryption(): Promise<CryptoKey> {
  let masterKey = await retrieveMasterKey();
  
  if (!masterKey) {
    masterKey = await generateEncryptionKey();
    await storeMasterKey(masterKey);
  }
  
  return masterKey;
}

// Hash a passcode for storage verification
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hash);
}

// Verify passcode against stored hash
export async function verifyPasscode(
  passcode: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPasscode(passcode);
  return hash === storedHash;
}

// Utility functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Encrypted storage helpers
export class EncryptedStorage {
  private key: CryptoKey;

  constructor(key: CryptoKey) {
    this.key = key;
  }

  async encryptObject<T>(data: T): Promise<{ iv: string; data: string }> {
    const jsonString = JSON.stringify(data);
    const { iv, encrypted } = await encrypt(jsonString, this.key);
    return { iv, data: encrypted };
  }

  async decryptObject<T>(encryptedData: string, iv: string): Promise<T> {
    const jsonString = await decrypt(encryptedData, iv, this.key);
    return JSON.parse(jsonString) as T;
  }
}
