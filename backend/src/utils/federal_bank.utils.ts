import crypto from 'crypto';

/**
 * Utility class for Federal Bank Gateway integration
 * Based on specifications in Section 3 and 15 of ok.pdf
 */
export class FederalBankUtils {
    /**
     * Generate SHA512 hash for API requests
     * @param parameters Object containing request parameters
     * @param salt Merchant salt provided by Federal Bank
     */
    static generateHash(parameters: Record<string, any>, salt: string): string {
        // Sort parameters by keys alphabetically (ksort in PHP)
        const sortedKeys = Object.keys(parameters).sort();

        // Create pipe-delimited string starting with salt
        let hashData = salt;
        for (const key of sortedKeys) {
            const value = parameters[key];
            if (value !== undefined && value !== null && value.toString().length > 0) {
                hashData += '|' + value.toString().trim();
            }
        }

        // Generate SHA512 hash and convert to uppercase
        return crypto.createHash('sha512').update(hashData).digest('hex').toUpperCase();
    }

    /**
     * Verify hash from response
     * @param response Response object from Federal Bank
     * @param salt Merchant salt
     */
    static verifyHash(response: Record<string, any>, salt: string): boolean {
        if (!response.hash) return true; // As per doc Section 15.2

        const receivedHash = response.hash;
        const dataToHash = { ...response };
        delete dataToHash.hash;

        const calculatedHash = this.generateHash(dataToHash, salt);
        return receivedHash === calculatedHash;
    }

    /**
     * Encrypt data using AES-256-CBC
     * @param data JSON string or object to encrypt
     * @param encryptionKey 32-byte key
     * @param iv 16-byte initial vector
     */
    static encryptData(data: string | object, encryptionKey: string, iv: string): string {
        const plainText = typeof data === 'object' ? JSON.stringify(data) : data;
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), Buffer.from(iv));
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    /**
     * Decrypt data using AES-256-CBC
     * @param encryptedData Base64 encoded encrypted string
     * @param decryptionKey 32-byte key
     * @param iv 16-byte initial vector
     */
    static decryptData(encryptedData: string, decryptionKey: string, iv: string): string {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptionKey), Buffer.from(iv));
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
