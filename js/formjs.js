document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("main-form");

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    grecaptcha.ready(function () {
      grecaptcha.execute("6LcjC3srAAAAAIvVLL8EHSE1IcIiB7nWch5vJp_Q", { action: "submit" }).then(function (token) {
        const formData = new FormData(form);
        formData.append("token", token);

        fetch("https://hooks.zapier.com/hooks/catch/13018559/ub6p3as/", {
          method: "POST",
          body: formData
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.text(); // even if it's JSON, we're ignoring it
          })
          .then(() => {
            // ✅ Redirect after successful submission
            window.location.href = "/thank-you.html";
          })
          .catch(error => {
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form. Please try again.");
          });
      });
    });
  });
});
