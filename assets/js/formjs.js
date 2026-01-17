
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

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(form);

    // OPTIONAL: keep honeypot logic if you have it
    const honey = form.querySelector('input[name="company_website"]');
    if (honey && honey.value.trim() !== '') return;

    // If using Turnstile, token is already in a hidden input
    const turnstileToken = document.getElementById('turnstile_token');
    if (turnstileToken && turnstileToken.value) {
      formData.append('turnstile_token', turnstileToken.value);
    }

    try {
      const response = await fetch('https://hooks.zapier.com/hooks/catch/13018559/ub6p3as/', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        window.location.href = "/thank-you.html";
      } else {
        alert("There was an error submitting the form. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error submitting the form. Please try again.");
    }
  });
});
