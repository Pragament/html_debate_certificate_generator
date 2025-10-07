import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const orgName = params.get('org');
    const eventName = params.get('event');

    const eventNameEl = document.getElementById('eventName');
    const organizationNameEl = document.getElementById('organizationName');
    const resultsContainerEl = document.getElementById('resultsContainer');

    if (!orgName || !eventName) {
        eventNameEl.textContent = 'Error';
        organizationNameEl.textContent = 'Invalid verification link.';
        resultsContainerEl.innerHTML = '';
        return;
    }

    eventNameEl.textContent = `Awardees for: ${eventName}`;
    organizationNameEl.textContent = `Organization: ${orgName}`;

    try {
        const q = query(
            collection(db, "awardees"),
            where("organizationName", "==", orgName),
            where("eventName", "==", eventName),
            orderBy("studentName", "asc") // Order alphabetically by name
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            resultsContainerEl.innerHTML = '<p>No awardees found for this event.</p>';
            return;
        }

        let tableHtml = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Class / Grade</th>
                        <th>Event Name</th>
                        <th>Date Awarded</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const awardedDate = data.awardedAt?.toDate ? data.awardedAt.toDate().toLocaleDateString() : 'N/A';
            // Each name is a link to the details page, and the button links to the view page
            tableHtml += `
                <tr>
                    <td><a href="details.html?id=${doc.id}">${data.studentName}</a></td>
                    <td>${data.studentClass}</td>
                    <td>${data.eventName}</td>
                    <td>${awardedDate}</td>
                    <td><a href="view.html?id=${doc.id}" target="_blank" class="btn btn-table">Open</a></td>
                </tr>
            `;
        });

        tableHtml += '</tbody></table>';
        resultsContainerEl.innerHTML = tableHtml;

    } catch (error) {
        console.error("Error loading awardee list:", error);
        resultsContainerEl.innerHTML = '<p>Error: Could not load verification data.</p>';
    }
});