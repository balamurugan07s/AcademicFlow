import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, encryptToken, decryptToken, timingSafeCompare } from '../lib/crypto.js';

describe('Cryptographic Utilities', () => {
  it('should hash and verify passwords securely with bcrypt', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword('WrongPassword', hash);
    expect(isWrong).toBe(false);
  });

  it('should encrypt and decrypt tokens using AES-256-GCM roundtrip', () => {
    const rawToken = 'ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const encrypted = encryptToken(rawToken);

    expect(encrypted).not.toBe(rawToken);
    expect(encrypted.split(':').length).toBe(3); // iv:authTag:ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(rawToken);
  });

  it('should perform timing-safe string comparison correctly', () => {
    const sigA = '9b73c65c4046524fb9e8841753907727e0259b3f';
    const sigB = '9b73c65c4046524fb9e8841753907727e0259b3f';
    const sigC = '0000000000000000000000000000000000000000';

    expect(timingSafeCompare(sigA, sigB)).toBe(true);
    expect(timingSafeCompare(sigA, sigC)).toBe(false);
    expect(timingSafeCompare(sigA, 'short')).toBe(false);
  });
});
