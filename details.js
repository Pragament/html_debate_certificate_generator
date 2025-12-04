import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const detailsContainer = document.getElementById('detailsContainer');
    const params = new URLSearchParams(window.location.search);
    const certificateId = params.get('id');

    if (!certificateId) {
        detailsContainer.innerHTML = '<h1>Error: No Certificate ID provided.</h1>';
        return;
    }

    try {
        const docRef = doc(db, "awardees", certificateId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const awardedDate = data.awardedAt?.toDate ? data.awardedAt.toDate().toLocaleDateString() : 'N/A';

            detailsContainer.innerHTML = `
                <h2>Certificate Verification</h2>
                <p>The following certificate has been successfully verified.</p>
                <table class="details-table">
                    <tbody>
                        <tr>
                            <td>Student Name</td>
                            <td>${data.studentName || ''}</td>
                        </tr>
                        <tr>
                            <td>Class / Grade</td>
                            <td>${data.studentClass || ''}</td>
                        </tr>
                        <tr>
                            <td>Event Name</td>
                            <td>${data.eventName || ''}</td>
                        </tr>
                         <tr>
                            <td>Organization</td>
                            <td>${data.organizationName || ''}</td>
                        </tr>
                        <tr>
                            <td>Date Awarded</td>
                            <td>${awardedDate}</td>
                        </tr>
                    </tbody>
                </table>
                <a href="v.htm?id=${certificateId}" target="_blank" class="btn btn-open">Open Certificate</a>
            `;
        } else {
            detailsContainer.innerHTML = '<h1>Verification Failed</h1><p>Certificate not found.</p>';
        }

    } catch (error) {
        console.error("Error fetching certificate:", error);
        detailsContainer.innerHTML = '<h1>Error</h1><p>Could not retrieve certificate details.</p>';
    }
});