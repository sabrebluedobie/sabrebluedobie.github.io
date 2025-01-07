document.addEventListener("DOMContentLoaded", function () {
    const pollForm = document.getElementById("poll-form");
    const pollResults = document.getElementById("poll-results");

    // Backend API URL
    const API_URL = "http://127.0.0.1:5000";

    // Fetch votes from the backend
    async function fetchVotes() {
        try {
            const response = await fetch(`${API_URL}/votes`);
            if (!response.ok) {
                throw new Error(`Failed to fetch votes: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching votes:", error);
            return { speed: 0, design: 0, visibility: 0 }; // Default empty data on failure
        }
    }

    // Submit a vote to the backend
    async function submitVote(option) {
        try {
            const response = await fetch(`${API_URL}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ option }),
            });

            if (!response.ok) {
                throw new Error(`Failed to submit vote: ${response.statusText}`);
            }

            console.log("Vote submitted successfully");
        } catch (error) {
            console.error("Error submitting vote:", error);
            alert("An error occurred while submitting your vote. Please try again.");
        }
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

        Object.keys(bars).forEach((option) => {
            bars[option].style.width = `${percentages[option]}%`;

            if (percentages[option] === highest) {
                bars[option].style.backgroundColor = "#4caf50"; // Green for highest
            } else {
                bars[option].style.backgroundColor = "#f44336"; // Red for others
            }

            labels[option].textContent = `${percentages[option]}%`;
        });
    }

    // Initialize poll
    async function initializePoll() {
        const votes = await fetchVotes();
        updateResults(votes);
        pollResults.style.display = "block";
    }

    // Handle form submission
    pollForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent page refresh
        console.log("Vote button clicked!");

        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        if (userVote) {
            console.log("Submitting vote for:", userVote);
            await submitVote(userVote);
            pollForm.style.display = "none";
            const updatedVotes = await fetchVotes();
            updateResults(updatedVotes);
        } else {
            console.log("No vote selected.");
            alert("Please select an option before voting.");
        }
    });

    // Fetch initial results
    initializePoll();
});
