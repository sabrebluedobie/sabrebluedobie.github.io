// captioncraft.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const resultsContainer = document.getElementById("results");

  function generateCaptions(inputs) {
    const { audience, offer, outcome, problem, cta, keywords, platform } = inputs;

    // Hashtags cleaned
    const hashtags = keywords
      .split(",")
      .map((tag) => "#" + tag.trim().toLowerCase().replace(/\s+/g, ""))
      .filter((tag, index, self) => self.indexOf(tag) === index) // no repeats
      .join(" ");

    // Template map
    const templates = {
      facebook: [
        `🚀 ${offer} = big payoff.\n\nMost ${audience} struggle with this: ${problem}. That’s lost time, lost money.\n\n✨ With ${offer}, you’ll finally have ${outcome}.\n\n${cta}\n\n${hashtags}`,
        `📢 Struggling to get noticed? ${problem}.\n\nOur ${offer} is built to fix that. ${outcome}.\n\n⏳ ${cta}\n\n${hashtags}`,
        `✨ Ready for a change?\n${problem} steals your time.\n\nOur ${offer} delivers ${outcome}.\n\n${cta}\n\n${hashtags}`,
      ],
      instagram: [
        `🚀 ${offer} = big results.\n\n${problem}?\n\nWe’re fixing that → ${outcome}.\n\n${cta}\n\n${hashtags}`,
        `✨ Tired of being invisible online?\n\nOur ${offer} is designed for ${audience}.\n\n${outcome}\n\n${cta}\n\n${hashtags}`,
        `🎯 Stop letting ${problem} win.\n\nWith ${offer}, you’ll get ${outcome}.\n\n${cta}\n\n${hashtags}`,
      ],
      twitter: [
        `${problem}? ${offer} = ${outcome}. ${cta} ${hashtags}`,
        `Your customers are searching. Can they *find you*?\n\n${offer} → ${outcome}.\n⏳ ${cta} ${hashtags}`,
        `Small upgrade, huge impact: ${offer}. Result: ${outcome}. ${cta} ${hashtags}`,
      ],
      gmb: [
        `**Special Offer: ${offer}**\n\n${problem}. ${offer} fixes that — delivering ${outcome}.\n\n${cta}\n\n📞 Call us: 270-388-3535\n🔗 bluedobiedev.com/contact`,
        `${offer} available now.\n\nFor ${audience}, ${problem}. We help fix it with ${offer}.\n\nResult: ${outcome}.\n\n${cta}\n\n📞 270-388-3535 • bluedobiedev.com/contact`,
        `Get found online with our ${offer}.\n\n${problem}. ${offer} ensures ${outcome}.\n\n${cta}\n\n📞 270-388-3535 • bluedobiedev.com/contact`,
      ],
      default: [
        `${problem}\n\nResult: ${outcome}\n\n${offer}\n\n${cta}\n\n${hashtags}`,
        `Small change → big result.\n\n${problem}\n\nWe fix it with ${offer}.\n\n${cta}\n\n${hashtags}`,
        `Stop letting ${problem} win.\n\nOur solution: ${offer}.\n\nOutcome: ${outcome}.\n\n${cta}\n\n${hashtags}`,
      ],
    };

    const chosenTemplates = templates[platform?.toLowerCase()] || templates.default;

    return chosenTemplates.map((template) => template);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resultsContainer.innerHTML = "";

    const inputs = {
      audience: form.querySelector("#audience").value || "business owners",
      offer: form.querySelector("#offer").value || "our service",
      outcome: form.querySelector("#outcome").value || "better results",
      problem: form.querySelector("#problem").value || "customers can’t find your business",
      cta: form.querySelector("#cta").value || "Book now!",
      keywords: form.querySelector("#keywords").value || "webdesign, marketing",
      platform: form.querySelector("#platform").value || "default",
    };

    const captions = generateCaptions(inputs);

    captions.forEach((caption, i) => {
      const captionBlock = document.createElement("div");
      captionBlock.classList.add("caption-result");
      captionBlock.innerHTML = `
        <h3>Caption ${i + 1}</h3>
        <textarea readonly>${caption}</textarea>
        <button class="copy-btn">Copy</button>
      `;
      resultsContainer.appendChild(captionBlock);
    });

    // Add copy functionality
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const textarea = e.target.previousElementSibling;
        textarea.select();
        document.execCommand("copy");
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 2000);
      });
    });
  });
});
