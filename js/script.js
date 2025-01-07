document.addEventListener("DOMContentLoaded", function () {
    const pollForm = document.getElementById("poll-form");
    const pollResults = document.getElementById("poll-results");

    // Backend API URL
    const API_URL = "http://127.0.0.1:5000/api";

    // Fetch votes from the backend
    async function fetchVotes() {
        const response = await fetch(`${API_URL}/votes`);
        return response.json();
    }

    // Submit a vote
    async function submitVote(option) {
        await fetch(`${API_URL}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ option }),
        });
    }

    // Update results on the page
    function updateResults(votes) {
        const totalVotes = votes.speed + votes.design + votes.visibility;

        if (totalVotes === 0) return; // Avoid division by zero

        const speedPercentage = Math.round((votes.speed / totalVotes) * 100);
        const designPercentage = Math.round((votes.design / totalVotes) * 100);
        const visibilityPercentage = Math.round((votes.visibility / totalVotes) * 100);

        document.getElementById("speed-bar").style.width = `${speedPercentage}%`;
        document.getElementById("design-bar").style.width = `${speedPercentage}%`;
        document.getElementById("visibility-bar").style.width = `${visibilityPercentage}%`;

        document.getElementById("speed-percentage").textContent = `${speedPercentage}%`;
        document.getElementById("design-percentage").textContent = `${designPercentage}%`;
        document.getElementById("visibility-percentage").textContent = `${visibilityPercentage}%`;
    }

    // Initialize poll
    async function initializePoll() {
        const votes = await fetchVotes();
        updateResults(votes);
        pollResults.style.display = "block";
    }

    // Handle form submission
    pollForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        if (userVote) {
            await submitVote(userVote);
            pollForm.style.display = "none";
            const votes = await fetchVotes();
            updateResults(votes);
        }
    });

    // Fetch initial results
    initializePoll();
});
