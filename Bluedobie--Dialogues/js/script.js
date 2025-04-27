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
            alert("Failed to load poll results. Please check your network or contact support.");
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
            if (error.message.includes("CORS")) {
                alert("CORS policy error. Please ensure your backend is configured to accept requests from this origin.");
            } else {
                alert("An error occurred while submitting your vote. Please try again later.");
            }
        }
    }

    // Update results on the page
    function updateResults(votes) {
        const totalVotes = votes.speed + votes.design + votes.visibility;

        if (totalVotes === 0) {
            console.log("No votes yet.");
            return; // Avoid division by zero and unnecessary updates
        }

        const percentages = {
            speed: (votes.speed / totalVotes) * 100,
            design: (votes.design / totalVotes) * 100,
            visibility: (votes.visibility / totalVotes) * 100,
        };

        const highest = Math.max(percentages.speed, percentages.design, percentages.visibility);

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
            bars[option].style.width = `${percentages[option].toFixed(2)}%`;
            bars[option].style.backgroundColor =
                percentages[option] === highest ? "#4caf50" : "#f44336";
            labels[option].textContent = `${percentages[option].toFixed(2)}%`;
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
        e.preventDefault();

        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        if (userVote) {
            console.log("Submitting vote for:", userVote);
            await submitVote(userVote);
            pollForm.style.display = "none";
            const updatedVotes = await fetchVotes();
            updateResults(updatedVotes);
        } else {
            alert("Please select an option before voting.");
        }
    });

    // Fetch initial results
    initializePoll();
});

