const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 characters in environment variables');
}

function decrypt(text) {
    const parts = decodeURIComponent(text).split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = async (req, res) => {
    const { token } = req.query;
    
    try {
        const webhookUrl = decrypt(token);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: req.body
        });
        
        const responseBody = await response.text();
        res.status(response.status).send(responseBody);
    } catch (e) {
        res.status(500).json({ error: 'Invalid token' });
    }
};
