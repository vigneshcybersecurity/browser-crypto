const encoder = new TextEncoder();
const decoder = new TextDecoder();

const algSelect = document.getElementById("algorithm");
const modeSelect = document.getElementById("mode");
const inputText = document.getElementById("inputText");
const passwordInput = document.getElementById("password");
const outputText = document.getElementById("outputText");
const processBtn = document.getElementById("processBtn");

const fileInput = document.getElementById("fileInput");
const filePassword = document.getElementById("filePassword");
const encryptFileBtn = document.getElementById("encryptFileBtn");
const decryptFileBtn = document.getElementById("decryptFileBtn");

function bufToBase64(buf){
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64){
  return Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
}

async function deriveKey(password, algo, salt){
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey({
      name:"PBKDF2",
      salt:salt,
      iterations:100000,
      hash:"SHA-256"
    },
    keyMaterial,
    {name:algo,length:256},
    false,
    ["encrypt","decrypt"]
  );
}

processBtn.addEventListener("click", async () => {
  try{
    const text = inputText.value.trim();
    const alg = algSelect.value;
    const mode = modeSelect.value;

    if(!text) throw new Error("Input required.");

    if(alg === "sha256"){
      const hash = await crypto.subtle.digest("SHA-256", encoder.encode(text));
      outputText.value = bufToBase64(hash);
      return;
    }

    if(alg === "base64"){
      outputText.value = mode==="encrypt" ? btoa(text) : atob(text);
      return;
    }

    if(alg === "rsa"){
      if(mode==="encrypt"){
        const keyPair = await crypto.subtle.generateKey({
          name:"RSA-OAEP",
          modulusLength:2048,
          publicExponent:new Uint8Array([1,0,1]),
          hash:"SHA-256"
        }, true, ["encrypt","decrypt"]);

        const encrypted = await crypto.subtle.encrypt(
          {name:"RSA-OAEP"},
          keyPair.publicKey,
          encoder.encode(text)
        );

        outputText.value = bufToBase64(encrypted);
      } else {
        outputText.value = "RSA decryption requires saved private key support (not implemented for demo).";
      }
      return;
    }

    const password = passwordInput.value;
    if(!password) throw new Error("Password required.");

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(alg==="aes-gcm"?12:16));
    const algoName = alg==="aes-gcm" ? "AES-GCM" : "AES-CBC";
    const key = await deriveKey(password, algoName, salt);

    if(mode==="encrypt"){
      const encrypted = await crypto.subtle.encrypt(
        {name:algoName,iv:iv},
        key,
        encoder.encode(text)
      );

      const combined = new Uint8Array([
        ...salt,
        ...iv,
        ...new Uint8Array(encrypted)
      ]);

      outputText.value = bufToBase64(combined);

    } else {
      const data = base64ToBuf(text);
      const salt = data.slice(0,16);
      const iv = data.slice(16, alg==="aes-gcm"?28:32);
      const ciphertext = data.slice(alg==="aes-gcm"?28:32);

      const key = await deriveKey(password, algoName, salt);

      const decrypted = await crypto.subtle.decrypt(
        {name:algoName,iv:iv},
        key,
        ciphertext
      );

      outputText.value = decoder.decode(decrypted);
    }

  } catch(e){
    outputText.value = "Error: " + e.message;
  }
});

encryptFileBtn.addEventListener("click", async () => {
  try{
    const file = fileInput.files[0];
    const password = filePassword.value;
    if(!file || !password) throw new Error("Select file & password.");

    const fileData = await file.arrayBuffer();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password,"AES-GCM",salt);

    const encrypted = await crypto.subtle.encrypt(
      {name:"AES-GCM",iv},
      key,
      fileData
    );

    const combined = new Uint8Array([
      ...salt,
      ...iv,
      ...new Uint8Array(encrypted)
    ]);

    const blob = new Blob([combined]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name + ".cipherx";
    a.click();
    URL.revokeObjectURL(url);

  } catch(err){
    alert("File encryption failed.");
  }
});

decryptFileBtn.addEventListener("click", async () => {
  try{
    const file = fileInput.files[0];
    const password = filePassword.value;
    if(!file || !password) throw new Error();

    const data = new Uint8Array(await file.arrayBuffer());
    const salt = data.slice(0,16);
    const iv = data.slice(16,28);
    const ciphertext = data.slice(28);

    const key = await deriveKey(password,"AES-GCM",salt);

    const decrypted = await crypto.subtle.decrypt(
      {name:"AES-GCM",iv},
      key,
      ciphertext
    );

    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".cipherx","");
    a.click();
    URL.revokeObjectURL(url);

  } catch{
    alert("Wrong password or corrupted file.");
  }
});
