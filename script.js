// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "AUTHDOMAIN",
  projectId: "PROJECTID",
  storageBucket: "STORAGEBUCKET",
  messagingSenderId: "MESSAGINGSENDERID",
  appId: "APIID"
};
try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // DOM Element References
    const ui = {
        schoolName: document.getElementById("schoolName"),
        eventName: document.getElementById("eventName"),
        studentName: document.getElementById("studentName"),
        studentClass: document.getElementById("studentClass"),
        highlightAttributes: document.getElementById("highlightAttributes"),
        logoUpload: document.getElementById("logoUpload"),
        signatureUpload: document.getElementById("signatureUpload"),
        uploadLogoBtn: document.getElementById("uploadLogoBtn"),
        uploadSignatureBtn: document.getElementById("uploadSignatureBtn"),
        generatePdfBtn: document.getElementById("generatePdfBtn"),
        printCertificateBtn: document.getElementById("printCertificate"),
        shareCertificateBtn: document.getElementById("shareCertificate"),
        certificate: document.getElementById("certificate"),
        logoPreview: document.getElementById("logoPreview"),
        signaturePreview: document.getElementById("signaturePreview"),
        highlightOptions: document.getElementById("highlightOptions"),
        borderColorOptions: document.getElementById("borderColorOptions"),
        shapeColorOptions: document.getElementById("shapeColorOptions"),
        subtitleColorOptions: document.getElementById("subtitleColorOptions"),
        authSection: document.getElementById("authSection"),
        qrToggle: document.getElementById("qrToggle"),
        qrOptions: document.getElementById("qrOptions"),
        qrText: document.getElementById("qrText"),
    };
  
    // Application State
    let state = {
        user: null,
        isAuthReady: false,
        loading: false,
        schoolName: "DELHI SECONDARY SCHOOL",
        eventName: "Fitness Challenge",
        studentName: "",
        studentClass: "",
        highlight: {
          id: 6,
          text: "🏋️ Push-up Pro 🏅",
          attributes: "CHEST 💪 | SHOULDERS 🏋️ | TRICEPS 💪 | CORE 🧘",
        },
        logoSrc: "https://i.ibb.co/bF03NC6/logo-removebg-preview.png",
        signatureSrc: "",
        qr: { enabled: true, text: "" },
        colors: { border: "#2c3e50", shape: "#D4AF37", subtitle: "#7f8c8d" },
        availableHighlights: [
            { id: 6, text: "🏋️ Push-up Pro 🏅", attributes: "CHEST 💪 | SHOULDERS 🏋️ | TRICEPS 💪 | CORE 🧘" },
            { id: 7, text: "🏋️ Plank Master 🏅", attributes: "CORE 🧘 | SHOULDERS 🏋️ | BACK 🚶" },
            { id: 8, text: "🏋️ Wall Sit Warrior 🏅", attributes: "QUADRICEPS 🦵 | GLUTES 🍑 | CORE 🧘" },
            { id: 9, text: "🏋️ Squat Star 🏅", attributes: "QUADRICEPS 🦵 | HAMSTRINGS 🏃 | GLUTES 🍑" },
            { id: 10, text: "🏋️ Burpee Champion 🏅", attributes: "FULL BODY 🤸 | CHEST 💪 | LEGS 🦵 | CORE 🧘" },
            { id: 11, text: "🤸 Flexibility Ace 🏅", attributes: "HAMSTRINGS 🤸 | LOWER BACK 🧘" },
            { id: 12, text: "🤸 Balance King/Queen 🏅", attributes: "CORE 🧘 | ANKLES 👣 | CALVES 🦵" },
            { id: 13, text: "🤸 Yoga Pose Hero 🏅", attributes: "CORE 🧘 | BALANCE 🤸 | FLEXIBILITY 🧘‍♀️" },
            { id: 14, text: "⚡ High Knees Hustler 🏅", attributes: "HIP FLEXORS 🏃 | QUADS 🦵 | CORE 🧘" },
            { id: 15, text: "⚡ Mountain Climber Champ 🏅", attributes: "CORE 🧘 | SHOULDERS 🏋️ | QUADS 🦵" },
            { id: 16, text: "⚡ Jumping Jack Star 🏅", attributes: "SHOULDERS 🏋️ | CALVES 🦵 | CORE 🧘" },
            { id: 17, text: "⚡ Fast Feet Sprinter 🏅", attributes: "CALVES 🦵 | QUADS 🦵 | GLUTES 🍑" },
            { id: 1, text: "🖼️ Presentation Skills", attributes: "VOICE 🎤 | CONFIDENCE 💪✨ | EYE CONTACT 👀" },
            { id: 2, text: "🤝 Teamwork", attributes: "COLLABORATION 👥 | SUPPORT 💖 | RELIABILITY ✅" },
            { id: 3, text: "🌟 Leadership", attributes: "INITIATIVE 💡 | GUIDANCE 🧭 | MOTIVATION 🔥" },
            { id: 4, text: "📣 Communication", attributes: "CLARITY 🗣️ | PERSUASION ✍️ | LISTENING 👂" },
            { id: 5, text: "🤔 Problem Solving", attributes: "ANALYTICAL SKILLS 🧠 | CREATIVITY 🎨 | RESOURCEFULNESS 🛠️" },
        ],
        availableColors: {
          border: ["#2c3e50","#800000","#004d40","#D4AF37","#343a40","#8B4513"],
          shape: ["#D4AF37","#e67e22","#1abc9c","#c09f80","#3498db","#990000"],
          subtitle: ["#7f8c8d","#95a5a6","#bdc3c7","#848482","#d35400","#5d6d7e"],
        },
    };

    // --- Authentication ---
    const provider = new GoogleAuthProvider();

    const signIn = () => {
        setLoading(true);
        signInWithPopup(auth, provider)
            .catch((error) => console.error("Sign in error", error))
            .finally(() => setLoading(false));
    };

    const signOutUser = () => {
        signOut(auth).catch((error) => console.error("Sign out error", error));
    };

    onAuthStateChanged(auth, (user) => {
        state.user = user;
        state.isAuthReady = true;
        renderAuthUI();
        renderApp();
    });

    // --- Firestore ---
    async function saveCertificateData() {
        if (!state.user) {
            alert("Please sign in to save the certificate.");
            return null;
        }
        
        if (!state.studentName.trim()) {
            const nameFromPrompt = prompt("Please enter the awardee's full name to save and generate the certificate:");
            if (nameFromPrompt && nameFromPrompt.trim()) {
                state.studentName = nameFromPrompt.trim();
                ui.studentName.value = state.studentName;
            } else {
                alert("Student name is required to save.");
                return null;
            }
        }

        if (!state.studentClass.trim()) {
            alert("Please enter the student's class.");
            return null;
        }

        setLoading(true);
        ui.generatePdfBtn.disabled = true;

        try {
            const awardeeData = {
                studentName: state.studentName,
                studentClass: state.studentClass,
                eventName: state.eventName,
                organizationName: state.schoolName,
                certificateDetails: {
                    skill: state.highlight.text,
                    attributes: state.highlight.attributes
                },
                awardedAt: serverTimestamp(),
                awardedBy: state.user.displayName,
                awardedByEmail: state.user.email,
            };

            const docRef = await addDoc(collection(db, "awardees"), awardeeData);
            console.log("Awardee saved with ID: ", docRef.id);
            
            const verificationUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}verify.html?id=${docRef.id}`;
            state.qr.text = verificationUrl;
            
            return verificationUrl;
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Failed to save certificate data.");
            return null;
        } finally {
            setLoading(false);
            ui.generatePdfBtn.disabled = false;
        }
    }

    // --- Main App Logic ---
    function setLoading(isLoading) {
        state.loading = isLoading;
        renderAuthUI();
    }

    function renderAuthUI() {
        if (!state.isAuthReady || state.loading) {
            ui.authSection.innerHTML = `<div class="loader"></div>`;
            return;
        }
        if (state.user) {
            ui.authSection.innerHTML = `
                <div class="user-profile">
                    <div class="user-info">
                        <img src="${state.user.photoURL}" alt="User photo">
                        <span class="user-name">${state.user.displayName}</span>
                    </div>
                    <button id="signOutBtn" class="auth-btn sign-out">Sign Out</button>
                </div>`;
            const signOutBtn = document.getElementById('signOutBtn');
            if (signOutBtn) {
                signOutBtn.addEventListener('click', signOutUser);
            }
        } else {
            ui.authSection.innerHTML = `<button id="signInBtn" class="auth-btn"><i class="fab fa-google"></i> Sign In with Google</button>`;
            const signInBtn = document.getElementById('signInBtn');
            if (signInBtn) {
                signInBtn.addEventListener('click', signIn);
            }
        }
    }

    function getShareableLink() {
        const shareData = {
          schoolName: state.schoolName,
          eventName: state.eventName,
          studentName: state.studentName,
          studentClass: state.studentClass,
          highlight: state.highlight,
        };
        // Unicode-safe Base64 encoding to support emojis and non-Latin characters
        const encodedData = btoa(
            encodeURIComponent(JSON.stringify(shareData))
              .replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1))
        );
        return `${window.location.origin}${window.location.pathname}?cert=${encodedData}`;
    }

    function loadCertificateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const certData = params.get('cert');
        if (certData) {
            try {
                // Unicode-safe Base64 decoding
                const decodedData = JSON.parse(
                    decodeURIComponent(Array.from(atob(certData))
                        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                        .join(''))
                );
                Object.assign(state, decodedData);
                document.getElementById('left-panel').style.display = 'none';
                document.querySelector('.container').style.gridTemplateColumns = '1fr';
            } catch (error) {
                console.error("Failed to load certificate from URL:", error);
            }
        }
    }

    function renderApp() {
        renderCertificatePreview();
        renderHighlightOptions();
        renderColorOptions();
        ui.schoolName.value = state.schoolName;
        ui.eventName.value = state.eventName;
        ui.studentName.value = state.studentName;
        ui.studentClass.value = state.studentClass;
        ui.highlightAttributes.value = state.highlight.attributes;
        ui.logoPreview.src = state.logoSrc;
        if (state.signatureSrc) {
            ui.signaturePreview.src = state.signatureSrc;
            ui.signaturePreview.classList.remove('hidden');
        } else {
            ui.signaturePreview.src = "";
            ui.signaturePreview.classList.add('hidden');
        }
        ui.qrOptions.classList.toggle('hidden', !state.qr.enabled);
        ui.qrText.value = state.qr.text;
    }

    function renderCertificatePreview() {
        const { schoolName, eventName, highlight, logoSrc, signatureSrc, colors, studentName, qr } = state;
        ui.certificate.style.setProperty("--cert-border-color", colors.border);
        ui.certificate.style.setProperty("--cert-shape-color", colors.shape);
        ui.certificate.style.setProperty("--cert-subtitle-color", colors.subtitle);
        
        const signatureHtml = signatureSrc 
            ? `<img src="${signatureSrc}" alt="Signature" class="cert-signature-img">` 
            : `<div class="cert-signature-placeholder" style="height: 5vw;"></div>`;

        const qrCodeContent = qr.text || getShareableLink(); 
        const qrHtml = (qr.enabled && qrCodeContent) ? `<div class="cert-qr-area"><div id="certQrCode"></div><p>Scan to Verify</p></div>` : '<div class="cert-qr-area"></div>';
        
        ui.certificate.innerHTML = `
            <div class="cert-border"></div>
            <div class="cert-content">
                <div class="cert-header">
                    <img src="${logoSrc}" class="cert-logo" alt="School Logo">
                    <div class="cert-school-name">${schoolName}</div>
                </div>
                <div class="cert-body">
                    <p class="cert-awardee-intro">This certificate is proudly presented to</p>
                    <h2 class="cert-awardee-name">${studentName || "Student Name"}</h2>
                    <h1 class="cert-title">CERTIFICATE OF ACHIEVEMENT</h1>
                    <p class="cert-event-name">for outstanding performance in the ${eventName}</p>
                    <div class="cert-highlight-script">${highlight.text}</div>
                    <p class="cert-highlight-attrs">${highlight.attributes}</p>
                </div>
            </div>
            <div class="cert-footer">
                <div class="cert-signature-area">
                    ${signatureHtml} 
                    <div class="signature-line"></div>
                    <p>School Principal</p>
                </div>
                ${qrHtml}
            </div>`;

        if (qr.enabled && qrCodeContent) {
            const qrCodeEl = document.getElementById("certQrCode");
            if(qrCodeEl) {
                qrCodeEl.innerHTML = '';
                new QRCode(qrCodeEl, { text: qrCodeContent, width: 128, height: 128 });
            }
        }
    }

    function renderHighlightOptions() {
        ui.highlightOptions.innerHTML = state.availableHighlights.map(h =>
            `<button class="highlight-option ${h.id === state.highlight.id ? "active" : ""}" data-id="${h.id}" style="white-space: nowrap;">${h.text}</button>`
        ).join("");
    }

    function renderColorOptions() {
        ui.borderColorOptions.innerHTML = state.availableColors.border.map(c => `<div class="color-option ${c === state.colors.border ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
        ui.shapeColorOptions.innerHTML = state.availableColors.shape.map(c => `<div class="color-option ${c === state.colors.shape ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
        ui.subtitleColorOptions.innerHTML = state.availableColors.subtitle.map(c => `<div class="color-option ${c === state.colors.subtitle ? "active" : ""}" style="background-color:${c}" data-color="${c}"></div>`).join("");
    }

    function handleInputChange(e) {
        const { id, value, type, checked } = e.target;
        if(type === 'checkbox') {
             state.qr.enabled = checked;
        } else if (id === 'highlightAttributes') {
            state.highlight.attributes = value;
        } else {
             state[id] = value;
        }
        renderApp();
    }

    function handlePanelClick(e) {
        const target = e.target;
        if (target.matches(".highlight-option") && target.dataset.id) {
            state.highlight = structuredClone(state.availableHighlights.find(h => h.id === parseInt(target.dataset.id)));
            renderApp();
        }
        if (target.matches(".color-option")) {
            const color = target.dataset.color;
            const parentId = target.parentElement.id;
            if (parentId === "borderColorOptions") state.colors.border = color;
            if (parentId === "shapeColorOptions") state.colors.shape = color;
            if (parentId === "subtitleColorOptions") state.colors.subtitle = color;
            renderApp();
        }
    }

    function handleFileUpload(e, targetStateProperty) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state[targetStateProperty] = event.target.result;
                renderApp();
            };
            reader.readAsDataURL(file);
        }
    }
      
    async function generatePDF() {
        const verificationUrl = await saveCertificateData();
        if (verificationUrl) {
            state.qr.text = verificationUrl;
            ui.qrText.value = verificationUrl;
            renderCertificatePreview();

            setTimeout(async () => {
                const { jsPDF } = window.jspdf;
                const canvas = await html2canvas(ui.certificate, { scale: 3, backgroundColor: null, useCORS: true });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${state.studentName}_${state.eventName}_Certificate.pdf`);
                // Navigate to list page after saving
                window.location.href = 'certificates.html';
            }, 200);
        }
    }

    // Event Listeners
    document.querySelector(".left-panel").addEventListener("input", handleInputChange);
    document.querySelector(".left-panel").addEventListener("click", handlePanelClick);
    ui.logoUpload.addEventListener("change", (e) => handleFileUpload(e, 'logoSrc'));
    ui.signatureUpload.addEventListener("change", (e) => handleFileUpload(e, 'signatureSrc'));
    ui.uploadLogoBtn.addEventListener("click", () => ui.logoUpload.click());
    ui.uploadSignatureBtn.addEventListener("click", () => ui.signatureUpload.click());
    ui.generatePdfBtn.addEventListener("click", generatePDF);
    ui.printCertificateBtn.addEventListener("click", () => window.print());
    ui.shareCertificateBtn.addEventListener("click", () => {
        const shareableLink = state.qr.text || getShareableLink();
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert("Certificate verification link copied to clipboard!");
        }, () => {
            alert("Failed to copy link.");
        });
    });

    // Initial setup
    loadCertificateFromUrl();
    renderApp();

} catch (error) {
    console.error("Firebase initialization failed. Please check your config.", error);
    document.body.innerHTML = `<div style="font-family: sans-serif; padding: 2rem;">
        <h1>Error: Firebase Initialization Failed</h1>
        <p>The application could not start. This is likely because the Firebase configuration is missing or incorrect in your <code>script.js</code> file.</p>
        <p>Please follow the setup guide to create a Firebase project and paste your configuration into the <code>firebaseConfig</code> object in the script.</p>
    </div>`;
}
