// @ts-nocheck
// DobieCore CaptionCraft — Simple, human, and fast.
// Full drop-in replacement for /captioncraft/captioncraft.js

// ---------- tiny DOM helpers (no jQuery)
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- usage gating (3/day for Free)
function todayKey() {
  const d = new Date();
  return `dcc_usage_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function getUsage() {
  const key = todayKey();
  const n = parseInt(localStorage.getItem(key) || "0", 10);
  return { key, n };
}
function incrementUsage() {
  const { key, n } = getUsage();
  localStorage.setItem(key, String(n + 1));
}
function isPro() {
  return localStorage.getItem("dcc_pro") === "1" || !!localStorage.getItem("dcc_pro_email");
}
function updateUsageCounter() {
  const el = qs("#usageCounter");
  if (!el) return;
  if (isPro()) {
    el.textContent = "Pro: unlimited captions";
  } else {
    const { n } = getUsage();
    el.textContent = `Free today: ${Math.max(0, 3 - n)} of 3 left`;
  }
}
function showUpgrade() {
  const m = qs("#upgradeModal");
  if (m) m.style.display = "block";
}
function closeModal() {
  const m = qs("#upgradeModal");
  if (m) m.style.display = "none";
}

// ---------- punctuation + basics
function cleanPunctuation(s = "") {
  return s
    .replace(/\s{2,}/g, " ")
    .replace(/([.!?])\1{1,}/g, "$1")      // ... -> . / !! -> !
    .replace(/([.!?])\s*([.!?])/g, "$1 ") // prevent back-to-back punctuation
    .replace(/\s+([,.;:!?])/g, "$1")      // trim space before punctuation
    .replace(/([,.;:!?])([^\s])/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function humanize(s, opts = {}) {
  if (!s) return s;
  let out = s.trim();

  // Deduplicate adjacent lines (in case hot reload or hook repeats)
  out = out
    .split(/\n+/)
    .filter((line, i, arr) => line.trim() !== (arr[i - 1] || "").trim())
    .join("\n");

  // Reduce the templatey phrase sometimes
  out = out.replace(/\bwe get it[—-]?\s*/gi, (m) => (Math.random() < 0.4 ? m : ""));

  // Keep only one "Bottom line:" if repeated
  out = out.replace(/\bBottom line:\s*Bottom line:\s*/gi, "Bottom line: ");

  // LinkedIn prefers fewer long blocks
  if ((opts.platform || "").toLowerCase() === "linkedin") {
    const lines = out.split("\n");
    if (lines.length > 6) out = lines.slice(0, 6).join("\n");
  }

  // final tidy
  out = cleanPunctuation(out);
  return out.trim();
}

// ---------- hashtags
function cleanTag(s) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "").replace(/^#+/, "");
}
function buildHashtags(keywords = "", density = "standard", clean = true, platform = "instagram", format = "post") {
  const p = String(platform || "").toLowerCase();
  const f = String(format || "").toLowerCase();
  if (p === "gmb" || p === "youtube" || f === "story") return "";

  let parts = String(keywords || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (clean) parts = parts.map(cleanTag);
  parts = [...new Set(parts)].filter(Boolean);

  let cap = 5;
  if (p === "instagram" || p === "facebook") {
    cap = f === "reel" ? 7 : density === "heavy" ? 10 : density === "light" ? 4 : 7;
  } else if (p === "twitter") cap = density === "heavy" ? 3 : 2;
  else if (p === "linkedin") cap = density === "heavy" ? 5 : density === "light" ? 2 : 3;
  else if (p === "tiktok") cap = density === "heavy" ? 15 : density === "light" ? 6 : 10;
  else if (p === "ytshorts") cap = density === "heavy" ? 7 : density === "light" ? 3 : 5;

  return parts
    .slice(0, cap)
    .map((t) => (t ? `#${t}` : ""))
    .filter(Boolean)
    .join(" ");
}

// ---------- platform helpers
function platformStyle(p) {
  switch ((p || "").toLowerCase()) {
    case "linkedin":
      return { emoji: false, lineBreaks: true };
    case "tiktok":
      return { emoji: true, lineBreaks: false };
    case "facebook":
      return { emoji: true, lineBreaks: true };
    case "twitter":
      return { emoji: false, lineBreaks: true };
    default:
      return { emoji: true, lineBreaks: true }; // Instagram etc.
  }
}
function platformKey(p = "Instagram", f = "Post") {
  return `${String(p || "").toLowerCase()}:${String(f || "").toLowerCase()}`;
}

// ---------- brand intro
function brandLead(company) {
  const c = (company || "").trim();
  return c ? `At ${c}, ` : "";
}

// ---------- local templates (human-forward, short)
const TPL = {
  "facebook:post": makeTemplate,
  "facebook:story": makeTemplate,
  "facebook:reel": makeTemplate,
  "instagram:post": makeTemplate,
  "instagram:story": makeTemplate,
  "instagram:reel": makeTemplate,
  "twitter:post": makeTemplate,
  "linkedin:post": makeTemplate,
  "gmb:post": makeTemplate,
  "tiktok:video": makeTemplate,
  "ytshorts:short": makeTemplate
};

function makeTemplate(ctx) {
  const {
    company, audience, problem, outcome, offer,
    cta, platform, tone, length, keywords, format, voiceMode
  } = ctx;

  const p = platformStyle(platform);
  const brand = brandLead(company);
  const who = (audience || "busy owners").replace(/^\w/, (c) => c.toUpperCase());

  // Hooks
  const hooks = [
    `${who}, this is for you.`,
    `Quick win: ${outcome || "better results, less stress"}.`,
    `Still wrestling with ${problem || "content taking too long"}?`,
    `${who}—you don’t need another app; you need momentum.`,
    `Tiny change, big ripple: ${outcome || "more qualified leads"}.`
  ];

  // Empathy / Insight
  const empathy = [
    `${brand}we know the hardest part is showing up consistently.`,
    `${brand}you’re juggling real work—marketing shouldn’t burn the day.`,
    `${brand}consistency beats “perfect.” Tools should save time, not steal it.`
  ];

  // Offer / Proof
  const priceLine = offer
    ? `We built ${offer} for real-world schedules.`
    : `We built a $29 caption generator that fits real-world schedules.`;
  const proof = [
    `3 platform-ready captions per run—no blank-page panic.`,
    `Platform & format aware, so you post faster.`,
    `First-comment hashtags ready when you need them.`
  ];

  // Outcomes
  const outcomes = [
    outcome || `More qualified inquiries—without the 90-minute caption spiral.`,
    `Stay visible, stay booked.`,
    `Less time typing, more time serving clients.`
  ];

  // CTA pool (fallback)
  const ctas = cta ? [cta] : ["Book now", "Call today", "Message us to claim", "Learn more", "See how it works", "Get your free consult"];

  const hook = pick(hooks);
  const empath = pick(empathy);
  const proofLine = pick(proof);
  const resultLine = pick(outcomes);
  const call = pick(ctas);

  // Length shaping
  const L = String(length || "medium").toLowerCase();
  const blocksShort = [hook, priceLine, call];
  const blocksMedium = [hook, empath, priceLine, proofLine, resultLine, call];
  const blocksLong = [hook, empath, priceLine, proofLine, resultLine, call];

  let blocks = L === "short" ? blocksShort : L === "long" ? blocksLong : blocksMedium;

  // Tone trims: playful = shorter; pro = measured
  const t = Number(tone) || 0.5;
  if (t > 0.6) {
    blocks = blocks.filter(Boolean).slice(0, 4);
  } else if (t < 0.4 && blocks.length > 5) {
    blocks = blocks.filter(Boolean).slice(0, 5);
  }

  // Join respecting platform line break style
  let text = blocks.filter(Boolean).join(p.lineBreaks ? "\n\n" : " ");

  // Hashtags (first comment helper will pick them up from text)
  const tags = buildHashtags(
    keywords,
    (qs("#hashtagDensity")?.value || "Standard").toLowerCase(),
    !!qs("#cleanHashtags")?.checked,
    platform,
    format
  );
  if (tags) text = p.lineBreaks ? `${text}\n\n${tags}` : `${text} ${tags}`;

  // Final humanize
  text = humanize(text, { platform, playful: t > 0.6, pro: t < 0.4 });
  return text;
}

// ---------- AI Remix (Cloudflare Worker) optional, safe fallback
const WORKER_URLS = [
  "https://www.bluedobiedev.com/api/remix",
  "https://dobiecore-remix.melanie-brown.workers.dev"
];

async function maybeRemixWithAI(texts, brief) {
  // Pro-only by default; flip to `true` to force-enable during testing
  const allowAI = isPro();
  if (!allowAI) return texts;

  const payload = {
    drafts: texts.map((t, i) => ({ id: String(i + 1), text: t })),
    platform: (brief.platform || "instagram"),
    tone: typeof brief.tone === "number" ? brief.tone : 0.5,
    length: (brief.length || "medium").toLowerCase(),
    ctaOptions: (function pickCTAs(userCTA) {
      const base = ["Book now", "Call today", "Message us to claim", "Learn more", "See how it works", "Get your free consult"];
      const out = [];
      if (userCTA && userCTA.trim()) out.push(userCTA.trim());
      while (out.length < 3) {
        const x = pick(base);
        if (!out.includes(x)) out.push(x);
      }
      return Array.from(new Set(out)).slice(0, 3);
    })(brief.cta),
    hashtags: buildHashtags(
      brief.keywords,
      (brief.hashtagDensity || "standard").toLowerCase(),
      brief.cleanHashtags !== false,
      brief.platform,
      brief.format
    )
  };

  for (const url of WORKER_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        return data.map((d) => String(d.text || "")).filter(Boolean);
      }
    } catch {
      // try next
    }
  }
  console.warn("AI remix unavailable; using local drafts");
  return texts;
}

// ---------- render
function renderCards(texts) {
  const results = qs("#results");
  results.innerHTML = "";
  texts.forEach((text, i) => {
    const card = document.createElement("article");
    card.className = "card";

    const hashtagsOnly = text.split("\n").filter((l) => l.trim().startsWith("#")).join(" ");
    const fcBlock = hashtagsOnly
      ? `<div class="first-comment"><div class="muted">First comment</div><textarea readonly>${hashtagsOnly}</textarea><div class="actions"><button type="button" class="copy-first-btn">Copy first comment</button></div></div>`
      : "";

    card.innerHTML = `
      <h3 style="margin:0 0 6px;">Caption ${i + 1}</h3>
      <textarea readonly>${text}</textarea>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px;">
        <button type="button" class="copy-btn">Copy</button>
        <span class="meta">Platform-ready</span>
      </div>
      ${fcBlock}
    `;
    results.appendChild(card);

    const copyBtn = card.querySelector(".copy-btn");
    const ta = card.querySelector("textarea");
    copyBtn?.addEventListener("click", () => {
      ta.select();
      document.execCommand("copy");
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
    });

    const fcCopy = card.querySelector(".copy-first-btn");
    if (fcCopy) {
      const fta = card.querySelector(".first-comment textarea");
      fcCopy.addEventListener("click", () => {
        fta.select();
        document.execCommand("copy");
        fcCopy.textContent = "Copied!";
        setTimeout(() => (fcCopy.textContent = "Copy first comment"), 1200);
      });
    }
  });
}

// ---------- brief reader
function readBrief() {
  return {
    company: qs("#company")?.value || "",
    audience: qs("#audience")?.value || "",
    offer: qs("#offer")?.value || "",
    problem: qs("#problem")?.value || "",
    outcome: qs("#outcome")?.value || "",
    cta: qs("#cta")?.value || "",
    keywords: qs("#keywords")?.value || "",
    platform: qs("#platform")?.value || "Instagram",
    format: qs("#format")?.value || "Post",
    length: qs("#captionLength")?.value || "Medium",
    tone: parseFloat(qs("#tone")?.value || "0.5"),
    hashtagDensity: qs("#hashtagDensity")?.value || "Standard",
    cleanHashtags: !!qs("#cleanHashtags")?.checked,
    voiceMode: qs("#voiceMode")?.value || "leadgen"
  };
}

// ---------- wiring
window.addEventListener("DOMContentLoaded", () => {
  updateUsageCounter();

  const form = qs("#captionForm");
  const results = qs("#results");
  const clearBtn = qs("#clearBtn");

  // Modal controls
  qs("#upgradeBtn")?.addEventListener("click", () => {
    window.location.href = "https://buy.stripe.com/6oUaEY6oTaHBcd6drP0x203";
  });
  qs("#alreadyProBtn")?.addEventListener("click", () => {
    const email = prompt("Enter the email you used to upgrade (temporary local unlock):");
    if (email && /\S+@\S+\.\S+/.test(email)) {
      localStorage.setItem("dcc_pro_email", email);
      localStorage.setItem("dcc_pro", "1");
      closeModal();
      updateUsageCounter();
      alert("Pro unlocked on this browser.");
    } else {
      alert("That email doesn’t look valid.");
    }
  });
  qs("#closeModalBtn")?.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    const modal = qs("#upgradeModal");
    if (e.target === modal) closeModal();
  });

  // Generate
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isPro()) {
      const { n } = getUsage();
      if (n >= 3) {
        showUpgrade();
        return;
      }
    }

    const brief = readBrief();
    if (!brief.offer.trim()) {
      alert("Please enter your Offer.");
      return;
    }

    // Build exactly three local variants
    results.innerHTML = "";
    const key = platformKey(brief.platform, brief.format);
    const make = TPL[key] || makeTemplate;
    const local = [];
    for (let i = 0; i < 3; i++) local.push(make(brief));

    // Optional AI remix (safe fallback)
    const remixed = await maybeRemixWithAI(local, brief);

    // Render
    renderCards(remixed);

    if (!isPro()) {
      incrementUsage();
      updateUsageCounter();
    }
  });

  clearBtn?.addEventListener("click", () => {
    form.reset();
    results.innerHTML = "";
    updateUsageCounter();
  });
});
