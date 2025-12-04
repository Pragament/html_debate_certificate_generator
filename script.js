// Firebase SDK Imports
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, serverTimestamp, runTransaction, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Import shared Firebase services
import { auth, db } from './firebase-config.js';

try {
    // DOM Element References
    const ui = {
        schoolName: document.getElementById("schoolName"),
        certTitle: document.getElementById("certTitle"),
        certSubtitle: document.getElementById("certSubtitle"),
        //eventName: document.getElementById("eventName"),
        //studentName: document.getElementById("studentName"),
        //studentClass: document.getElementById("studentClass"),
        highlightAttributes: document.getElementById("highlightAttributes"),
        logoUpload: document.getElementById("logoUpload"),
        signatureUpload: document.getElementById("signatureUpload"),
        uploadLogoBtn: document.getElementById("uploadLogoBtn"),
        uploadSignatureBtn: document.getElementById("uploadSignatureBtn"),
        generatePdfBtn: document.getElementById("generatePdfBtn"),
        viewCertificatesBtn: document.getElementById("viewCertificatesBtn"),
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
        //eventName: "Fitness Challenge",
        //studentName: "",
        //studentClass: "",
        highlight: {
            id: 18,
            text: "⭐ Star Performer",
            attributes: "HIGH ACHIEVER 📊 | LEADER 🧭 | ACTIVE PARTICIPANT 🎯 | ENTHUSIASTIC LEARNER ✨ | ROLE MODEL 👑",
            certTitle: "Certificate of Excellence",
            certSubtitle: "Awarded to a Star Performer",
        },
        logoSrc: "https://i.ibb.co/bF03NC6/logo-removebg-preview.png",
        signatureSrc: "",
        qr: { enabled: true, text: "" },
        colors: { border: "#2c3e50", shape: "#D4AF37", subtitle: "#7f8c8d" },
        availableHighlights: [
            // Academic Excellence Badges (from WhatsApp Image)
            {
                id: 18,
                text: "⭐ Star Performer",
                attributes: "HIGH ACHIEVER 📊 | LEADER 🧭 | ACTIVE PARTICIPANT 🎯 | ENTHUSIASTIC LEARNER ✨ | ROLE MODEL 👑",
                certTitle: "Certificate of Excellence",
                certSubtitle: "Awarded to a Star Performer"
            },
            {
                id: 19,
                text: "🔍 Explorer",
                attributes: "CURIOUS 🤔 | ACTIVE PARTICIPANT 🎯 | INQUISITIVE ❓ | ENTHUSIASTIC ✨ | INNOVATIVE 💡",
                certTitle: "Explorer Award",
                certSubtitle: "For Curiosity and Discovery"
            },
            {
                id: 20,
                text: "🎤 Star Presenter",
                attributes: "PUBLIC SPEAKING 🗣️ | EFFECTIVE COMMUNICATION 💬 | VISUAL AID USER 🖼️ | CONFIDENT 💪 | POSITIVE FEEDBACK 👍",
                certTitle: "Star Presenter Certificate",
                certSubtitle: "Excellence in Communication & Presentation"
            },
            {
                id: 21,
                text: "📚 Vocab Superstar",
                attributes: "EXTENSIVE VOCABULARY 📖 | ACTIVE IN LANGUAGE ACTIVITIES ✍️ | CONTEXTUAL USE 🧠 | READING ENTHUSIAST 📚 | PEER HELPER 👥",
                certTitle: "Vocabulary Champion",
                certSubtitle: "Mastery of Language & Expression"
            },
            {
                id: 22,
                text: "👀 Observer",
                attributes: "ATTENTION TO DETAIL 🔎 | PERCEPTIVE 👁️ | EXCELLENT LISTENER 👂 | THOUGHTFUL FEEDBACK 💭 | DEEP UNDERSTANDING 🧠",
                certTitle: "Keen Observer Award",
                certSubtitle: "For Exceptional Attention to Detail"
            },
            {
                id: 23,
                text: "🌟 Rising Star",
                attributes: "IMPROVEMENT 📈 | ENGAGED 🎯 | INITIATIVE TAKER 💡 | INTEREST 🌈 | RESILIENT 💪",
                certTitle: "Rising Star Certificate",
                certSubtitle: "Outstanding Growth & Improvement"
            },
            {
                id: 24,
                text: "🎨 Most Creative",
                attributes: "IMPROVEMENT 📈 | ENGAGED 🎯 | INITIATIVE TAKER 💡 | INTEREST 🌈 | RESILIENT 💪",
                certTitle: "Creative Genius Award",
                certSubtitle: "For Exceptional Creativity & Innovation"
            },
            {
                id: 25,
                text: "📊 Big Progress",
                attributes: "ACADEMIC IMPROVEMENT 📈 | BEHAVIORAL GROWTH 🌱 | GOAL ACHIEVER 🎯 | CONFIDENCE 💪 | POSITIVE FEEDBACK 👍",
                certTitle: "Progress Achievement Award",
                certSubtitle: "Significant Growth & Development"
            },
            {
                id: 26,
                text: "✨ Amazing Work",
                attributes: "HIGH QUALITY 🏆 | EXCEPTIONAL EFFORT 💫 | MASTERY 🧠 | DETAIL-ORIENTED 🔎 | COMMENDATIONS 👍",
                certTitle: "Excellence in Academics",
                certSubtitle: "For Consistently Amazing Work"
            },

            // E-DAC Badges (from Pre-primary PDF)
            {
                id: 27,
                text: "⭐ E-DAC Star Performer",
                attributes: "INDEPENDENT WORK 📝 | QUICK RESPONSE ⚡ | COLLABORATION 👥 | PROJECT COMPLETION ✅ | INNOVATIVE SOLUTIONS 💡",
                certTitle: "E-DAC Star Performer",
                certSubtitle: "Excellence in Digital-Age Competencies"
            },
            {
                id: 28,
                text: "🎨 E-DAC Most Creative",
                attributes: "CREATIVE PRESENTATION 🖼️ | CRITICAL QUESTIONS ❓ | INNOVATIVE SOLUTIONS 💡 | IDEA SHARING 💭",
                certTitle: "E-DAC Creative Innovator",
                certSubtitle: "Outstanding Creative Thinking"
            },
            {
                id: 29,
                text: "🌟 E-DAC Rising Star",
                attributes: "ATTEMPTS WRITING ✍️ | SHOWS INTEREST 🎯 | HOMEWORK INITIATIVE 📚 | CLASS PRESENTATION 🗣️",
                certTitle: "E-DAC Rising Star",
                certSubtitle: "Emerging Excellence & Initiative"
            },
            {
                id: 30,
                text: "🔍 E-DAC Explorer",
                attributes: "ADDITIONAL RESEARCH 📚 | BEYOND-BOOK QUESTIONS ❓ | MULTIPLE ATTEMPTS 🔄 | BRAINSTORMING 💭",
                certTitle: "E-DAC Explorer Award",
                certSubtitle: "For Curiosity & In-depth Exploration"
            },
            {
                id: 31,
                text: "👀 E-DAC Observer",
                attributes: "KEEN OBSERVATION 👁️ | SHARES OBSERVATIONS 💬 | CONCEPTUAL QUESTIONS ❓ | MULTIPLE APPROACHES 🔄",
                certTitle: "E-DAC Keen Observer",
                certSubtitle: "Exceptional Observation Skills"
            },
            {
                id: 32,
                text: "🎤 Star Presence",
                attributes: "CONFIDENT BODY LANGUAGE 💪 | INITIATIVE TO SPEAK 🗣️",
                certTitle: "Star Presence Award",
                certSubtitle: "Confidence & Communication Excellence"
            },

            // Original Fitness Badges
            {
                id: 6,
                text: "🏋️ Push-up Pro 🏅",
                attributes: "CHEST 💪 | SHOULDERS 🏋️ | TRICEPS 💪 | CORE 🧘",
                certTitle: "Fitness Excellence Award",
                certSubtitle: "Push-up Pro Certification"
            },
            {
                id: 7,
                text: "🏋️ Plank Master 🏅",
                attributes: "CORE 🧘 | SHOULDERS 🏋️ | BACK 🚶",
                certTitle: "Core Strength Certificate",
                certSubtitle: "Plank Master Achievement"
            },
            {
                id: 8,
                text: "🏋️ Wall Sit Warrior 🏅",
                attributes: "QUADRICEPS 🦵 | GLUTES 🍑 | CORE 🧘",
                certTitle: "Lower Body Strength Award",
                certSubtitle: "Wall Sit Warrior Certification"
            },
            {
                id: 9,
                text: "🏋️ Squat Star 🏅",
                attributes: "QUADRICEPS 🦵 | HAMSTRINGS 🏃 | GLUTES 🍑",
                certTitle: "Leg Strength Excellence",
                certSubtitle: "Squat Star Achievement"
            },
            {
                id: 10,
                text: "🏋️ Burpee Champion 🏅",
                attributes: "FULL BODY 🤸 | CHEST 💪 | LEGS 🦵 | CORE 🧘",
                certTitle: "Full Body Fitness Award",
                certSubtitle: "Burpee Champion Certification"
            },
            {
                id: 11,
                text: "🤸 Flexibility Ace 🏅",
                attributes: "HAMSTRINGS 🤸 | LOWER BACK 🧘",
                certTitle: "Flexibility Excellence",
                certSubtitle: "Flexibility Ace Achievement"
            },
            {
                id: 12,
                text: "🤸 Balance King/Queen 🏅",
                attributes: "CORE 🧘 | ANKLES 👣 | CALVES 🦵",
                certTitle: "Balance Mastery Award",
                certSubtitle: "Balance Excellence Certification"
            },
            {
                id: 13,
                text: "🤸 Yoga Pose Hero 🏅",
                attributes: "CORE 🧘 | BALANCE 🤸 | FLEXIBILITY 🧘‍♀️",
                certTitle: "Yoga Excellence Certificate",
                certSubtitle: "Yoga Pose Hero Achievement"
            },
            {
                id: 14,
                text: "⚡ High Knees Hustler 🏅",
                attributes: "HIP FLEXORS 🏃 | QUADS 🦵 | CORE 🧘",
                certTitle: "Cardio Fitness Award",
                certSubtitle: "High Knees Hustler Certification"
            },
            {
                id: 15,
                text: "⚡ Mountain Climber Champ 🏅",
                attributes: "CORE 🧘 | SHOULDERS 🏋️ | QUADS 🦵",
                certTitle: "Endurance Excellence",
                certSubtitle: "Mountain Climber Champion"
            },
            {
                id: 16,
                text: "⚡ Jumping Jack Star 🏅",
                attributes: "SHOULDERS 🏋️ | CALVES 🦵 | CORE 🧘",
                certTitle: "Cardiovascular Fitness Award",
                certSubtitle: "Jumping Jack Star Achievement"
            },
            {
                id: 17,
                text: "⚡ Fast Feet Sprinter 🏅",
                attributes: "CALVES 🦵 | QUADS 🦵 | GLUTES 🍑",
                certTitle: "Speed & Agility Certificate",
                certSubtitle: "Fast Feet Sprinter Excellence"
            },

            // Original Skill Badges
            {
                id: 1,
                text: "🖼️ Presentation Skills",
                attributes: "VOICE 🎤 | CONFIDENCE 💪✨ | EYE CONTACT 👀",
                certTitle: "Presentation Excellence Award",
                certSubtitle: "Mastery of Public Speaking"
            },
            {
                id: 2,
                text: "🤝 Teamwork",
                attributes: "COLLABORATION 👥 | SUPPORT 💖 | RELIABILITY ✅",
                certTitle: "Team Player Award",
                certSubtitle: "Excellence in Collaboration"
            },
            {
                id: 3,
                text: "🌟 Leadership",
                attributes: "INITIATIVE 💡 | GUIDANCE 🧭 | MOTIVATION 🔥",
                certTitle: "Leadership Excellence Certificate",
                certSubtitle: "Outstanding Leadership Qualities"
            },
            {
                id: 4,
                text: "📣 Communication",
                attributes: "CLARITY 🗣️ | PERSUASION ✍️ | LISTENING 👂",
                certTitle: "Communication Excellence Award",
                certSubtitle: "Mastery of Effective Communication"
            },
            {
                id: 5,
                text: "🤔 Problem Solving",
                attributes: "ANALYTICAL SKILLS 🧠 | CREATIVITY 🎨 | RESOURCEFULNESS 🛠️",
                certTitle: "Problem Solver Award",
                certSubtitle: "Excellence in Critical Thinking"
            },
        ],
        availableColors: {
            border: ["#2c3e50", "#800000", "#004d40", "#D4AF37", "#343a40", "#8B4513"],
            shape: ["#D4AF37", "#e67e22", "#1abc9c", "#c09f80", "#3498db", "#990000"],
            subtitle: ["#7f8c8d", "#95a5a6", "#bdc3c7", "#848482", "#d35400", "#5d6d7e"],
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

        // After login, redirect certificate creators to the dashboard
        if (user && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'dashboard.html';
            return;
        }

        renderAuthUI();
        renderApp();
    });

    // --- Firestore ---
    async function saveCertificateData() {
        if (!state.user) {
            alert("Please sign in to save the certificate.");
            return null;
        }

        /*if (!state.studentName.trim()) {
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
        }*/

        setLoading(true);
        ui.generatePdfBtn.disabled = true;

        try {
            // This is the reference to the counter document you created
            const counterRef = doc(db, "counters", "certTemplateCounter");
            let newId;

            // A transaction ensures that even if two users click save at the same time,
            // they will get different, sequential IDs without any conflict.
            await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                if (!counterDoc.exists()) {
                    throw "Counter document does not exist!";
                }

                // Get the current count and increment it for the new ID
                newId = counterDoc.data().count + 1;

                const awardeeData = {
                    //studentName: state.studentName,
                    //studentClass: state.studentClass,
                    //eventName: state.eventName,
                    organizationName: state.schoolName,
                    templateDetails: {
                        skill: state.highlight.text,
                        attributes: state.highlight.attributes,
                        certTitle: state.highlight.certTitle,
                        certSubtitle: state.highlight.certSubtitle
                    },
                    created: serverTimestamp(),
                    author: state.user.displayName,
                    authorEmail: state.user.email,
                    logoSrc: state.logoSrc,
                    signatureSrc: state.signatureSrc,
                    colors: state.colors,
                    // Optional: You can also save the sequential ID in the document itself
                    templateID: newId
                };

                // Create a reference to a new document in 'certTemplates' using the new sequential ID
                const newAwardeeRef = doc(db, "certTemplates", newId.toString());

                // In the transaction, first save the new certificate...
                transaction.set(newAwardeeRef, awardeeData);

                // ...then update the counter to the new value.
                transaction.update(counterRef, { count: newId });
            });

            console.log("Awardee saved with new sequential ID: ", newId);

            //const verificationUrl = `https://cert.pragament.com/event-verification.html?org=${encodeURIComponent(state.schoolName)}&event=${encodeURIComponent(state.eventName)}`;
            const verificationUrl = `https://cert.pragament.com/v.htm?id=${newId}`;
            state.qr.text = verificationUrl;

            return verificationUrl;

        } catch (e) {
            console.error("Transaction failed: ", e);
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
            ui.generatePdfBtn.disabled = true;
            ui.qrToggle.checked = false;
            ui.qrToggle.disabled = true;
            state.qr.enabled = false;
            ui.generatePdfBtn.innerHTML = '<i class="fas fa-save"></i> Login to Save &amp; Generate PDF';
            ui.viewCertificatesBtn.hidden = true;
            ui.authSection.innerHTML = `<button id="signInBtn" class="auth-btn"><i class="fab fa-google"></i> Sign In with Google</button>`;
            const signInBtn = document.getElementById('signInBtn');
            if (signInBtn) {
                signInBtn.addEventListener('click', signIn);
            }
        }
    }

    function loadCertificateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const certData = params.get('cert');
        if (certData) {
            try {
                const decodedData = JSON.parse(
                    decodeURIComponent(Array.from(atob(certData))
                        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                        .join(''))
                );
                Object.assign(state, decodedData);
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
        //ui.eventName.value = state.eventName;
        //ui.studentName.value = state.studentName;
        //ui.studentClass.value = state.studentClass;
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
        const { schoolName, eventName, highlight, logoSrc, signatureSrc, colors, qr } = state;
        ui.certificate.style.setProperty("--cert-border-color", colors.border);
        ui.certificate.style.setProperty("--cert-shape-color", colors.shape);
        ui.certificate.style.setProperty("--cert-subtitle-color", colors.subtitle);

        const signatureHtml = signatureSrc
            ? `<img src="${signatureSrc}" alt="Signature" class="cert-signature-img">`
            : `<div class="cert-signature-placeholder" style="height: 5vw;"></div>`;

        const genericVerificationUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}verify.html?org=${encodeURIComponent(schoolName)}&event=${encodeURIComponent(eventName)}`;
        const qrCodeContent = qr.text || genericVerificationUrl;
        const qrHtml = (qr.enabled && qrCodeContent) ? `<div class="cert-qr-area"><div id="certQrCode"></div><p>Scan to Verify</p></div>` : '<div class="cert-qr-area"></div>';

        ui.certificate.innerHTML = `
            <div class="cert-border"></div>
            <div class="cert-content">
                <div class="cert-header">
                    <img src="${logoSrc}" class="cert-logo" alt="School Logo">
                    <div class="cert-school-name">${schoolName}</div>
                </div>
                <div class="cert-body">
                    <h1 class="cert-title">${highlight.certTitle}</h1>
                    <p class="cert-event-name">${highlight.certSubtitle}</p>
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
            if (qrCodeEl) {
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
        if (type === 'checkbox') {
            state.qr.enabled = checked;
        } else if (id === 'certTitle') {
            state.highlight.certTitle = value;
        } else if (id === 'certSubtitle') {
            state.highlight.certSubtitle = value;
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

    // MODIFICATION: generatePDF function updated for new link sharing
    async function generatePDF() {
        const verificationUrl = await saveCertificateData();
        if (verificationUrl) {
            state.qr.text = verificationUrl;
            ui.qrText.value = verificationUrl;
            renderCertificatePreview();

            navigator.clipboard.writeText(verificationUrl).then(() => {
                alert("Certificate saved! The unique verification link has been copied to your clipboard.");
            });

            setTimeout(async () => {
                const { jsPDF } = window.jspdf;
                const canvas = await html2canvas(ui.certificate, { scale: 3, backgroundColor: null, useCORS: true });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${state.highlight.certTitle}_Certificate.pdf`);
                // Optional: redirect after saving
                // window.location.href = 'certificates.html';
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

    // MODIFICATION: Removed old share button functionality as it's now part of generatePDF
    ui.shareCertificateBtn.addEventListener("click", () => {
        if (ui.qrText.value) {
            navigator.clipboard.writeText(ui.qrText.value).then(() => {
                alert("Unique certificate link copied to clipboard!");
            }, () => {
                alert("Failed to copy link. Please save the certificate first.");
            });
        } else {
            alert("Please save the certificate first to generate a shareable link.");
        }
    });

    // Initial setup
    loadCertificateFromUrl();
    renderApp();

} catch (error) {
    console.error("Firebase initialization failed. Please check your config.", error);
    document.body.innerHTML = `<div style="font-family: sans-serif; padding: 2rem;">
        <h1>Error: Firebase Initialization Failed</h1>
        <p>The application could not start. This is likely because the Firebase configuration is missing or incorrect in your <code>firebase-config.js</code> file.</p>
        <p>Please follow the setup guide to create a Firebase project and paste your configuration into the <code>firebaseConfig</code> object in the script.</p>
    </div>`;
}