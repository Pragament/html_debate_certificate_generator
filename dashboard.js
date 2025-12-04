import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    addDoc,
    serverTimestamp,
    writeBatch,
    doc,
    query,
    where,
    orderBy,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const ui = {
    userBadge: document.getElementById('userBadge'),
    toggleCreateClassBtn: document.getElementById('toggleCreateClassBtn'),
    createClassSection: document.getElementById('createClassSection'),
    className: document.getElementById('className'),
    studentsCsv: document.getElementById('studentsCsv'),
    createClassBtn: document.getElementById('createClassBtn'),
    createClassStatus: document.getElementById('createClassStatus'),
    classesContainer: document.getElementById('classesContainer'),
    refreshClassesBtn: document.getElementById('refreshClassesBtn'),
};

const provider = new GoogleAuthProvider();
let currentUser = null;
let isCreating = false;

function setStatus(message) {
    ui.createClassStatus.textContent = message || '';
}

function setUserBadge(user) {
    if (!user) {
        ui.userBadge.textContent = '';
        return;
    }
    ui.userBadge.textContent = `${user.displayName || user.email}`;
}

function ensureSignedIn() {
    if (currentUser) return Promise.resolve(currentUser);
    return signInWithPopup(auth, provider).then(result => {
        currentUser = result.user;
        setUserBadge(currentUser);
        return currentUser;
    });
}

function parseStudentsCsv(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];

    let startIndex = 0;
    // If first line looks like a header, skip it
    if (/name/i.test(lines[0]) && /roll/i.test(lines[0])) {
        startIndex = 1;
    }

    const students = [];
    for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 2) continue;
        const name = parts[0];
        const rollNumber = parts[1];
        if (!name || !rollNumber) continue;
        students.push({ name, rollNumber });
    }
    return students;
}

async function handleCreateClass() {
    if (isCreating) return;
    const className = ui.className.value.trim();
    const file = ui.studentsCsv.files[0];

    if (!className) {
        setStatus('Please enter a class name.');
        return;
    }
    if (!file) {
        setStatus('Please select a CSV file of students.');
        return;
    }

    try {
        isCreating = true;
        ui.createClassBtn.disabled = true;
        setStatus('Reading CSV...');

        const user = await ensureSignedIn();
        const fileText = await file.text();
        const students = parseStudentsCsv(fileText);

        if (!students.length) {
            setStatus('No valid students found in CSV.');
            return;
        }

        setStatus(`Creating class and ${students.length} students...`);

        // Create class document
        const classRef = await addDoc(collection(db, 'classes'), {
            name: className,
            ownerUid: user.uid,
            ownerEmail: user.email,
            createdAt: serverTimestamp(),
        });

        // Create students as subcollection
        const batch = writeBatch(db);
        const studentsCol = collection(db, 'classes', classRef.id, 'students');

        students.forEach(st => {
            const studentDocRef = doc(studentsCol);
            batch.set(studentDocRef, {
                name: st.name,
                rollNumber: st.rollNumber,
                createdAt: serverTimestamp(),
            });
        });

        await batch.commit();

        setStatus('Class created successfully. Redirecting to class details...');
        // Small delay to show status
        setTimeout(() => {
            window.location.href = `class-detail.html?classId=${encodeURIComponent(classRef.id)}`;
        }, 800);
    } catch (e) {
        console.error('Error creating class:', e);
        setStatus('Failed to create class. Please try again.');
    } finally {
        isCreating = false;
        ui.createClassBtn.disabled = false;
    }
}

async function loadClasses() {
    if (!currentUser) {
        ui.classesContainer.innerHTML = '<p class="text-muted">Sign in to see your classes.</p>';
        return;
    }
    ui.classesContainer.innerHTML = '<p class="text-muted">Loading classes...</p>';

    try {
        const q = query(
            collection(db, 'classes'),
            where('ownerUid', '==', currentUser.uid),
            orderBy('createdAt', 'desc'),
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            ui.classesContainer.innerHTML = '<p class="text-muted">No classes created yet.</p>';
            return;
        }

        const rows = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const created = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '';
            rows.push(`
                <tr>
                    <td>${data.name || ''}</td>
                    <td>${created}</td>
                    <td>
                        <button class="btn btn-table btn-small" data-class-id="${docSnap.id}">View Class</button>
                    </td>
                </tr>
            `);
        });

        ui.classesContainer.innerHTML = `
            <table class="classes-table">
                <thead>
                    <tr>
                        <th>Class Name</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;

        // Attach click handlers
        ui.classesContainer.querySelectorAll('button[data-class-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const classId = btn.getAttribute('data-class-id');
                window.location.href = `class-detail.html?classId=${encodeURIComponent(classId)}`;
            });
        });
    } catch (e) {
        console.error('Error loading classes:', e);
        ui.classesContainer.innerHTML = '<p class="text-muted">Failed to load classes.</p>';
    }
}

// Event bindings
ui.toggleCreateClassBtn.addEventListener('click', () => {
    const isHidden = ui.createClassSection.classList.contains('hidden');
    ui.createClassSection.classList.toggle('hidden', !isHidden);
    ui.toggleCreateClassBtn.textContent = isHidden ? 'Hide Form' : 'Show Form';
});

ui.createClassBtn.addEventListener('click', handleCreateClass);
ui.refreshClassesBtn.addEventListener('click', loadClasses);

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (!user) {
        // If not signed in, send them back to main login page
        window.location.href = 'index.html';
        return;
    }
    setUserBadge(user);
    loadClasses();
});


