import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const certificateEl = document.getElementById('certificate');
    const params = new URLSearchParams(window.location.search);
    const certificateId = params.get('id');

    if (!certificateId) {
        certificateEl.innerHTML = '<p style="text-align:center; width:100%;">Error: No Certificate ID found in URL.</p>';
        return;
    }

    try {
        const docRef = doc(db, "awardees", certificateId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const state = docSnap.data();
            renderCertificate(state);
        } else {
            certificateEl.innerHTML = '<p style="text-align:center; width:100%;">Error: Certificate not found.</p>';
        }

    } catch (error) {
        console.error("Error fetching certificate:", error);
        certificateEl.innerHTML = '<p style="text-align:center; width:100%;">Error: Could not display certificate.</p>';
    }
    
    function renderCertificate(state) {
        // Use default values that match initial state in script.js for consistency
        const schoolName = state.organizationName || "DELHI SECONDARY SCHOOL"; // Use organizationName from DB
        const eventName = state.eventName || "Fitness Challenge";
        const studentName = state.studentName || "Student Name";
        const studentClass = state.studentClass || ""; // Assuming this isn't displayed directly on the cert in view
        
        // Ensure highlight has correct structure, matching script.js
        const highlight = state.certificateDetails || { 
            skill: "Achievement", 
            attributes: "" 
        };
        
        const logoSrc = state.logoSrc || "https://i.ibb.co/bF03NC6/logo-removebg-preview.png"; // Default logo
        const signatureSrc = state.signatureSrc || "";

        const colors = state.colors || { 
            border: "#2c3e50", 
            shape: "#D4AF37", 
            subtitle: "#7f8c8d" 
        };

        // QR code logic, retrieve from saved state or generate generic URL
        const qrEnabled = state.qr?.enabled ?? true; // Default to true if not specified
        const genericVerificationUrl = `${window.location.origin}${window.location.pathname.replace('view.html', '')}verify.html?org=${encodeURIComponent(schoolName)}&event=${encodeURIComponent(eventName)}`;
        const qrCodeContent = state.qr?.text || genericVerificationUrl;

        certificateEl.style.setProperty("--cert-border-color", colors.border);
        certificateEl.style.setProperty("--cert-shape-color", colors.shape);
        certificateEl.style.setProperty("--cert-subtitle-color", colors.subtitle);

        const signatureHtml = signatureSrc 
            ? `<img src="${signatureSrc}" alt="Signature" class="cert-signature-img">` 
            : `<div class="cert-signature-placeholder" style="height: 5vw;"></div>`;
        
        const qrHtml = (qrEnabled && qrCodeContent) 
            ? `<div class="cert-qr-area"><div id="certQrCode"></div><p>Scan to Verify</p></div>` 
            : `<div class="cert-qr-area"></div>`; // Render empty div if QR is not enabled or content is missing

        certificateEl.innerHTML = `
            <div class="cert-border"></div>
            <div class="cert-content">
                <div class="cert-header">
                    <img src="${logoSrc}" class="cert-logo" alt="School Logo">
                    <div class="cert-school-name">${schoolName}</div>
                </div>
                <div class="cert-body">
                    <p class="cert-awardee-intro">This certificate is proudly presented to</p>
                    <h2 class="cert-awardee-name">${studentName}</h2>
                    <h1 class="cert-title">CERTIFICATE OF ACHIEVEMENT</h1>
                    <p class="cert-event-name">for outstanding performance in the ${eventName}</p>
                    <div class="cert-highlight-script">${highlight.skill}</div>
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
        
        // Only generate QR code if it's enabled and content exists
        if (qrEnabled && qrCodeContent) {
            const qrCodeEl = document.getElementById("certQrCode");
            if(qrCodeEl) {
                new QRCode(qrCodeEl, { text: qrCodeContent, width: 128, height: 128 });
            }
        }
    }
});