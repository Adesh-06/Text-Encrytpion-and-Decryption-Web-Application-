

// ===============================
// ENCRYPTION FORM HANDLER
// ===============================
document.getElementById('encryptionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = document.getElementById('text').value;
    const method = document.getElementById('method').value;

    const output = document.getElementById('encryptionOutput');
    const errorOutput = document.getElementById('encryptionErrorOutput');

    try {
        const response = await fetch('/encrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, method })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Encryption failed');
        }

        // ✅ AES & RSA BOTH RETURN STRING
        output.textContent = data.encrypted;
        output.classList.add('show');
        errorOutput.classList.remove('show');

        // Auto-fill decrypt box
        document.getElementById('decryptText').value = data.encrypted;

    } catch (error) {
        errorOutput.textContent = error.message;
        errorOutput.classList.add('show');
        output.classList.remove('show');
    }
});


// ===============================
// DECRYPTION FORM HANDLER
// ===============================
document.getElementById('decryptionForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const text = document.getElementById('decryptText').value;
    const method = document.getElementById('decryptMethod').value;

    const output = document.getElementById('decryptionOutput');
    const errorOutput = document.getElementById('decryptionErrorOutput');

    try {
        const response = await fetch('/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,   // ✅ STRING ONLY
                method
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Decryption failed');
        }

        output.textContent = data.decrypted;
        output.classList.add('show');
        errorOutput.classList.remove('show');

    } catch (error) {
        errorOutput.textContent = error.message;
        errorOutput.classList.add('show');
        output.classList.remove('show');
    }
});
