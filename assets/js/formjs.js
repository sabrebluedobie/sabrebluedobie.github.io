
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

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    grecaptcha.ready(function() {
      grecaptcha.execute('6LcjC3srAAAAAIvVLL8EHSE1IcIiB7nWch5vJp_Q', {action: 'submit'}).then(async function(token) {
        const formData = new FormData(form);
        formData.append('token', token);

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
  });
});
