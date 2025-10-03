/* CaptionCraft — Humanized, platform + format aware caption builder
   Platforms & Formats:
   - Facebook: Post, Story, Reel
   - Instagram: Post, Story, Reel
   - Twitter (X): Post (280)
   - LinkedIn: Profile, Page
   - GMB: Post
   - TikTok: Video
   - YTShorts: Short
   - YouTube: Video (title + description)
*/

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const form = document.querySelector("form");
  const results = $("#results");
  const platformEl = $("#platform");
  const formatEl = $("#format");
  const formatHint = $("#formatHint");

  // ----- Format options by platform -----
  const FORMAT_MAP = {
    facebook: ["Post", "Story", "Reel"],
    instagram: ["Post", "Story", "Reel"],
    twitter: ["Post"],
    linkedin: ["Profile", "Page"],
    gmb: ["Post"],
    tiktok: ["Video"],
    ytshorts: ["Short"],
    youtube: ["Video"],
  };

  const FORMAT_HINT = {
    "facebook:post": "1–3 short paragraphs + 4–7 hashtags.",
    "facebook:story": "2–3 punchy lines; no hashtags; CTA and URL.",
    "facebook:reel": "Hook line + 1–2 lines; 3–5 hashtags.",
    "instagram:post": "Hook + 2–3 lines; 5–9 hashtags (clean).",
    "instagram:story": "Very short; no hashtag soup; add URL/Sticker.",
    "instagram:reel": "Hook + one benefit + CTA; 3–7 hashtags.",
    "twitter:post": "Under 280 chars, ≤2 hashtags.",
    "linkedin:profile": "3–6 lines; business tone; ≤3 hashtags.",
    "linkedin:page": "Similar to profile; brand voice; ≤3 hashtags.",
    "gmb:post": "Plain, local keywords; no hashtags.",
    "tiktok:video": "Hook + 2 lines + CTA; 6–10 hashtags.",
    "ytshorts:short": "2–3 lines + 3–5 hashtags.",
    "youtube:video": "Title + description; no hashtag soup.",
  };

  // Populate format options when platform changes
  function refreshFormats() {
    const platform = (platformEl.value || "Facebook").toLowerCase();
    const options = FORMAT_MAP[platform] || ["Post"];
    formatEl.innerHTML = "";
    options.forEach((opt) => {
      const o = document.createElement("option");
      o.textContent = opt;
      formatEl.appendChild(o);
    });
    updateFormatHint();
  }

  function updateFormatHint() {
    const key = `${(platformEl.value || "Facebook").toLowerCase()}:${(formatEl.value || "Post").toLowerCase()}`;
    formatHint.textContent = FORMAT_HINT[key] || "";
  }

  platformEl.addEventListener("change", refreshFormats);
  formatEl.addEventListener("change", updateFormatHint);
  refreshFormats();

  // ---------- Helpers ----------
  const sentenceCase = (s) =>
    s.toString().trim().replace(/\s+/g, " ").replace(/(^\w)|([.!?]\s+\w)/g, (m) => m.toUpperCase());
  const ensurePeriod = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
  const stripTrailingPunct = (s) => s.replace(/[.!\s]+$/g, "");
  const extractUrl = (s) => {
    const m = s.match(/(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/i);
    return m ? m[0] : null;
  };
  const removeUrl = (s) => s.replace(/(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi, "").trim();
  const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trim() + "…");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Hashtag cleaner with density + platform norms
  function buildHashtags(keywords, density = "standard", clean = true, platform = "default", format = "post") {
    const p = platform.toLowerCase();
    const f = format.toLowerCase();
    // No hashtags for GMB and YouTube longform; Stories often zero
    if (p === "gmb" || p === "youtube" || f === "story") return "";

    let tags = keywords.split(",").map((t) => t.trim()).filter(Boolean);
    if (clean) {
      tags = tags.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ""));
      tags = [...new Set(tags)];
    }

    let maxTags = 5;
    if (p === "instagram" || p === "facebook") {
      if (f === "reel") maxTags = 7;
      else maxTags = density === "heavy" ? 10 : density === "light" ? 4 : 7;
    } else if (p === "twitter") {
      maxTags = density === "heavy" ? 3 : 2;
    } else if (p === "linkedin") {
      maxTags = density === "heavy" ? 5 : density === "light" ? 2 : 3;
    } else if (p === "tiktok") {
      maxTags = density === "heavy" ? 15 : density === "light" ? 6 : 10;
    } else if (p === "ytshorts") {
      maxTags = density === "heavy" ? 7 : density === "light" ? 3 : 5;
    }

    tags = tags.slice(0, maxTags).map((t) => (t.startsWith("#") ? t : `#${t}`));
    return tags.join(" ");
  }

  function tonePack(level /* 0..1 */) {
    if (level < 0.33) {
      return {
        hookLead: ["Quick win", "Heads up", "A small upgrade = a big payoff"],
        urgency: ["Book now", "Ready when you are", "Let’s get you visible"],
      };
    } else if (level < 0.66) {
      return {
        hookLead: ["🚀 Small change, big result", "✨ Level up your presence", "📣 Time to get found"],
        urgency: ["Book this week", "Grab a slot in the next 3 days", "Let’s start today"],
      };
    } else {
      return {
        hookLead: ["🚀 Your next move, now", "🎯 Stop leaking time and leads", "⚡ Visibility that pays for itself"],
        urgency: ["⏳ Limited availability—lock it in", "Last call this week", "Start now for the fastest impact"],
      };
    }
  }

  function lengthProfile(len, platform, format) {
    const m = (len || "").toLowerCase();
    const p = (platform || "").toLowerCase();
    const f = (format || "").toLowerCase();

    // Hard caps per platform/format
    if (p === "twitter") return { maxChars: 280, details: false, spacing: false };
    if (p === "ytshorts") return { maxChars: 300, details: false, spacing: false };
    if (p === "tiktok") return { maxChars: 500, details: false, spacing: false };
    if (p === "youtube") return { maxChars: 1200, details: true, spacing: true };
    if (f === "story") return { maxChars: 220, details: false, spacing: false };

    if (m === "short") return { maxChars: 180, details: false, spacing: false };
    if (m === "long") return { maxChars: 1100, details: true, spacing: true };
    return { maxChars: 450, details: true, spacing: false };
  }

  // De-robotify common inputs
  function humanizeProblem(p) {
    let s = p.replace(/\bis\b/gi, "’s").replace(/\bour business\b/gi, "your business").trim();
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

  // Calendar meta (nice to show under each caption)
  function calendarMeta(platform, format) {
    const key = `${platform}:${format}`.toLowerCase();
    const BASE = {
      "facebook:post": "Best: 9–11am or 1–3pm local • 1–3 paragraphs • 4–7 hashtags",
      "facebook:story": "Best: mornings/evenings • 2–3 lines • add link sticker",
      "facebook:reel": "Best: afternoons • hook + 1–2 lines • 3–5 hashtags",
      "instagram:post": "Best: late morning • hook + 2–3 lines • 5–9 hashtags",
      "instagram:story": "Best: any time you’re active • 1–2 lines • link sticker",
      "instagram:reel": "Best: evenings • hook + benefit + CTA • 3–7 hashtags",
      "twitter:post": "Best: commute hours • keep <280 • ≤2 hashtags",
      "linkedin:profile": "Best: Tue–Thu mornings • 3–6 lines • ≤3 hashtags",
      "linkedin:page": "Best: business hours • brand tone • ≤3 hashtags",
      "gmb:post": "Best: business hours • plain language • no hashtags",
      "tiktok:video": "Best: evenings/weekends • 3–4 lines • 6–10 hashtags",
      "ytshorts:short": "Best: evenings • 2–3 lines • 3–5 hashtags",
      "youtube:video": "Best: consistent weekly slot • title + description • no hashtag soup",
    };
    return BASE[key] || "";
  }

  // ---------- Platform + Format templates ----------
  const TPL = {
    // ---- Facebook ----
    "facebook:post"({ hook, audience, problem, offer, outcome, cta, tags, details, spacing }) {
      const intro = `${hook}.`;
      const pain = `Most ${audience} know this pain: ${problem}`;
      const sol = details ? `With ${offer}, you’ll have a clean, professional presence working 24/7.` : `Try ${offer} to fix it fast.`;
      const res = `Result: ${outcome}`;
      const call = cta;
      let body = [intro, pain, sol, res, call].join(spacing ? "\n\n" : " ");
      body = clip(body, 900);
      return tags ? `${body}\n\n${tags}` : body;
    },
    "facebook:story"({ problem, offer, outcome, cta }) {
      // Stories: no hashtag soup
      let body = `${stripTrailingPunct(problem)}?\n${offer}\n${outcome}\n${cta}`;
      return clip(body, 220);
    },
    "facebook:reel"({ hook, offer, outcome, cta, tags }) {
      let body = `${hook}\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- Instagram ----
    "instagram:post"({ hook, problem, offer, outcome, cta, tags, details }) {
      const lines = [
        `${hook}`,
        details ? `${problem}` : stripTrailingPunct(problem),
        details ? `We’re fixing that with ${offer}.` : `${offer} → ${outcome}`,
        `📬 ${outcome}`,
        cta,
      ];
      let body = lines.join("\n\n");
      body = clip(body, 900);
      return tags ? `${body}\n\n${tags}` : body;
    },
    "instagram:story"({ problem, offer, cta }) {
      let body = `${stripTrailingPunct(problem)}?\n${offer}\n${cta}`;
      return clip(body, 220);
    },
    "instagram:reel"({ hook, offer, outcome, cta, tags }) {
      let body = `${hook}\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- Twitter (X) ----
    "twitter:post"({ problem, offer, outcome, cta, tags }) {
      let line = `${stripTrailingPunct(problem)}? ${offer} → ${outcome} ${stripTrailingPunct(cta)}.`;
      line = clip(line, 280);
      return tags ? `${line} ${tags}` : line;
    },

    // ---- LinkedIn ----
    "linkedin:profile"({ audience, problem, offer, outcome, cta, tags, details }) {
      const opener = details ? `For ${audience}: ${problem}` : `${problem}`;
      const body = `We built ${offer} to solve this. ${outcome}`;
      const close = cta;
      let out = [opener, body, close].join("\n\n");
      out = clip(out, 1200);
      return tags ? `${out}\n\n${tags}` : out;
    },
    "linkedin:page"(ctx) {
      // Very similar, slightly more “brandy”
      return TPL["linkedin:profile"](ctx);
    },

    // ---- Google My Business ----
    "gmb:post"({ problem, offer, outcome, cta }) {
      const head = `**${offer}**`;
      const p = `${problem} ${offer} fixes that, delivering ${outcome}`;
      const call = `${cta}`;
      const contact = `Call **270-388-3535** or visit **bluedobiedev.com/contact**`;
      return [head, "", p, "", call, "", contact].join("\n");
    },

    // ---- TikTok ----
    "tiktok:video"({ hook, problem, offer, outcome, cta, tags }) {
      const h = hook.replace(/\.$/, "");
      let body = `${h}\n${problem}\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 500);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- YouTube Shorts ----
    "ytshorts:short"({ problem, offer, outcome, cta, tags }) {
      let body = `${stripTrailingPunct(problem)}?\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- YouTube longform ----
    "youtube:video"({ problem, offer, outcome, cta }) {
      const title = clip(`${offer}: ${outcome.replace(/^[A-Z]/, (m) => m.toLowerCase())}`, 100);
      const descLines = [
        `【 What you’ll learn 】`,
        `• ${problem}`,
        `• How ${offer} solves it`,
        `• What changes: ${outcome}`,
        "",
        `【 Next step 】`,
        `${cta}`,
        "",
        `—`,
        `Bluedobie Developing • 270-388-3535 • bluedobiedev.com/contact`,
      ];
      return `Title: ${title}\n\nDescription:\n${descLines.join("\n")}`;
    },
  };

  // Build three variants with rotating hooks (variety)
  function buildVariants(ctx, platform, format) {
    const key = `${platform}:${format}`.toLowerCase();
    const make = TPL[key] || TPL["facebook:post"];
    const variants = [];
    for (let i = 0; i < 3; i++) {
      variants.push(make(ctx));
      ctx.hook = pick(ctx.hookPool);
    }
    return variants;
  }

  // ---------- Form handling ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    results.innerHTML = "";

    const audience = ($("#audience")?.value || "small business owners").trim();
    const offer = humanizeOffer($("#offer")?.value || "our $299 three-page website special");
    const outcome = humanizeOutcome($("#outcome")?.value || "more qualified leads in your inbox");
    const problem = humanizeProblem($("#problem")?.value || "customers can’t find your business online");
    const rawCTA = ($("#cta")?.value || "Book your consultation this week.").trim();
    const keywords = ($("#keywords")?.value || "webdesign, marketing, bluedobiedev").trim();

    const platform = (platformEl.value || "Facebook").trim().toLowerCase();
    const format = (formatEl.value || "Post").trim().toLowerCase();

    const toneVal = parseFloat($("#tone")?.value ?? "0.5");
    const tone = tonePack(isNaN(toneVal) ? 0.5 : toneVal);

    const length = ($("#length")?.value || $("#captionLength")?.value || "medium").toLowerCase();
    const density = ($("#hashtagDensity")?.value || "standard").toLowerCase();
    const clean = $("#cleanHashtags")?.checked ?? true;

    const url = extractUrl(rawCTA);
    const ctaNoUrl = ensurePeriod(removeUrl(rawCTA));
    const urlSuffix = url ? `\n${url}` : "";

    const { maxChars, details, spacing } = lengthProfile(length, platform, format);
    const tags = buildHashtags(keywords, density, clean, platform, format);

    const hookPool = tone.hookLead;
    const hook = pick(hookPool);

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
    let captions = buildVariants(ctx, platform, format).map((c) => {
      let out = c;
      // Append URL (not for GMB, YouTube; Stories already short)
      if (url && !["gmb", "youtube"].includes(platform) && format !== "story") {
        const canAppend = out.length + ("\n" + url).length <= maxChars;
        out = canAppend ? `${out}${urlSuffix}` : out;
      }
      // Respect cap unless YouTube longform
      const cap = platform === "youtube" ? 1200 : maxChars;
      out = clip(out, cap);
      return out;
    });

    // ---------- Render ----------
    captions.forEach((text, i) => {
      const card = document.createElement("div");
      card.className = "caption-card";
      const meta = `${platform.toUpperCase()} • ${format.toUpperCase()}`;
      const cal = calendarMeta(platform, format);
      card.innerHTML = `
        <h3>Caption ${i + 1}</h3>
        <textarea readonly>${text}</textarea>
        <div class="row">
          <button type="button" class="copy-btn">Copy</button>
          <span class="meta">${meta}</span>
        </div>
        <div class="hint muted">${cal}</div>
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