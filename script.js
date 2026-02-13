const algorithm = document.getElementById("algorithm");
const input = document.getElementById("input");
const keyField = document.getElementById("key");
const output = document.getElementById("output");

const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const copyBtn = document.getElementById("copyBtn");

// Event Listeners
encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);
copyBtn.addEventListener("click", copyOutput);

// Disable key unless AES
algorithm.addEventListener("change", () => {
    keyField.disabled = algorithm.value !== "aes";
    keyField.value = "";
    output.innerText = "";
});

// ---------- ENCRYPT ----------
function encrypt() {
    const algo = algorithm.value;
    const text = input.value;

    if (!text) {
        output.innerText = "Please enter text.";
        return;
    }

    try {
        let result = "";

        switch (algo) {
            case "aes":
                const key = keyField.value;
                if (!key) {
                    output.innerText = "AES requires a secret key.";
                    return;
                }
                result = CryptoJS.AES.encrypt(text, key).toString();
                break;

            case "sha256":
                result = CryptoJS.SHA256(text).toString();
                break;

            case "sha512":
                result = CryptoJS.SHA512(text).toString();
                break;

            case "base64":
                result = base64Encode(text);
                break;

            case "rot13":
                result = rot13(text);
                break;
        }

        output.innerText = result;

    } catch (err) {
        output.innerText = "Encryption error.";
    }
}

// ---------- DECRYPT ----------
function decrypt() {
    const algo = algorithm.value;
    const text = input.value;

    if (!text) {
        output.innerText = "Please enter text.";
        return;
    }

    try {
        let result = "";

        switch (algo) {
            case "aes":
                const key = keyField.value;
                if (!key) {
                    output.innerText = "AES requires a secret key.";
                    return;
                }

                const decrypted = CryptoJS.AES.decrypt(text, key);
                result = decrypted.toString(CryptoJS.enc.Utf8);

                if (!result) {
                    output.innerText = "Invalid key or corrupted data.";
                    return;
                }
                break;

            case "base64":
                result = base64Decode(text);
                break;

            case "rot13":
                result = rot13(text);
                break;

            default:
                output.innerText = "Hash functions cannot be decrypted.";
                return;
        }

        output.innerText = result;

    } catch (err) {
        output.innerText = "Decryption failed.";
    }
}

// ---------- UTILITIES ----------

// Unicode-safe Base64
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

// Clean ROT13
function rot13(str) {
    return str.replace(/[a-zA-Z]/g, function (char) {
        const base = char <= "Z" ? 65 : 97;
        return String.fromCharCode(
            (char.charCodeAt(0) - base + 13) % 26 + base
        );
    });
}

// Clipboard
function copyOutput() {
    const text = output.innerText;

    if (!text) {
        output.innerText = "Nothing to copy.";
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            const original = text;
            output.innerText = "Copied!";
            setTimeout(() => {
                output.innerText = original;
            }, 1200);
        })
        .catch(() => {
            output.innerText = "Clipboard permission denied.";
        });
}
