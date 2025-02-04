
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
  
