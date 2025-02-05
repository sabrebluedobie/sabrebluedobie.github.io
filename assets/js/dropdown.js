document.addEventListener("DOMContentLoaded", function () {
    const dropdownToggle = document.getElementById("dropdown-toggle");
    const dropdownMenu = document.getElementById("dropdown-menu");

    if (!dropdownToggle || !dropdownMenu) {
        console.error("Dropdown elements not found!");
        return;
    }

    // Toggle dropdown on button click
    dropdownToggle.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents event bubbling
        dropdownMenu.classList.toggle("show");

        // Close any other open dropdowns
        document.querySelectorAll(".dropdown-menu").forEach((menu) => {
            if (menu !== dropdownMenu) menu.classList.remove("show");
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove("show");
        }
    });
});
