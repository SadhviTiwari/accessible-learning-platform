//ELEMENTS 
const inputBox = document.getElementById("textInput");
const statusText = document.getElementById("status");

//FONT CONTROL 
let fontSize = 18;

function changeFontSize(change) {
    fontSize += change;

    if (fontSize < 12) fontSize = 12;
    if (fontSize > 50) fontSize = 50;

    inputBox.style.fontSize = fontSize + "px";
    statusText.innerText = `Font Size: ${fontSize}px`;
}

//VOICE INPUT
const voiceBtn = document.getElementById("voiceBtn");

voiceBtn.addEventListener("click", () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
        alert("Please use Google Chrome");
        return;
    }

    const mic = new Recognition();
    mic.lang = "en-US";

    statusText.innerText = "Listening... 🎤";
    mic.start();

    mic.onresult = (event) => {
        let spokenText = event.results[0][0].transcript.trim();

        // Capitalize first letter
        spokenText = spokenText.charAt(0).toUpperCase() + spokenText.slice(1);

        inputBox.value += (inputBox.value ? " " : "") + spokenText;
        statusText.innerText = "Voice captured ✅";
    };

    mic.onerror = () => {
        statusText.innerText = "Mic error ❌";
    };
});

// TEXT TO SPEECH
let speechRef;
let currentIndex = 0;

function speakFrom(index) {
    const words = inputBox.value.split(" ");
    const remaining = words.slice(index).join(" ");

    if (!remaining) return;

    speechSynthesis.cancel();

    speechRef = new SpeechSynthesisUtterance(remaining);

    // Language detect
    speechRef.lang = /[\u0900-\u097F]/.test(remaining) ? "hi-IN" : "en-US";

    speechSynthesis.speak(speechRef);
}

// Buttons control
document.getElementById("readBtn").onclick = () => {
    currentIndex = 0;
    speakFrom(0);
};

document.getElementById("pauseBtn").onclick = () => speechSynthesis.pause();
document.getElementById("resumeBtn").onclick = () => speechSynthesis.resume();
document.getElementById("stopBtn").onclick = () => speechSynthesis.cancel();

document.getElementById("forwardBtn").onclick = () => {
    currentIndex += 10;
    speakFrom(currentIndex);
};

document.getElementById("backBtn").onclick = () => {
    currentIndex = Math.max(0, currentIndex - 10);
    speakFrom(currentIndex);
};

// TEXT CLEANUP 
function cleanText(text) {
    return text
        .toLowerCase()
        .replace(/\bi\b/g, "I")
        .replace(/ +/g, " ")
        .replace(/(^\w|\.\s*\w)/g, c => c.toUpperCase());
}

//  TRANSLATION 
async function translateText(targetLang) {
    let content = inputBox.value.trim();

    if (!content) {
        statusText.innerText = "Enter text first";
        return;
    }

    statusText.innerText = "Translating... 🌐";

    try {
        let sourceLang = targetLang === "hi" ? "en" : "hi";
        let processedText = targetLang === "hi" ? cleanText(content) : content;

        let apiURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(processedText)}`;

        let response = await fetch(apiURL);
        let data = await response.json();

        let finalText = "";
        data[0].forEach(part => finalText += part[0]);

        // Capitalize English result
        if (targetLang === "en") {
            finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1);
        }

        inputBox.value = finalText;

        // Speak output
        let voice = new SpeechSynthesisUtterance(finalText);
        voice.lang = targetLang === "hi" ? "hi-IN" : "en-US";

        speechSynthesis.cancel();
        speechSynthesis.speak(voice);

        statusText.innerText = "Done ✅";

    } catch (error) {
        statusText.innerText = "Translation failed ❌";
    }
}

// UI MODES 
document.getElementById("darkBtn").onclick = () => {
    document.body.classList.toggle("dark");
};

document.getElementById("contrastBtn").onclick = () => {
    document.body.classList.toggle("high-contrast");
};

// FILE READER 
document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    // TEXT FILE
    if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = e => inputBox.value = e.target.result;
        reader.readAsText(file);
    }

    // PDF FILE
    else if (file.type === "application/pdf") {
        const reader = new FileReader();

        reader.onload = function () {
            const typedArray = new Uint8Array(this.result);

            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
                pdf.getPage(1).then(page => {
                    page.getTextContent().then(content => {
                        let text = content.items.map(i => i.str).join(" ");
                        inputBox.value = text;
                    });
                });
            });
        };

        reader.readAsArrayBuffer(file);
    }
});

//  AI ASSISTANT 
document.getElementById("askBtn").onclick = () => {
    const question = document.getElementById("chatInput").value.toLowerCase();
    const output = document.getElementById("chatOutput");

    if (question.includes("feature")) {
        output.innerText = "This platform supports voice input, text-to-speech, translation, PDF reading, and visual accessibility modes.";
    }
    else if (question.includes("usage") || question.includes("how")) {
        output.innerText =
            "Steps to use:\n" +
            "1. Enter text manually or via voice.\n" +
            "2. Click 'Start Reading' to listen.\n" +
            "3. Translate using Hindi/English buttons.\n" +
            "4. Control playback using pause/resume.\n" +
            "5. Upload files for reading.\n" +
            "6. Use dark or high contrast mode if needed.";
    }
    else if (question.includes("accessibility")) {
        output.innerText = "Designed for accessibility: supports voice interaction, reading assistance, and better visual modes.";
    }
    else if (question.includes("benefit")) {
        output.innerText = "Improves learning experience, helps visually impaired users, and supports multilingual study.";
    }
    else {
        output.innerText = "Ask me about features, usage, or accessibility.";
    }
};
