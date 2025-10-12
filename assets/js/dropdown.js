
     document.addEventListener("DOMContentLoaded", () => {
  // First dropdown
  const dropdownToggle = document.getElementById("dropdown-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  // Second dropdown (Products)
  const productsToggle = document.getElementById("products-toggle");
  const productsMenu = document.getElementById("products-menu");

  // Setup first dropdown
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
      // Close the other dropdown
      if (productsMenu) productsMenu.style.display = "none";
    });
  }

  // Setup second dropdown
  if (productsToggle && productsMenu) {
    productsToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      productsMenu.style.display = productsMenu.style.display === "block" ? "none" : "block";
      // Close the other dropdown
      if (dropdownMenu) dropdownMenu.style.display = "none";
    });
  }

  // Close both when clicking outside
  document.addEventListener("click", (e) => {
    if (dropdownToggle && dropdownMenu && 
        !dropdownToggle.contains(e.target) && 
        !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = "none";
    }
    if (productsToggle && productsMenu && 
        !productsToggle.contains(e.target) && 
        !productsMenu.contains(e.target)) {
      productsMenu.style.display = "none";
    }
  });
});