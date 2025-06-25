
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
  const data = new FormData(form);

  fetch(form.action, {
    method: "POST",
    body: data
  })
    .then((res) => {
      if (res.ok) {
        window.location.href = "/thank-you.html"; // 🔁 your real thank you page
      } else {
        alert("Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      alert("Something went wrong. Please try again.");
    });
});
