

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const encryption = require('./encryption');

const app = express();

// Security middleware
app.use(helmet());
app.use(bodyParser.json());

// ✅ Serve static files from current folder (src)
app.use(express.static(__dirname));

// ✅ Root route to load UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Encrypt endpoint
app.post('/encrypt', async (req, res) => {
    try {
        const { text, method } = req.body;
        if (!text) throw new Error('Text is required.');

        let encrypted;
        if (method === 'AES') {
            encrypted = await encryption.aesEncrypt(text);
        } else if (method === 'RSA') {
            encrypted = encryption.rsaEncrypt(text);
        } else {
            throw new Error('Invalid encryption method.');
        }

        res.json({ encrypted });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Decrypt endpoint
app.post('/decrypt', async (req, res) => {
    try {
        const { text, method } = req.body;
        if (!text) throw new Error('Text is required.');

        let decrypted;
        if (method === 'AES') {
            decrypted = await encryption.aesDecrypt(JSON.parse(text));
        } else if (method === 'RSA') {
            decrypted = encryption.rsaDecrypt(text);
        } else {
            throw new Error('Invalid decryption method.');
        }

        res.json({ decrypted });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);



// PS D:\cyber projects\Text Encryption & Decryption Web Application> cd src
// PS D:\cyber projects\Text Encryption & Decryption Web Application\src> node app.js