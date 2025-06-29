function nextStep(current) {
  document.getElementById('step' + current).classList.remove('active');
  document.getElementById('step' + (current + 1)).classList.add('active');
}

function prevStep(current) {
  document.getElementById('step' + current).classList.remove('active');
  document.getElementById('step' + (current - 1)).classList.add('active');
}

document.getElementById("multiForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;

  // Delay to allow reCAPTCHA token to populate
  const token = document.getElementById("g-recaptcha-response").value;
  if (!token) {
    setTimeout(() => {
      const delayedToken = document.getElementById("g-recaptcha-response").value;
      if (!delayedToken) {
        alert("Please complete the reCAPTCHA before submitting.");
        return;
      } else {
        submitForm(form, delayedToken);
      }
    }, 800);
  } else {
    submitForm(form, token);
  }
});

function submitForm(form, recaptchaToken) {
  const data = new FormData(form);
  data.append("g-recaptcha-response", recaptchaToken);

  fetch(form.action, {
    method: "POST",
    body: data
  })
    .then((res) => {
  return res.json(); // parse the response body
})
.then((data) => {
  if (data.status === "success") {
    window.location.href = "/thank-you.html";
  } else {
    alert("Something went wrong. Please try again.");
  }
})

    .catch(() => {
      alert("Something went wrong. Please try again.");
    });
}
