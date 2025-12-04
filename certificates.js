import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

const provider = new GoogleAuthProvider();
const certListEl = document.getElementById('certList');
const filterDateEl = document.getElementById('filterDate');
const filterClassEl = document.getElementById('filterClass');
const filterSearchEl = document.getElementById('filterSearch');

let allCertificates = []; // This will hold the master list of fetched certificates

// Renders the list of certificates into the table
function renderList(certificates) {
    certListEl.innerHTML = ''; // Clear the current list

    if (certificates.length === 0) {
        certListEl.innerHTML = '<p style="text-align:center; padding: 2rem;">No matching certificates found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Create table header
    table.innerHTML = `
        <thead>
            <tr style="text-align: left; border-bottom: 2px solid var(--border-color);">
                <th style="padding: 0.75rem;">Student Name</th>
                <th style="padding: 0.75rem;">Class</th>
                <th style="padding: 0.75rem;">Event Name</th>
                <th style="padding: 0.75rem;">Date Awarded</th>
                <th style="padding: 0.75rem; text-align:right;">Action</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    certificates.forEach(({ id, data }) => {
        const row = createRowElement(id, data);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    certListEl.appendChild(table);
}

// Creates a single table row element for a certificate
function createRowElement(id, data) {
    const item = document.createElement('tr');
    item.style.borderBottom = '1px solid var(--border-color)';
    
    const awardedDate = data.awardedAt?.toDate ? data.awardedAt.toDate().toLocaleDateString() : 'N/A';

    item.innerHTML = `
        <td style="padding: 0.75rem;"><strong>${data.studentName || ''}</strong></td>
        <td style="padding: 0.75rem;">${data.studentClass || ''}</td>
        <td style="padding: 0.75rem;">${data.eventName || ''}</td>
        <td style="padding: 0.75rem;">${awardedDate}</td>
        <td style="padding: 0.75rem; text-align:right;">
            <a href="v.htm?id=${id}" target="_blank"><button class="btn">Open</button></a>
        </td>
    `;
    return item;
}

// Applies all active filters to the master list and re-renders it
function applyFilters() {
    const dateFilter = filterDateEl.value;
    const classFilter = filterClassEl.value.trim().toLowerCase();
    const searchFilter = filterSearchEl.value.trim().toLowerCase();

    let filtered = allCertificates;

    if (dateFilter) {
        filtered = filtered.filter(({ data }) => {
            if (!data.awardedAt?.toDate) return false;
            return data.awardedAt.toDate().toISOString().split('T')[0] === dateFilter;
        });
    }

    if (classFilter) {
        filtered = filtered.filter(({ data }) => 
            data.studentClass?.toLowerCase().includes(classFilter)
        );
    }

    if (searchFilter) {
        filtered = filtered.filter(({ data }) => 
            data.studentName?.toLowerCase().includes(searchFilter) ||
            data.eventName?.toLowerCase().includes(searchFilter)
        );
    }

    renderList(filtered);
}

// Loads the initial list of certificates from Firestore
async function loadCertificates() {
    certListEl.innerHTML = '<div class="loader"></div>';
    const q = query(collection(db, 'awardees'), orderBy('awardedAt', 'desc'), limit(100)); // Increased limit
    const snap = await getDocs(q);
    
    allCertificates = snap.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    
    renderList(allCertificates);
}

// Add event listeners to the filter inputs
filterDateEl.addEventListener('input', applyFilters);
filterClassEl.addEventListener('input', applyFilters);
filterSearchEl.addEventListener('input', applyFilters);

// Initial authentication check and data load
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        try { await signInWithPopup(auth, provider); } catch (e) { console.error(e); }
    }
    loadCertificates().catch(err => {
        console.error(err);
        certListEl.textContent = 'Failed to load certificates.';
    });
});