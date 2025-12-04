import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const ui = {
    classTitle: document.getElementById('classTitle'),
    classSubtitle: document.getElementById('classSubtitle'),
    studentsContainer: document.getElementById('studentsContainer'),
    awardPanel: document.getElementById('awardPanel'),
    awardStudentInfo: document.getElementById('awardStudentInfo'),
    templateSelect: document.getElementById('templateSelect'),
    awardBtn: document.getElementById('awardBtn'),
    awardStatus: document.getElementById('awardStatus'),
};

const provider = new GoogleAuthProvider();
let currentUser = null;
let classId = null;
let classData = null;
let templates = [];
let selectedStudent = null;
let awardInProgress = false;

function setAwardStatus(message) {
    ui.awardStatus.textContent = message || '';
}

function getClassIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId');
}

async function ensureSignedIn() {
    if (currentUser) return currentUser;
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    return currentUser;
}

async function loadClass() {
    if (!classId) return;
    try {
        const classDocRef = doc(db, 'classes', classId);
        const classSnap = await getDoc(classDocRef);
        if (!classSnap.exists()) {
            ui.classTitle.textContent = 'Class not found';
            ui.classSubtitle.textContent = '';
            ui.studentsContainer.innerHTML = '<p class="text-muted">No class found.</p>';
            return;
        }
        classData = classSnap.data();
        ui.classTitle.textContent = classData.name || 'Class';
        const created = classData.createdAt?.toDate ? classData.createdAt.toDate().toLocaleString() : '';
        ui.classSubtitle.textContent = created ? `Created ${created}` : '';

        await loadStudents();
        await loadTemplates();
    } catch (e) {
        console.error('Error loading class:', e);
        ui.studentsContainer.innerHTML = '<p class="text-muted">Failed to load class.</p>';
    }
}

async function loadStudents() {
    ui.studentsContainer.innerHTML = '<p class="text-muted">Loading students...</p>';
    try {
        const studentsCol = collection(db, 'classes', classId, 'students');
        const q = query(studentsCol, orderBy('rollNumber'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            ui.studentsContainer.innerHTML = '<p class="text-muted">No students found in this class.</p>';
            return;
        }

        const rows = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            rows.push(`
                <tr>
                    <td>${data.rollNumber || ''}</td>
                    <td>${data.name || ''}</td>
                    <td>
                        <button class="btn btn-table btn-small" data-student-id="${docSnap.id}">Award Certificate</button>
                    </td>
                </tr>
            `);
        });

        ui.studentsContainer.innerHTML = `
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        `;

        // Attach click listeners
        ui.studentsContainer.querySelectorAll('button[data-student-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const studentId = btn.getAttribute('data-student-id');
                const row = btn.closest('tr');
                const rollNumber = row.children[0].textContent;
                const name = row.children[1].textContent;
                openAwardPanel({ id: studentId, rollNumber, name });
            });
        });
    } catch (e) {
        console.error('Error loading students:', e);
        ui.studentsContainer.innerHTML = '<p class="text-muted">Failed to load students.</p>';
    }
}

async function loadTemplates() {
    ui.templateSelect.innerHTML = '<option value="">Loading templates...</option>';
    try {
        const templatesCol = collection(db, 'certTemplates');
        const q = query(templatesCol, orderBy('templateID'));
        const snapshot = await getDocs(q);

        templates = [];
        const options = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = data.templateID || docSnap.id;
            const title = data.templateDetails?.certTitle || 'Template';
            const subtitle = data.templateDetails?.certSubtitle || '';
            templates.push({ id, docId: docSnap.id, data });
            options.push(
                `<option value="${docSnap.id}">${title}${subtitle ? ' - ' + subtitle : ''} (ID: ${id})</option>`
            );
        });

        if (!templates.length) {
            ui.templateSelect.innerHTML = '<option value="">No templates found</option>';
            ui.templateSelect.disabled = true;
            return;
        }

        ui.templateSelect.disabled = false;
        ui.templateSelect.innerHTML = `<option value="">Select a template</option>${options.join('')}`;
    } catch (e) {
        console.error('Error loading templates:', e);
        ui.templateSelect.innerHTML = '<option value="">Failed to load templates</option>';
        ui.templateSelect.disabled = true;
    }
}

function openAwardPanel(student) {
    selectedStudent = student;
    ui.awardStudentInfo.textContent = `Awarding certificate to ${student.name} (Roll: ${student.rollNumber})`;
    ui.awardPanel.hidden = false;
    setAwardStatus('');
}

async function handleAward() {
    if (awardInProgress || !selectedStudent) return;

    const templateDocId = ui.templateSelect.value;
    if (!templateDocId) {
        setAwardStatus('Please select a certificate template.');
        return;
    }

    try {
        awardInProgress = true;
        ui.awardBtn.disabled = true;
        setAwardStatus('Saving award...');

        const user = await ensureSignedIn();

        await addDoc(collection(db, 'studentAwards'), {
            classId,
            className: classData?.name || '',
            studentId: selectedStudent.id,
            studentName: selectedStudent.name,
            rollNumber: selectedStudent.rollNumber,
            templateDocId,
            awardedByUid: user.uid,
            awardedByEmail: user.email,
            createdAt: serverTimestamp(),
        });

        setAwardStatus('Award saved successfully.');
    } catch (e) {
        console.error('Error saving award:', e);
        setAwardStatus('Failed to save award. Please try again.');
    } finally {
        awardInProgress = false;
        ui.awardBtn.disabled = false;
    }
}

ui.awardBtn.addEventListener('click', handleAward);

// Init
classId = getClassIdFromUrl();
if (!classId) {
    ui.classTitle.textContent = 'No class selected';
    ui.classSubtitle.textContent = '';
    ui.studentsContainer.innerHTML = '<p class="text-muted">No classId provided in URL.</p>';
} else {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        loadClass();
    });
}


