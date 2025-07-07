document.addEventListener("DOMContentLoaded", function () {
  // Multi-step navigation
  const form = document.getElementById("multiForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      grecaptcha.ready(function () {
        grecaptcha.execute('6LcjC3srAAAAAIvVLL8EHSE1IcIiB7nWch5vJp_Q', { action: 'submit' }).then(function (token) {
          submitForm(form, token);
        });
      });
    });
  }
});

function nextStep(currentStep) {
  document.getElementById('step' + currentStep).classList.remove('active');
  const next = currentStep + 1;
  document.getElementById('step' + next).classList.add('active');
}

function prevStep(currentStep) {
  document.getElementById('step' + currentStep).classList.remove('active');
  const prev = currentStep - 1;
  document.getElementById('step' + prev).classList.add('active');
}

function submitForm(form, recaptchaToken) {
  const data = new FormData(form);
  data.append("token", recaptchaToken);
  data.append("action", "submit");

  fetch(form.action, {
    method: "POST",
    body: data
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '/thank-you.html';
    } else {
      throw new Error('Network response was not ok.');
    }
  })
  .catch(error => {
    console.error('Error!', error.message);
    alert('Something went wrong. Please try again.');
  });
}
