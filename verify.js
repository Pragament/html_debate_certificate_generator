import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';

// DOM Elements
const certInfoEl = document.getElementById('certInfo');
const resultsContainerEl = document.getElementById('resultsContainer');
const filterDateEl = document.getElementById('filterDate');
const filterClassEl = document.getElementById('filterClass');

let allAwardees = []; // To store the initial fetch for client-side filtering

// Function to render the list of certTemplates
function renderResults(certTemplates) {
    if (certTemplates.length === 0) {
        resultsContainerEl.innerHTML = '<p class="no-results">No matching certTemplates found.</p>';
        return;
    }

    const table = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Class / Grade</th>
                    <th>Date Awarded</th>
                </tr>
            </thead>
            <tbody>
                ${certTemplates.map(awardee => `
                    <tr>
                        <td>${awardee.studentName}</td>
                        <td>${awardee.studentClass}</td>
                        <td>${awardee.created.toDate().toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    resultsContainerEl.innerHTML = table;
}

// Function to apply filters and re-render
function applyFilters() {
    const dateFilter = filterDateEl.value;
    const classFilter = filterClassEl.value.trim().toLowerCase();

    let filteredAwardees = allAwardees;

    if (dateFilter) {
        filteredAwardees = filteredAwardees.filter(awardee => {
            // Compare year, month, and day, ignoring time
            return awardee.created.toDate().toISOString().split('T')[0] === dateFilter;
        });
    }

    if (classFilter) {
        filteredAwardees = filteredAwardees.filter(awardee => 
            awardee.studentClass.toLowerCase().includes(classFilter)
        );
    }

    renderResults(filteredAwardees);
}


// Main function to load data on page start
async function loadVerificationData() {
    try {
        const params = new URLSearchParams(window.location.search);
        const orgName = params.get('org');
        const eventName = params.get('event');

        if (!orgName || !eventName) {
            certInfoEl.textContent = 'Invalid verification link. Organization or event name is missing.';
            resultsContainerEl.innerHTML = '';
            return;
        }

        certInfoEl.innerHTML = `Displaying certTemplates for <strong>${eventName}</strong> at <strong>${orgName}</strong>.`;
        
        // Query Firestore for all certTemplates matching the org and event
        const q = query(
            collection(db, "certTemplates"),
            where("organizationName", "==", orgName),
            where("eventName", "==", eventName),
            orderBy("created", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        allAwardees = querySnapshot.docs.map(doc => doc.data());
        
        if (querySnapshot.empty) {
             resultsContainerEl.innerHTML = '<p class="no-results">No certTemplates found for this certificate.</p>';
        } else {
             renderResults(allAwardees);
        }

    } catch (error) {
        console.error("Error loading certificate data:", error);
        resultsContainerEl.innerHTML = '<p class="no-results">Error: Could not load verification data. Ensure your Firestore security rules allow public reads on the "certTemplates" collection.</p>';
    }
}

// Event Listeners
filterDateEl.addEventListener('input', applyFilters);
filterClassEl.addEventListener('input', applyFilters);

// Initial Load
document.addEventListener('DOMContentLoaded', loadVerificationData);