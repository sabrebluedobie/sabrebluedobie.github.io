document.addEventListener("DOMContentLoaded", function () {
    const pollForm = 
        document.getElementById("poll-form");
    const speedCount = 
        document.getElementById("speed-count");
    const designCount = 
        document.getElementById("design-count");
        const visibilityCount = 
        document.getElementById("visibility-count");
    let speedVotes = 0;
    let designVotes = 0;
    let visibilityVotes = 0;

    pollForm.addEventListener("submit", function (e) {

        // It will help to prevent the submission of 
        // form, so that following code can execute
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
        updateResults();
    });

    function updateResults() {
        speedCount.textContent = speedVotes;
        designCount.textContent = designVotes;
        visibilityCount.textContent = visibilityVotes;
    }
});
