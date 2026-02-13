document.addEventListener("DOMContentLoaded", () => {

  const algorithm = document.getElementById("algorithm");
  const inputText = document.getElementById("inputText");
  const keyInput = document.getElementById("keyInput");
  const outputText = document.getElementById("outputText");

  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");

  // TERMINAL SAFE TYPING (NO innerHTML XSS)
  const terminalLines = [
    "Initializing CipherX...",
    "Loading crypto engine...",
    "AES module ready.",
    "SHA-256 ready.",
    "System secure ✔",
    "Awaiting input..."
  ];

  let line = 0;
  let char = 0;
  const terminalText = document.getElementById("terminalText");

  function typeEffect(){
    if(line < terminalLines.length){
      if(char < terminalLines[line].length){
        terminalText.textContent += terminalLines[line][char];
        char++;
        setTimeout(typeEffect, 40);
      } else {
        terminalText.textContent += "\n";
        line++;
        char = 0;
        setTimeout(typeEffect, 300);
      }
    }
  }
  typeEffect();

  // INPUT LIMIT PROTECTION (Prevent DoS)
  const MAX_LENGTH = 10000;

  encryptBtn.addEventListener("click", () => {
    try{
      const text = inputText.value.trim();
      if(text.length > MAX_LENGTH){
        throw new Error("Input too large");
      }

      if(!text){
        throw new Error("Input required");
      }

      let result;

      switch(algorithm.value){

        case "aes":
          if(!keyInput.value){
            throw new Error("Key required for AES");
          }
          result = CryptoJS.AES.encrypt(text, keyInput.value).toString();
          break;

        case "sha256":
          result = CryptoJS.SHA256(text).toString();
          break;

        case "base64":
          result = btoa(text);
          break;

        default:
          throw new Error("Invalid algorithm");
      }

      outputText.value = result;

    } catch(err){
      outputText.value = "Error: " + err.message;
    }
  });

  decryptBtn.addEventListener("click", () => {
    try{
      const text = inputText.value.trim();
      if(!text){
        throw new Error("Input required");
      }

      let result;

      switch(algorithm.value){

        case "aes":
          if(!keyInput.value){
            throw new Error("Key required for AES");
          }
          const bytes = CryptoJS.AES.decrypt(text, keyInput.value);
          result = bytes.toString(CryptoJS.enc.Utf8);
          if(!result){
            throw new Error("Wrong key or invalid ciphertext");
          }
          break;

        case "base64":
          result = atob(text);
          break;

        default:
          throw new Error("Decryption not supported");
      }

      outputText.value = result;

    } catch(err){
      outputText.value = "Error: " + err.message;
    }
  });

  copyBtn.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(outputText.value);
      alert("Copied!");
    } catch{
      alert("Copy failed.");
    }
  });

});
