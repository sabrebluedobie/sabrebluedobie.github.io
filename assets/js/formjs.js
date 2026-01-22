document.addEventListener('DOMContentLoaded', function () {
  // Step form handlers
  window.nextStep = function(current) {
    document.getElementById(`step${current}`).classList.remove('active');
    document.getElementById(`step${current + 1}`).classList.add('active');
  };

  window.prevStep = function(current) {
    document.getElementById(`step${current}`).classList.remove('active');
    document.getElementById(`step${current - 1}`).classList.add('active');
  };

  const form = document.getElementById('multiForm');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Honeypot check
    const honey = form.querySelector('input[name="company_website"]');
    if (honey && honey.value.trim() !== '') {
      console.warn("Honeypot triggered. Submission blocked.");
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://hook.us2.make.com/mw8kpkfkzarglrhqsk4ynuw7swg5p3ao', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Make-ApiKey": "dobiecore_audit_expo_2026"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Make webhook failed");
      }

      form.reset();
      alert("Thanks! Your message has been sent.");

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again later.");
    }
  });
});
