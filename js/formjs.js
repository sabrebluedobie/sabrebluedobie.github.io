
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

  // ✅ reCAPTCHA check
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Please complete the reCAPTCHA.");
    return;
  }

  const form = e.target;
  const data = new FormData(form);

  document.querySelector("form").addEventListener("submit", function(event) {
  const token = document.getElementById("g-recaptcha-response").value;

  // Delay actual submission to allow token to populate
  if (!token) {
    event.preventDefault();
    setTimeout(() => {
      const delayedToken = document.getElementById("g-recaptcha-response").value;
      if (!delayedToken) {
        alert("Please complete the reCAPTCHA before submitting.");
      } else {
        event.target.submit(); // Proceed with submission if token appears
      }
    }, 800); // 800ms delay — adjust if needed
  }
});

  // Append reCAPTCHA response to the data sent to Zapier
  data.append("g-recaptcha-response", recaptchaResponse);

  fetch(form.action, {
    method: "POST",
    body: data
  })
    .then((res) => {
      if (res.ok) {
        window.location.href = "/thank-you.html";
      } else {
        alert("Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      alert("Something went wrong. Please try again.");
    });
});
