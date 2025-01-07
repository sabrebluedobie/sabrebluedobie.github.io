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
    
        // Calculate percentages
        const percentages = {
            speed: Math.round((votes.speed / totalVotes) * 100),
            design: Math.round((votes.design / totalVotes) * 100),
            visibility: Math.round((votes.visibility / totalVotes) * 100),
        };
    
        // Find the highest percentage
        const highest = Math.max(percentages.speed, percentages.design, percentages.visibility);
    
        // Update progress bars and set colors
        const bars = {
            speed: document.getElementById("speed-bar"),
            design: document.getElementById("design-bar"),
            visibility: document.getElementById("visibility-bar"),
        };
    
        const labels = {
            speed: document.getElementById("speed-percentage"),
            design: document.getElementById("design-percentage"),
            visibility: document.getElementById("visibility-percentage"),
        };
    
        for (const [option, percentage] of Object.entries(percentages)) {
            bars[option].style.width = `${percentage}%`;
            labels[option].textContent = `${percentage}%`;
    
            // Set color: Green for highest, Red for others
            bars[option].style.backgroundColor = percentage === highest ? "#4caf50" : "#f44336";
        }
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
