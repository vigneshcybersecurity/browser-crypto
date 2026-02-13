document.addEventListener("DOMContentLoaded", function(){

const algorithm = document.getElementById("algorithm");
const input = document.getElementById("input");
const keyField = document.getElementById("key");
const output = document.getElementById("output");

const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const copyBtn = document.getElementById("copyBtn");

algorithm.addEventListener("change", function(){
    keyField.disabled = algorithm.value !== "aes";
    keyField.value = "";
    output.innerText = "";
});

encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);
copyBtn.addEventListener("click", copyOutput);

function encrypt(){
    const algo = algorithm.value;
    const text = input.value;
    if(!text){ output.innerText="Enter text first."; return; }

    try{
        let result="";
        switch(algo){
            case "aes":
                if(!keyField.value){ output.innerText="Enter secret key."; return; }
                result = CryptoJS.AES.encrypt(text,keyField.value).toString();
                break;
            case "sha256":
                result = CryptoJS.SHA256(text).toString();
                break;
            case "sha512":
                result = CryptoJS.SHA512(text).toString();
                break;
            case "base64":
                result = btoa(unescape(encodeURIComponent(text)));
                break;
            case "rot13":
                result = text.replace(/[a-zA-Z]/g,c=>{
                    const base=c<="Z"?65:97;
                    return String.fromCharCode((c.charCodeAt(0)-base+13)%26+base);
                });
        }
        output.innerText=result;
    }catch{
        output.innerText="Encryption failed.";
    }
}

function decrypt(){
    const algo=algorithm.value;
    const text=input.value;
    if(!text){ output.innerText="Enter text first."; return; }

    try{
        let result="";
        switch(algo){
            case "aes":
                if(!keyField.value){ output.innerText="Enter secret key."; return; }
                result=CryptoJS.AES.decrypt(text,keyField.value).toString(CryptoJS.enc.Utf8);
                if(!result){ output.innerText="Invalid key or data."; return; }
                break;
            case "base64":
                result=decodeURIComponent(escape(atob(text)));
                break;
            case "rot13":
                result=text.replace(/[a-zA-Z]/g,c=>{
                    const base=c<="Z"?65:97;
                    return String.fromCharCode((c.charCodeAt(0)-base+13)%26+base);
                });
                break;
            default:
                output.innerText="Hashes cannot be decrypted.";
                return;
        }
        output.innerText=result;
    }catch{
        output.innerText="Decryption failed.";
    }
}

function copyOutput(){
    const text=output.innerText;
    if(!text){ output.innerText="Nothing to copy."; return; }
    navigator.clipboard.writeText(text).then(()=>{
        const original=text;
        output.innerText="Copied!";
        setTimeout(()=>{ output.innerText=original; },1000);
    });
}

/* TERMINAL ANIMATION */
const terminalLines=[
"Initializing CipherX Pro...",
"Loading cryptographic modules...",
"AES engine ready.",
"SHA hashing ready.",
"System secure ✔",
"Awaiting user input..."
];

let lineIndex=0;
let charIndex=0;
const terminalElement=document.getElementById("terminalText");

function typeTerminal(){
    if(lineIndex<terminalLines.length){
        if(charIndex<terminalLines[lineIndex].length){
            terminalElement.innerHTML+=terminalLines[lineIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeTerminal,40);
        }else{
            terminalElement.innerHTML+="\n";
            lineIndex++;
            charIndex=0;
            setTimeout(typeTerminal,400);
        }
    }
}

typeTerminal();

});
