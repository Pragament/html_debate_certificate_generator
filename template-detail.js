import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const ui = {
    templateTitle: document.getElementById('templateTitle'),
    templateSubtitle: document.getElementById('templateSubtitle'),
    templateMeta: document.getElementById('templateMeta'),
    awardsContainer: document.getElementById('awardsContainer'),
    filterClass: document.getElementById('filterClass'),
    filterRoll: document.getElementById('filterRoll'),
    filterName: document.getElementById('filterName'),
    sortBy: document.getElementById('sortBy'),
};

const provider = new GoogleAuthProvider();
let currentUser = null;
let templateDocId = null;
let templateData = null;
let awards = [];

function getTemplateDocIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function applyFiltersAndSort() {
    const classFilter = ui.filterClass.value.trim().toLowerCase();
    const rollFilter = ui.filterRoll.value.trim().toLowerCase();
    const nameFilter = ui.filterName.value.trim().toLowerCase();
    const sortField = ui.sortBy.value;

    let filtered = awards.slice();

    if (classFilter) {
        filtered = filtered.filter(a => (a.className || '').toLowerCase().includes(classFilter));
    }
    if (rollFilter) {
        filtered = filtered.filter(a => (a.rollNumber || '').toString().toLowerCase().includes(rollFilter));
    }
    if (nameFilter) {
        filtered = filtered.filter(a => (a.studentName || '').toLowerCase().includes(nameFilter));
    }

    filtered.sort((a, b) => {
        const av = (a[sortField] || '').toString().toLowerCase();
        const bv = (b[sortField] || '').toString().toLowerCase();
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
    });

    renderAwardsTable(filtered);
}

function renderAwardsTable(list) {
    if (!list.length) {
        ui.awardsContainer.innerHTML = '<p class="text-muted">No students have been awarded this certificate yet.</p>';
        return;
    }

    const rows = list.map(a => {
        const awardedAt = a.createdAt ? new Date(a.createdAt).toLocaleString() : '';
        return `
            <tr>
                <td>${a.className || ''}</td>
                <td>${a.rollNumber || ''}</td>
                <td>${a.studentName || ''}</td>
                <td>${awardedAt}</td>
            </tr>
        `;
    });

    ui.awardsContainer.innerHTML = `
        <table class="awards-table">
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Awarded At</th>
                </tr>
            </thead>
            <tbody>
                ${rows.join('')}
            </tbody>
        </table>
    `;
}

async function loadTemplate() {
    if (!templateDocId) return;
    try {
        const ref = doc(db, 'certTemplates', templateDocId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            ui.templateTitle.textContent = 'Template not found';
            ui.templateSubtitle.textContent = '';
            ui.awardsContainer.innerHTML = '<p class="text-muted">No template found.</p>';
            return;
        }
        templateData = snap.data();
        const id = templateData.templateID || snap.id;
        const title = templateData.templateDetails?.certTitle || 'Certificate Template';
        const subtitle = templateData.templateDetails?.certSubtitle || '';
        ui.templateTitle.textContent = title;
        ui.templateSubtitle.textContent = subtitle ? `${subtitle} (ID: ${id})` : `ID: ${id}`;
        ui.templateMeta.textContent = `Template ID: ${id}`;
    } catch (e) {
        console.error('Error loading template:', e);
        ui.awardsContainer.innerHTML = '<p class="text-muted">Failed to load template.</p>';
    }
}

async function loadAwards() {
    if (!templateDocId) return;
    ui.awardsContainer.innerHTML = '<p class="text-muted">Loading awarded students...</p>';
    try {
        const q = query(
            collection(db, 'studentAwards'),
            where('templateDocId', '==', templateDocId),
        );
        const snapshot = await getDocs(q);
        awards = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            awards.push({
                id: docSnap.id,
                className: data.className || '',
                rollNumber: data.rollNumber || '',
                studentName: data.studentName || '',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
            });
        });

        applyFiltersAndSort();
    } catch (e) {
        console.error('Error loading awards:', e);
        ui.awardsContainer.innerHTML = '<p class="text-muted">Failed to load awarded students.</p>';
    }
}

// Hook up filters and sort
['input', 'change'].forEach(evt => {
    ui.filterClass.addEventListener(evt, applyFiltersAndSort);
    ui.filterRoll.addEventListener(evt, applyFiltersAndSort);
    ui.filterName.addEventListener(evt, applyFiltersAndSort);
});
ui.sortBy.addEventListener('change', applyFiltersAndSort);

// Init
templateDocId = getTemplateDocIdFromUrl();
if (!templateDocId) {
    ui.templateTitle.textContent = 'No template selected';
    ui.templateSubtitle.textContent = '';
    ui.awardsContainer.innerHTML = '<p class="text-muted">No templateDocId provided in URL.</p>';
} else {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        loadTemplate();
        loadAwards();
    });
}


