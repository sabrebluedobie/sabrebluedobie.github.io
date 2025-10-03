/* CaptionCraft — Humanized, platform-specific caption builder
   Drop-in replacement for your generator logic.
   Author: Bluedobie Developing (Mel + the friendly robot)
*/

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const form = document.querySelector("form");
  const results = $("#results");

  // ---------- Helpers ----------
  const sentenceCase = (s) =>
    s
      .toString()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/(^\w)|([.!?]\s+\w)/g, (m) => m.toUpperCase());

  const ensurePeriod = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
  const stripTrailingPunct = (s) => s.replace(/[.!\s]+$/g, "");

  const extractUrl = (s) => {
    const m = s.match(
      /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/i
    );
    return m ? m[0] : null;
  };

  const removeUrl = (s) => s.replace(
    /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi,
    ""
  ).trim();

  const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trim() + "…");

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Hashtag cleaner with density control
  function buildHashtags(keywords, density = "standard", clean = true, platform = "default") {
    if (platform === "gmb") return ""; // GMB: no hashtags
    let tags = keywords
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (clean) {
      tags = tags.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ""));
      // Dedup
      tags = [...new Set(tags)];
    }

    // Platform norms
    let maxTags = 0;
    if (["facebook", "instagram"].includes(platform)) {
      maxTags = density === "heavy" ? 10 : density === "light" ? 4 : 7;
    } else if (platform === "twitter") {
      maxTags = density === "heavy" ? 3 : 2; // X hates hashtag soup
    } else if (platform === "linkedin") {
      maxTags = density === "heavy" ? 5 : density === "light" ? 2 : 3;
    } else {
      maxTags = 5;
    }

    tags = tags.slice(0, maxTags).map((t) => (t.startsWith("#") ? t : `#${t}`));
    return tags.join(" ");
  }

  // Tone pack swaps a few phrases to shift voice.
  function tonePack(level /* 0..1 */) {
    if (level < 0.33) {
      return {
        hookLead: ["Heads up", "Quick win", "A small upgrade = a big payoff"],
        urgency: ["Book now", "Let’s get you visible", "Ready when you are"],
        verb: ["get", "earn", "bring in"],
      };
    } else if (level < 0.66) {
      return {
        hookLead: ["🚀 Small change, big result", "✨ Level up your presence", "📣 Time to get found"],
        urgency: ["Book this week", "Grab a slot in the next 3 days", "Let’s start today"],
        verb: ["drive", "win", "unlock"],
      };
    } else {
      return {
        hookLead: ["🚀 Your next move, now", "🎯 Stop leaking time and leads", "⚡ Visibility that pays for itself"],
        urgency: ["⏳ Limited availability—lock it in", "Last call this week", "Start now for the fastest impact"],
        verb: ["accelerate", "multiply", "amplify"],
      };
    }
  }

  // Length shaping: affects sentence count and optional extras
  function lengthProfile(len) {
    const m = (len || "").toLowerCase();
    if (m === "short") return { maxChars: 180, details: false, spacing: false };
    if (m === "long") return { maxChars: 900, details: true, spacing: true };
    return { maxChars: 400, details: true, spacing: false };
  }

  // Naturalize inputs (avoid robotic phrasing)
  function humanizeProblem(p) {
    // kill “It is difficult for customers to find our business.” repetition
    let s = p
      .replace(/\bis\b/gi, "’s")
      .replace(/\bour business\b/gi, "your business")
      .replace(/\bno time to\b/gi, "no time to")
      .trim();

    // De-stiffen
    s = s.replace(/^for\s+busy.*?,\s*/i, "");
    s = sentenceCase(s);
    return ensurePeriod(s);
  }

  function humanizeOutcome(o) {
    let s = o.replace(/\bin your box\b/gi, "in your inbox").trim();
    s = sentenceCase(s);
    return ensurePeriod(s);
  }

  function humanizeOffer(o) {
    let s = o.trim();
    s = s.replace(/\s+special$/i, " special");
    return s;
  }

  // ---------- Platform templates ----------
  const TPL = {
    facebook({ hook, audience, problem, offer, outcome, cta, tags, details, spacing }) {
      const intro = `${hook}.`;
      const pain = `Most ${audience} know this pain: ${problem}`;
      const sol = details
        ? `With ${offer}, you’ll have a clean, professional presence working 24/7.`
        : `Try ${offer} to fix it fast.`;
      const res = `Result: ${outcome}`;
      const call = cta;

      let body = [intro, pain, sol, res, call].join(spacing ? "\n\n" : " ");
      body = clip(body, 900);
      return tags ? `${body}\n\n${tags}` : body;
    },

    instagram({ hook, problem, offer, outcome, cta, tags, details, spacing }) {
      const p1 = `${hook}`;
      const p2 = details ? `${problem}` : problem.replace(/\.?$/, "");
      const p3 = details
        ? `We’re fixing that with ${offer}.`
        : `${offer} → ${outcome}`;
      const p4 = `📬 ${outcome}`;
      const p5 = cta;

      let body = [p1, p2, p3, p4, p5].join(spacing ? "\n\n" : "\n");
      body = clip(body, 900);
      return tags ? `${body}\n\n${tags}` : body;
    },

    twitter({ problem, offer, outcome, cta, tags }) {
      // Keep it punchy
      let line = `${stripTrailingPunct(problem)}? ${offer} → ${outcome} ${stripTrailingPunct(cta)}.`;
      line = clip(line, 260);
      return tags ? `${line} ${tags}` : line;
    },

    linkedin({ audience, problem, offer, outcome, cta, tags, details }) {
      const opener = details
        ? `For ${audience}: ${problem}`
        : `${problem}`;
      const body = `We built ${offer} to solve this. ${outcome}`;
      const close = cta;

      let out = [opener, body, close].join("\n\n");
      out = clip(out, 900);
      // Fewer, purposeful hashtags on LinkedIn
      return tags ? `${out}\n\n${tags}` : out;
    },

    gmb({ problem, offer, outcome, cta }) {
      const head = `**${offer}**`;
      const p = `${problem} ${offer} fixes that, delivering ${outcome}`;
      const call = `${cta}`;
      const contact = `Call **270-388-3535** or visit **bluedobiedev.com/contact**`;
      return [head, "", p, "", call, "", contact].join("\n");
    },

    default({ problem, offer, outcome, cta, tags }) {
      let body = `Small change → big result.\n\n${problem}\n\nWe fix it with ${offer}.\n\n${cta}`;
      return tags ? `${body}\n\n${tags}` : body;
    },
  };

  // Build three variants with slight hook/wording changes for variety
  function buildVariants(ctx, platform) {
    const plat = (platform || "default").toLowerCase();
    const make = TPL[plat] || TPL.default;

    const variants = [];
    for (let i = 0; i < 3; i++) {
      variants.push(make(ctx));
      // Rotate the hook/verb for variety between captions
      ctx.hook = pick(ctx.hookPool);
    }
    return variants;
  }

  // ---------- Form handling ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    results.innerHTML = "";

    // Collect inputs (IDs: adjust if needed)
    const audience = ($("#audience")?.value || "small business owners").trim();
    const offer = humanizeOffer($("#offer")?.value || "our $299 three-page website special");
    const outcome = humanizeOutcome($("#outcome")?.value || "more qualified leads in your inbox");
    const problem = humanizeProblem($("#problem")?.value || "customers can’t find your business online");
    const rawCTA = ($("#cta")?.value || "Book your consultation this week.").trim();
    const keywords = ($("#keywords")?.value || "webdesign, marketing, bluedobiedev").trim();
    const platform = ($("#platform")?.value || "facebook").trim().toLowerCase();

    // Tone slider assumed 0..1
    const toneVal = parseFloat($("#tone")?.value ?? "0.5"); // default middle
    const tone = tonePack(isNaN(toneVal) ? 0.5 : toneVal);

    const length = ($("#length")?.value || $("#captionLength")?.value || "medium").toLowerCase();
    const density = ($("#hashtagDensity")?.value || "standard").toLowerCase();
    const clean = $("#cleanHashtags")?.checked ?? true;

    // Handle URL once: extract from CTA and append at end for certain platforms
    const url = extractUrl(rawCTA);
    const ctaNoUrl = ensurePeriod(removeUrl(rawCTA));
    const urlSuffix = url ? `\n${url}` : "";

    // Hashtags (per platform rules)
    const tags = buildHashtags(keywords, density, clean, platform);

    const { maxChars, details, spacing } = lengthProfile(length);

    // Hook & copy pool tuned by tone
    const hookPool = tone.hookLead;
    const hook = pick(hookPool);

    // Context for template
    let ctx = {
      hook,
      hookPool,
      audience,
      problem,
      offer,
      outcome,
      cta: ctaNoUrl,
      tags,
      details,
      spacing,
    };

    // Build captions
    let captions = buildVariants(ctx, platform).map((c) => {
      // Respect length cap; add URL where it helps
      let out = c;
      // For GMB/LinkedIn, keep URL inside the body cleanly; for others, append if space
      if (url && platform !== "gmb") {
        const canAppend = out.length + ("\n" + url).length <= maxChars;
        out = canAppend ? `${out}${urlSuffix}` : out; // if too long, we already clipped earlier
      }
      // Final hard clip to maxChars
      out = clip(out, maxChars);
      return out;
    });

    // ---------- Render ----------
    captions.forEach((text, i) => {
      const card = document.createElement("div");
      card.className = "caption-card";
      card.innerHTML = `
        <h3>Caption ${i + 1}</h3>
        <textarea readonly>${text}</textarea>
        <div class="row">
          <button type="button" class="copy-btn">Copy</button>
          <span class="meta">${platform.toUpperCase()} • ${length.toUpperCase()}</span>
        </div>
      `;
      results.appendChild(card);
    });

    // Copy buttons
    results.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ta = btn.closest(".caption-card").querySelector("textarea");
        ta.select();
        document.execCommand("copy");
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      });
    });
  });
});