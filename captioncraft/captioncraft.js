/* CaptionCraft — Platform + Format aware, with First Comment + UTM + Fragment Fixer + Emoji De-AI-ifier
   This file supersedes the previous JS I sent.
*/

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const form = document.querySelector("form");
  const results = $("#results");
  const platformEl = $("#platform");
  const formatEl = $("#format");
  const formatHint = $("#formatHint");
  const clearBtn = $("#clearBtn");

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
    "facebook:post": "1–3 short paragraphs • 4–7 hashtags",
    "facebook:story": "2–3 lines • no hashtags • link sticker",
    "facebook:reel": "Hook + 1–2 lines • 3–5 hashtags",
    "instagram:post": "Hook + 2–3 lines • 5–9 hashtags",
    "instagram:story": "Very short • no hashtag soup • link sticker",
    "instagram:reel": "Hook + benefit + CTA • 3–7 hashtags",
    "twitter:post": "<280 chars • ≤2 hashtags",
    "linkedin:profile": "3–6 lines • business tone • ≤3 hashtags",
    "linkedin:page": "Brand voice • ≤3 hashtags",
    "gmb:post": "Plain, local keywords • no hashtags",
    "tiktok:video": "Hook + 2 lines + CTA • 6–10 hashtags",
    "ytshorts:short": "2–3 lines • 3–5 hashtags",
    "youtube:video": "Title + description • no hashtag soup",
  };

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
  const sentenceCase = (s) => s.toString().trim().replace(/\s+/g, " ").replace(/(^\w)|([.!?]\s+\w)/g, (m) => m.toUpperCase());
  const ensurePeriod = (s) => (/[.!?]$/.test(s.trim()) ? s.trim() : s.trim() + ".");
  const stripTrailingPunct = (s) => s.replace(/[.!\s]+$/g, "");
  const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trim() + "…");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const isUrl = (t) => /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/i.test(t);
  const isHashtagLine = (t) => t.trim().startsWith("#");
  const isTitleLine = (t) => /^title:/i.test(t.trim());

  const URL_RE = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/i;
  const URL_RE_GLOBAL = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
  const extractUrl = (s) => { const m = (s || "").match(URL_RE); return m ? m[0] : null; };
  const removeUrl = (s) => (s || "").replace(URL_RE_GLOBAL, "").trim();

  // UTM adder
  function addUtm(url, platform, format) {
    try {
      const hasProto = /^https?:\/\//i.test(url);
      const full = hasProto ? url : `https://${url}`;
      const u = new URL(full);
      if (![...u.searchParams.keys()].some(k => k.toLowerCase().startsWith("utm_"))) {
        u.searchParams.set("utm_source", platform.toLowerCase());
        u.searchParams.set("utm_medium", (format || "post").toLowerCase());
        u.searchParams.set("utm_campaign", "captioncraft");
      }
      return u.toString();
    } catch { return url; }
  }

  // Hashtags by platform/format
  function buildHashtags(keywords, density = "standard", clean = true, platform = "default", format = "post") {
    const p = platform.toLowerCase();
    const f = format.toLowerCase();
    if (p === "gmb" || p === "youtube" || f === "story") return "";

    let tags = (keywords || "").split(",").map((t) => t.trim()).filter(Boolean);
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

  // Tone + length
  function tonePack(level) {
    if (level < 0.33) {
      return { hookLead: ["Quick win", "Heads up", "A small upgrade = a big payoff"], urgency: ["Book now", "Ready when you are", "Let’s get you visible"] };
    } else if (level < 0.66) {
      return { hookLead: ["🚀 Small change, big result", "✨ Level up your presence", "📣 Time to get found"], urgency: ["Book this week", "Grab a slot in the next 3 days", "Let’s start today"] };
    } else {
      return { hookLead: ["🚀 Your next move, now", "🎯 Stop leaking time and leads", "⚡ Visibility that pays for itself"], urgency: ["⏳ Limited availability—lock it in", "Last call this week", "Start now for the fastest impact"] };
    }
  }
  function lengthProfile(len, platform, format) {
    const m = (len || "").toLowerCase();
    const p = (platform || "").toLowerCase();
    const f = (format || "").toLowerCase();

    if (p === "twitter") return { maxChars: 280, details: false, spacing: false };
    if (p === "ytshorts") return { maxChars: 300, details: false, spacing: false };
    if (p === "tiktok") return { maxChars: 500, details: false, spacing: false };
    if (p === "youtube") return { maxChars: 1200, details: true, spacing: true };
    if (f === "story") return { maxChars: 220, details: false, spacing: false };

    if (m === "short") return { maxChars: 180, details: false, spacing: false };
    if (m === "long") return { maxChars: 1100, details: true, spacing: true };
    return { maxChars: 450, details: true, spacing: false };
  }

  // De-robotify inputs
  function humanizeProblem(p) {
    let s = (p || "").replace(/\bis\b/gi, "’s").replace(/\bour business\b/gi, "your business").trim();
    s = s.replace(/^for\s+busy.*?,\s*/i, "");
    s = sentenceCase(s);
    return ensurePeriod(s);
  }
  function humanizeOutcome(o) {
    let s = (o || "").replace(/\bin your box\b/gi, "in your inbox").trim();
    s = sentenceCase(s);
    return ensurePeriod(s);
  }
  function humanizeOffer(o) {
    let s = (o || "").trim();
    s = s.replace(/\s+special$/i, " special");
    return s;
  }

  // Fragment fixer
  const COMMON_VERBS = /(?:get|have|be|is|are|was|were|do|make|build|grow|find|fix|help|win|drive|boost|book|buy|claim|start|learn|see|save|earn|bring)/i;
  function cleanLine(line) {
    if (isHashtagLine(line) || isUrl(line) || isTitleLine(line)) return line.trim();
    let s = line.replace(/\s{2,}/g, " ").replace(/\.{4,}/g, "…").trim();
    s = s.replace(/\b(\w+)\s+\1\b/gi, "$1");
    if (s.length > 0) s = s[0].toUpperCase() + s.slice(1);
    return s;
  }
  function looksFragmentary(line) {
    const s = line.trim();
    if (!s) return false;
    if (isHashtagLine(s) || isUrl(s) || isTitleLine(s)) return false;
    const short = s.length < 25 && !/[!?]$/.test(s);
    const noVerb = !COMMON_VERBS.test(s);
    return short || noVerb;
  }
  function fixFragmentsMultiline(text) {
    const original = text;
    let changed = false;
    let lines = text.split(/\n+/).map(cleanLine).filter((l) => l.length);
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
      let cur = lines[i];
      if (looksFragmentary(cur)) {
        const next = lines[i + 1];
        if (next && !isHashtagLine(next) && !isTitleLine(next)) {
          cur = (cur + " " + next).replace(/\s{2,}/g, " ").trim();
          i += 1;
          changed = true;
        }
      }
      if (!isHashtagLine(cur) && !isUrl(cur) && !isTitleLine(cur)) {
        if (!/[.!?]$/.test(cur)) cur = cur + ".";
      }
      merged.push(cur);
    }
    const out = merged.join("\n");
    return { out, changed: changed || out !== original };
  }

  // ---------- EMOJI DE-AI-IFIER ----------
  const GENERIC_AI_EMOJIS = ["🚀","🎯","✨","📣","⚡","💡","🔥","✅","📈"];
  const EMOJI_REGEX = /([\u231A-\uD83E\uDDFF\u2600-\u27BF]|\uFE0F)/g; // broad capture

  function extractEmojis(text) {
    return (text.match(EMOJI_REGEX) || []).filter(Boolean);
  }

  function startsWithEmoji(line) {
    const s = line.trim();
    return !!(s && EMOJI_REGEX.test(s[0]));
  }

  function emojiIssues(text) {
    const lines = text.split(/\n+/).filter((l) => l.trim().length);
    const all = extractEmojis(text);
    const genericCount = all.filter((e) => GENERIC_AI_EMOJIS.includes(e)).length;

    const frontLoaded = lines.length && lines.every((l) => {
      const trimmed = l.trim();
      if (!trimmed) return true;
      // ignore hashtag / title lines
      if (isHashtagLine(trimmed) || isTitleLine(trimmed)) return true;
      return startsWithEmoji(trimmed);
    });

    const onePerLine = lines.length && lines.every((l) => {
      const em = extractEmojis(l);
      const nonEmpty = l.trim().length > 0 && !isHashtagLine(l) && !isTitleLine(l);
      return !nonEmpty || em.length <= 1;
    });

    const bookended = lines.some((l) => {
      const t = l.trim();
      if (!t || isHashtagLine(t) || isTitleLine(t)) return false;
      const em = extractEmojis(t);
      return em.length >= 2 && em[0] === em[em.length - 1];
    });

    return {
      total: all.length,
      genericCount,
      frontLoaded,
      onePerLine,
      bookended,
      looksAIish:
        genericCount >= 2 ||
        (frontLoaded && all.length >= 1) ||
        bookended,
    };
  }

  // Contextual suggestions from keywords/audience/platform
  function suggestEmojiPool(keywords, audience, platform) {
    const k = (keywords || "").toLowerCase();
    const a = (audience || "").toLowerCase();
    const p = (platform || "").toLowerCase();

    const pool = [];

    if (k.includes("web") || k.includes("design")) pool.push("🖥️","🎨","🛠️","🧩");
    if (k.includes("marketing") || k.includes("growth")) pool.push("📈","📊","🧲","📌");
    if (k.includes("local") || a.includes("local")) pool.push("📍","🏘️","🛣️");
    if (a.includes("owners") || a.includes("small")) pool.push("🏪","🧑‍💼","🧾");
    if (k.includes("health")) pool.push("🩺","🏥");
    if (k.includes("pet") || a.includes("pet")) pool.push("🐾","🐶","🐱");
    if (k.includes("food") || k.includes("cafe")) pool.push("☕","🍔","🥗");
    if (p === "tiktok") pool.push("🎬","🎵");
    if (p === "instagram") pool.push("📸");
    if (pool.length === 0) pool.push("📌","🧭","🤝"); // mild, neutral

    // Dedup and cap
    return [...new Set(pool)].slice(0, 6);
  }

  // Rewrite emojis: swap generics, randomize placement, trim counts
  function deAIifyEmojis(text, suggestions, platform) {
    const allowMore = ["tiktok","instagram"].includes((platform || "").toLowerCase());
    const maxKeep = allowMore ? 2 : 1;

    const lines = text.split(/\n/);
    const out = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed || isHashtagLine(trimmed) || isTitleLine(trimmed)) return line;

      // Replace generic emojis with suggestions (rotate)
      let replaced = trimmed.replace(EMOJI_REGEX, (m) => {
        if (!GENERIC_AI_EMOJIS.includes(m)) return m;
        return pick(suggestions);
      });

      // If still too many emojis, keep up to maxKeep
      const ems = extractEmojis(replaced);
      if (ems.length > maxKeep) {
        let count = 0;
        replaced = replaced.replace(EMOJI_REGEX, (m) => {
          if (count < maxKeep) { count++; return m; }
          return ""; // drop extras
        }).replace(/\s{2,}/g, " ").trim();
      }

      // Randomize placement: 0 start, 1 end, 2 mid, 3 none (if already has one we won’t force another)
      const hasEmoji = extractEmojis(replaced).length > 0;
      if (!hasEmoji && Math.random() < 0.6) {
        const em = pick(suggestions);
        const mode = Math.floor(Math.random() * 3);
        if (mode === 0) replaced = `${em} ${replaced}`;
        else if (mode === 1) replaced = `${replaced} ${em}`;
        else {
          const words = replaced.split(" ");
          const pos = Math.max(1, Math.min(words.length - 1, Math.floor(words.length / 2)));
          words.splice(pos, 0, em);
          replaced = words.join(" ");
        }
      }

      return replaced;
    });

    return out.join("\n");
  }

  // Calendar hint meta
  function calendarMeta(platform, format) {
    const key = `${platform}:${format}`.toLowerCase();
    const BASE = {
      "facebook:post": "Best: 9–11am or 1–3pm • 1–3 short paragraphs • 4–7 hashtags",
      "facebook:story": "Best: mornings/evenings • 2–3 lines • link sticker",
      "facebook:reel": "Best: afternoons • hook + 1–2 lines • 3–5 hashtags",
      "instagram:post": "Best: late morning • hook + 2–3 lines • 5–9 hashtags",
      "instagram:story": "Best: when active • 1–2 lines • link sticker",
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

  // ---------- Templates ----------
  const TPL = {
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
      let body = `${stripTrailingPunct(problem)}?\n${offer}\n${outcome}\n${cta}`;
      return clip(body, 220);
    },
    "facebook:reel"({ hook, offer, outcome, cta, tags }) {
      let body = `${hook}\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

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

    "twitter:post"({ problem, offer, outcome, cta, tags }) {
      let line = `${stripTrailingPunct(problem)}? ${offer} → ${outcome} ${stripTrailingPunct(cta)}.`;
      line = clip(line, 280);
      return tags ? `${line} ${tags}` : line;
    },

    "linkedin:profile"({ audience, problem, offer, outcome, cta, tags, details }) {
      const opener = details ? `For ${audience}: ${problem}` : `${problem}`;
      const body = `We built ${offer} to solve this. ${outcome}`;
      const close = cta;
      let out = [opener, body, close].join("\n\n");
      out = clip(out, 1200);
      return tags ? `${out}\n\n${tags}` : out;
    },
    "linkedin:page"(ctx) { return TPL["linkedin:profile"](ctx); },

    "gmb:post"({ problem, offer, outcome, cta }) {
      const head = `**${offer}**`;
      const p = `${problem} ${offer} fixes that, delivering ${outcome}`;
      const call = `${cta}`;
      const contact = `Call **270-388-3535** or visit **bluedobiedev.com/contact**`;
      return [head, "", p, "", call, "", contact].join("\n");
    },

    "tiktok:video"({ hook, problem, offer, outcome, cta, tags }) {
      const h = hook.replace(/\.$/, "");
      let body = `${h}\n${problem}\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 500);
      return tags ? `${body}\n${tags}` : body;
    },

    "ytshorts:short"({ problem, offer, outcome, cta, tags }) {
      let body = `${stripTrailingPunct(problem)}?\n${offer} → ${outcome}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

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

  // ---- First Comment generator (Instagram + LinkedIn) ----
  function buildFirstComment(platform, format, tags, utmUrl) {
    const p = (platform || "").toLowerCase();
    const f = (format || "").toLowerCase();
    if (p === "instagram") {
      const lines = [];
      if (utmUrl) lines.push(`🔗 ${utmUrl}`);
      if (tags) lines.push(tags);
      return lines.join("\n");
    }
    if (p === "linkedin") {
      const pieces = [];
      if (utmUrl) pieces.push(`Quick link: ${utmUrl}`);
      pieces.push("Questions? Drop a comment and I’ll reply.");
      return pieces.join("\n");
    }
    return "";
  }

  // Soft validation
  function qcIssues({ offer, problem, outcome, cta }) {
    const issues = [];
    if (!offer || offer.length < 5) issues.push("Offer looks empty/too short.");
    if (!problem || problem.length < 5) issues.push("Problem looks empty/too short.");
    if (!outcome || outcome.length < 5) issues.push("Outcome looks empty/too short.");
    if (!cta || cta.length < 4) issues.push("CTA looks empty/too short.");
    return issues;
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

    const length = ($("#captionLength")?.value || "medium").toLowerCase();
    const density = ($("#hashtagDensity")?.value || "standard").toLowerCase();
    const clean = $("#cleanHashtags")?.checked ?? true;

    // URL + UTM
    const rawUrl = extractUrl(rawCTA);
    const utmUrl = rawUrl ? addUtm(rawUrl, platform, format) : null;
    const ctaNoUrl = ensurePeriod(removeUrl(rawCTA));
    const urlSuffix = utmUrl ? `\n${utmUrl}` : "";

    const { maxChars, details, spacing } = lengthProfile(length, platform, format);
    const tags = buildHashtags(keywords, density, clean, platform, format);

    const hookPool = tone.hookLead;
    const hook = pick(hookPool);

    let ctx = { hook, hookPool, audience, problem, offer, outcome, cta: ctaNoUrl, tags, details, spacing };

    // QC banner
    const issues = qcIssues({ offer, problem, outcome, cta: ctaNoUrl });
    if (issues.length) {
      const warn = document.createElement("div");
      warn.className = "card";
      warn.style.margin = "12px 0";
      warn.style.background = "#fff7ed";
      warn.style.borderColor = "#fdba74";
      warn.innerHTML = `<strong>Heads up:</strong> ${issues.join(" ")} We’ll auto-fix obvious fragments.`;
      results.appendChild(warn);
    }

    // Build raw captions
    let caps = buildVariants(ctx, platform, format).map((c) => {
      let out = c;

      // Append UTM’d URL (not for GMB/YouTube; not for Stories)
      if (utmUrl && !["gmb", "youtube"].includes(platform) && format !== "story") {
        const canAppend = out.length + ("\n" + utmUrl).length <= maxChars;
        out = canAppend ? `${out}${urlSuffix}` : out;
      }

      // Fragment fixer (skip YouTube long description)
      let fixed = { out, changed: false };
      if (platform !== "youtube") fixed = fixFragmentsMultiline(out);

      // Cap
      const cap = platform === "youtube" ? 1200 : maxChars;
      fixed.out = clip(fixed.out, cap);

      return fixed;
    });

    // First comment (IG + LI)
    const firstComment = buildFirstComment(platform, format, tags, utmUrl);

    // ---------- Render ----------
    // Emoji uniformity check across the set
    const allEmojis = caps.flatMap(c => extractEmojis(c.out));
    const dominantGeneric = allEmojis.filter(e => GENERIC_AI_EMOJIS.includes(e));
    const setUniformWarning = dominantGeneric.length >= 3;

    caps.forEach((obj, i) => {
      let text = obj.out;
      const fragFixed = obj.changed;

      // Analyze emojis
      const issuesE = emojiIssues(text);
      const suggestPool = suggestEmojiPool(keywords, audience, platform);
      const looksAIish = issuesE.looksAIish || setUniformWarning;

      const card = document.createElement("div");
      card.className = "caption-card";
      const meta = `${platform.toUpperCase()} • ${format.toUpperCase()}`;
      const cal = calendarMeta(platform, format);

      const warning = looksAIish
        ? `<div class="hint" style="color:#b45309;">⚠️ Emoji pattern looks AI-ish (generic or front-loaded). Try “Humanize emojis”.</div>`
        : "";

      const fcBlock = firstComment
        ? `
        <div class="first-comment">
          <div class="muted" style="margin:6px 0 4px;">First comment (for reach):</div>
          <textarea readonly>${firstComment}</textarea>
          <div class="row">
            <button type="button" class="copy-first-btn">Copy first comment</button>
            <span class="meta">Optional</span>
          </div>
        </div>`
        : "";

      const fixedBadge = fragFixed ? `<span class="meta" style="color:#b45309;">Auto-fixed formatting</span>` : "";

      card.innerHTML = `
        <h3>Caption ${i + 1}</h3>
        <textarea readonly>${text}</textarea>
        <div class="row" style="gap:8px; flex-wrap:wrap;">
          <button type="button" class="copy-btn">Copy</button>
          <button type="button" class="emoji-btn" title="Swap generic emojis, randomize placement">Humanize emojis</button>
          <span class="meta">${meta}</span>
        </div>
        <div class="hint muted">${cal}</div>
        ${fixedBadge ? `<div class="hint">${fixedBadge}</div>` : ""}
        ${warning}
        ${fcBlock}
      `;
      results.appendChild(card);

      // Wire buttons
      const copyBtn = card.querySelector(".copy-btn");
      const emojiBtn = card.querySelector(".emoji-btn");
      const ta = card.querySelector("textarea");

      copyBtn.addEventListener("click", () => {
        ta.select(); document.execCommand("copy");
        copyBtn.textContent = "Copied!"; setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });

      emojiBtn.addEventListener("click", () => {
        const newText = deAIifyEmojis(ta.value, suggestPool, platform);
        ta.value = newText;
        emojiBtn.textContent = "Emojis humanized";
        setTimeout(() => (emojiBtn.textContent = "Humanize emojis"), 1800);
      });

      // First comment copy
      const fcCopy = card.querySelector(".copy-first-btn");
      if (fcCopy) {
        fcCopy.addEventListener("click", () => {
          const fta = card.querySelector(".first-comment textarea");
          fta.select(); document.execCommand("copy");
          fcCopy.textContent = "Copied!"; setTimeout(() => (fcCopy.textContent = "Copy first comment"), 1500);
        });
      }
    });
  });

  // Clear
  clearBtn.addEventListener("click", () => {
    ["audience","offer","outcome","problem","cta","keywords"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    document.getElementById("captionLength").value = "Medium";
    document.getElementById("hashtagDensity").value = "Standard";
    document.getElementById("cleanHashtags").checked = true;
    document.getElementById("tone").value = 0.5;
    results.innerHTML = "";
  });
});