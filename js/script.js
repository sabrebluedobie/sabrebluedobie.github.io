document.addEventListener("DOMContentLoaded", function () {
    const pollForm = document.getElementById("poll-form");
    const speedCount = document.getElementById("speed-count");
    const designCount = document.getElementById("design-count");
    const visibilityCount = document.getElementById("visibility-count");

    // Retrieve existing votes from localStorage or initialize to 0
    let speedVotes = parseInt(localStorage.getItem("speedVotes")) || 0;
    let designVotes = parseInt(localStorage.getItem("designVotes")) || 0;
    let visibilityVotes = parseInt(localStorage.getItem("visibilityVotes")) || 0;

    // Display existing votes
    updateResults();

    pollForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(pollForm);
        const userVote = formData.get("vote");

        if (userVote === "speed") {
            speedVotes++;
        } else if (userVote === "design") {
            designVotes++;
        } else if (userVote === "visibility") {
            visibilityVotes++;
        }

        // Save updated votes to localStorage
        localStorage.setItem("speedVotes", speedVotes);
        localStorage.setItem("designVotes", designVotes);
        localStorage.setItem("visibilityVotes", visibilityVotes);

        updateResults();
    });

    function updateResults() {
        speedCount.textContent = speedVotes;
        designCount.textContent = designVotes;
        visibilityCount.textContent = visibilityVotes;
    }
});
