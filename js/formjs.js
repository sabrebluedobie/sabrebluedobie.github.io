
  function nextStep(currentStep) {
    document.getElementById('step' + currentStep).classList.remove('active');
    const next = currentStep + 1;
    document.getElementById('step' + next).classList.add('active');
  }

  // Optional: add form navigation back button
  function prevStep(currentStep) {
    document.getElementById('step' + currentStep).classList.remove('active');
    const prev = currentStep - 1;
    document.getElementById('step' + prev).classList.add('active');
  }

document.getElementById("multiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;

  grecaptcha.ready(function () {
    grecaptcha.execute('6LcjC3srAAAAAIvVLL8EHSE1IcIiB7nWch5vJp_Q', { action: 'submit' }).then(function (token) {
      submitForm(form, token);
    });
  });
});

function submitForm(form, recaptchaToken) {
  const data = new FormData(form);
  data.append("token", recaptchaToken);
  data.append("action", "submit");

  fetch(form.action, {
    method: "POST",
    body: data
  })
    .then((res) => {
      if (res.ok) {
        window.location.href = "/thank-you.html"; // Change path as needed
      } else {
        alert("Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      alert("Something went wrong. Please try again.");
    });
}
