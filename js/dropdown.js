
    document.addEventListener("DOMContentLoaded", function () {
      const dropdownToggle = document.getElementById("dropdown-toggle");
      const dropdownMenu = document.getElementById("dropdown-menu");
  
      dropdownToggle.addEventListener("click", function () {
          dropdownMenu.classList.toggle("show");
      });
  
      // Close the dropdown if clicked outside
      document.addEventListener("click", function (event) {
          if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
              dropdownMenu.classList.remove("show");
          }
      });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const collapsibleButtons = document.querySelectorAll(".collapsible-btn");

    collapsibleButtons.forEach(button => {
        button.addEventListener("click", function () {
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
            this.classList.toggle("active");
        });
    });
});

