document.addEventListener("DOMContentLoaded", function () {
    const pollForm = document.getElementById("poll-form");
    const pollResults = document.getElementById("poll-results");

    // Retrieve votes from localStorage or initialize
    const votes = JSON.parse(localStorage.getItem("pollVotes")) || {
        speed: 0,
        design: 0,
        visibility: 0
    };

    // Update results
    function updateResults() {
        const totalVotes = votes.speed + votes.design + votes.visibility;
        if (totalVotes === 0) return; // Avoid division by zero

        // Calculate percentages
        const speedPercentage = Math.round((votes.speed / totalVotes) * 100);
        const designPercentage = Math.round((votes.design / totalVotes) * 100);
        const visibilityPercentage = Math.round((votes.visibility / totalVotes) * 100);

        // Update progress bars and percentages
        document.getElementById("speed-bar").style.width = `${speedPercentage}%`;
        document.getElementById("design-bar").style.width = `${designPercentage}%`;
        document.getElementById("visibility-bar").style.width = `${visibilityPercentage}%`;

        document.getElementById("speed-percentage").textContent = `${speedPercentage}%`;
        document.getElementById("design-percentage").textContent = `${designPercentage}%`;
        document.getElementById("visibility-percentage").textContent = `${visibilityPercentage}%`;
    }

    // Show results
    function showResults() {
        pollResults.style.display = "block";
        updateResults();
    }

    // Handle form submission
    pollForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        // Increment vote count
        if (userVote) {
            votes[userVote]++;
            localStorage.setItem("pollVotes", JSON.stringify(votes)); // Save to localStorage
            pollForm.style.display = "none"; // Hide form after voting
            showResults(); // Show updated results
        }
    });

    // Show results if votes already exist
    if (votes.speed || votes.design || votes.visibility) {
        pollForm.style.display = "none";
        showResults();
    }
});
