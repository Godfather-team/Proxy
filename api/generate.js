const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

module.exports = (req, res) => {
    const webhook = req.query.webhook;
    if (!webhook) return res.status(400).json({error: 'webhook required'});
    
    const token = encrypt(webhook);
    const proxyUrl = `https://${req.headers.host}/api/send/${token}`;
    
    res.json({
        token: token,
        proxy_url: proxyUrl,
        usage: `webh = "${proxyUrl}"`
    });
};
