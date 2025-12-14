
// Import crypto and node-rsa
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

class EncryptionService {
    constructor() {
        this.IV_LENGTH = 16;
        this.SALT_LENGTH = 16;
        this.RSA_KEY_SIZE = 2048;

        // Load AES key from .env
        this.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

        // Initialize RSA key pair
        try {
            this.rsaKey = new NodeRSA({ b: this.RSA_KEY_SIZE });
        } catch (error) {
            throw new Error('Failed to initialize RSA key');
        }
    }

    // Validate 32-byte AES key
    validateKey() {
        if (!this.ENCRYPTION_KEY || this.ENCRYPTION_KEY.length !== 32) {
            throw new Error('Invalid encryption key format or length');
        }
    }

    // ===============================
    // AES-256-GCM ENCRYPTION
    // ===============================
    async aesEncrypt(text) {
        if (!text) throw new Error('Text is required for encryption');

        this.validateKey();

        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);

        const key = await new Promise((resolve, reject) => {
            crypto.pbkdf2(
                this.ENCRYPTION_KEY,
                salt,
                100000,
                32,
                'sha256',
                (err, derivedKey) =>
                    err ? reject(err) : resolve(derivedKey)
            );
        });

        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        // ✅ Single encrypted string (HEX)
        return [
            iv.toString('hex'),
            salt.toString('hex'),
            authTag.toString('hex'),
            encrypted.toString('hex')
        ].join(':');
    }

    // ===============================
    // AES-256-GCM DECRYPTION
    // ===============================
    async aesDecrypt(encryptedText) {
        if (!encryptedText) {
            throw new Error('Encrypted text is required');
        }

        this.validateKey();

        const parts = encryptedText.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted format');
        }

        const [ivHex, saltHex, authTagHex, encryptedHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const salt = Buffer.from(saltHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        const key = await new Promise((resolve, reject) => {
            crypto.pbkdf2(
                this.ENCRYPTION_KEY,
                salt,
                100000,
                32,
                'sha256',
                (err, derivedKey) =>
                    err ? reject(err) : resolve(derivedKey)
            );
        });

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);

        return decrypted.toString('utf8');
    }

    // ===============================
    // RSA ENCRYPTION
    // ===============================
    rsaEncrypt(text) {
        if (!text) throw new Error('Text is required for RSA encryption');

        return this.rsaKey.encrypt(text, 'base64', 'utf8', {
            encryptionScheme: 'pkcs1-oaep'
        });
    }

    // ===============================
    // RSA DECRYPTION
    // ===============================
    rsaDecrypt(text) {
        if (!text) throw new Error('Text is required for RSA decryption');

        return this.rsaKey.decrypt(text, 'utf8', 'base64', {
            encryptionScheme: 'pkcs1-oaep'
        });
    }
}

module.exports = new EncryptionService();
