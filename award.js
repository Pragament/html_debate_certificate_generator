import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const provider = new GoogleAuthProvider();
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');

function status(msg) { statusEl.textContent = msg; }

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        status('Sign-in required. Opening Google sign-in...');
        try { await signInWithPopup(auth, provider); status('Signed in.'); } catch (e) { status('Sign-in failed.'); }
    } else {
        status('Signed in as ' + (user.displayName || user.email));
    }
});

saveBtn.addEventListener('click', async () => {
    const studentName = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value.trim();
    const organizationName = document.getElementById('organizationName').value.trim();
    const eventName = document.getElementById('eventName').value.trim();
    const skill = document.getElementById('skill').value.trim();
    const attributes = document.getElementById('attributes').value.trim();

    if (!studentName || !studentClass || !organizationName || !eventName) {
        status('Please fill all required fields.');
        return;
    }

    try {
        saveBtn.disabled = true;
        status('Saving...');
        await addDoc(collection(db, 'awardees'), {
            studentName,
            studentClass,
            organizationName,
            eventName,
            certificateDetails: { skill, attributes },
            awardedAt: serverTimestamp(),
        });
        status('Saved. Redirecting to list...');
        window.location.href = 'certificates.html';
    } catch (e) {
        console.error(e);
        status('Failed to save award.');
    } finally {
        saveBtn.disabled = false;
    }
});