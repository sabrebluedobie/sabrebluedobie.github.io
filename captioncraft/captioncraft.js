/* CaptionCraft — Platform + Format aware
   Features: First Comment • UTM links • Fragment Fixer • Emoji De-AI-ifier
             Audience-Intent steering • Domain-aware angles (non-repetitive)
             Voice Mode (leadgen/community/authority) with smart fallback
             Writer Persona onboarding + toggle + persistence
   Full replacement for captioncraft.js
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
    const platform = (platformEl?.value || "Facebook").toLowerCase();
    const options = FORMAT_MAP[platform] || ["Post"];
    if (formatEl) {
      formatEl.innerHTML = "";
      options.forEach((opt) => {
        const o = document.createElement("option");
        o.textContent = opt;
        formatEl.appendChild(o);
      });
    }
    updateFormatHint();
  }
  function updateFormatHint() {
    if (!formatHint) return;
    const key = `${(platformEl?.value || "Facebook").toLowerCase()}:${(formatEl?.value || "Post").toLowerCase()}`;
    formatHint.textContent = FORMAT_HINT[key] || "";
  }
  platformEl?.addEventListener("change", refreshFormats);
  formatEl?.addEventListener("change", updateFormatHint);
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
        u.searchParams.set("utm_source", (platform||"").toLowerCase());
        u.searchParams.set("utm_medium", (format || "post").toLowerCase());
        u.searchParams.set("utm_campaign", "captioncraft");
      }
      return u.toString();
    } catch { return url; }
  }

  // Hashtags by platform/format
  function buildHashtags(keywords, density = "standard", clean = true, platform = "default", format = "post") {
    const p = (platform||"").toLowerCase();
    const f = (format||"").toLowerCase();
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
      return { hookLead: ["Small change, big result", "Level up your presence", "Time to get found"], urgency: ["Book this week", "Grab a slot in the next 3 days", "Let’s start today"] };
    } else {
      return { hookLead: ["Your next move, now", "Stop leaking time and leads", "Visibility that pays for itself"], urgency: ["Limited availability—lock it in", "Last call this week", "Start now for the fastest impact"] };
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
  const COMMON_VERBS = /(?:get|have|be|is|are|was|were|do|make|build|grow|find|fix|help|win|drive|boost|book|buy|claim|start|learn|see|save|earn|bring|keep|write|post|plan|schedule|recap)/i;
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

  // ---------- Emoji De-AI-ifier ----------
  const GENERIC_AI_EMOJIS = ["🚀","🎯","✨","📣","⚡","💡","🔥","✅","📈"];
  const EMOJI_REGEX = /([\u231A-\uD83E\uDDFF\u2600-\u27BF]|\uFE0F)/g;

  function extractEmojis(text) { return (text.match(EMOJI_REGEX) || []).filter(Boolean); }
  function startsWithEmoji(line) { const s = line.trim(); return !!(s && EMOJI_REGEX.test(s[0])); }
  function emojiIssues(text) {
    const lines = text.split(/\n+/).filter((l) => l.trim().length);
    const all = extractEmojis(text);
    const genericCount = all.filter((e) => GENERIC_AI_EMOJIS.includes(e)).length;
    const frontLoaded = lines.length && lines.every((l) => {
      const t = l.trim();
      if (!t || isHashtagLine(t) || isTitleLine(t)) return true;
      return startsWithEmoji(t);
    });
    const bookended = lines.some((l) => {
      const t = l.trim();
      if (!t || isHashtagLine(t) || isTitleLine(t)) return false;
      const em = extractEmojis(t);
      return em.length >= 2 && em[0] === em[em.length - 1];
    });
    return { total: all.length, genericCount, frontLoaded, bookended,
      looksAIish: genericCount >= 2 || (frontLoaded && all.length >= 1) || bookended };
  }
  function suggestEmojiPool(keywords, audience, platform) {
    const k = (keywords || "").toLowerCase();
    const a = (audience || "").toLowerCase();
    const p = (platform || "").toLowerCase();
    const pool = [];
    if (/(fantasy|espn|league|commish|commissioner)/.test(k+a)) pool.push("🏈","😂","🎙️","📣");
    if (k.includes("web") || k.includes("design")) pool.push("🖥️","🎨","🛠️","🧩");
    if (k.includes("marketing") || k.includes("growth")) pool.push("📈","📊","🧲","📌");
    if (k.includes("local") || a.includes("local")) pool.push("📍","🏘️","🛣️");
    if (a.includes("owners") || a.includes("small")) pool.push("🏪","🧑‍💼","🧾");
    if (k.includes("health")) pool.push("🩺","🏥");
    if (k.includes("pet") || a.includes("pet")) pool.push("🐾","🐶","🐱");
    if (k.includes("food") || k.includes("cafe")) pool.push("☕","🍔","🥗");
    if (p === "tiktok") pool.push("🎬","🎵");
    if (p === "instagram") pool.push("📸");
    if (pool.length === 0) pool.push("📌","🧭","🤝");
    return [...new Set(pool)].slice(0, 6);
  }
  function deAIifyEmojis(text, suggestions, platform) {
    const allowMore = ["tiktok","instagram"].includes((platform || "").toLowerCase());
    const maxKeep = allowMore ? 2 : 1;
    const lines = text.split(/\n/);
    const out = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed || isHashtagLine(trimmed) || isTitleLine(trimmed)) return line;
      let replaced = trimmed.replace(EMOJI_REGEX, (m) => GENERIC_AI_EMOJIS.includes(m) ? pick(suggestions) : m);
      const ems = extractEmojis(replaced);
      if (ems.length > maxKeep) {
        let count = 0;
        replaced = replaced.replace(EMOJI_REGEX, (m) => (count++ < maxKeep ? m : "")).replace(/\s{2,}/g, " ").trim();
      }
      if (extractEmojis(replaced).length === 0 && Math.random() < 0.6) {
        const em = pick(suggestions);
        const words = replaced.split(" ");
        const pos = Math.max(1, Math.min(words.length - 1, Math.floor(words.length / 2)));
        words.splice(pos, 0, em);
        replaced = words.join(" ");
      }
      return replaced;
    });
    return out.join("\n");
  }

  // ---------- Audience Intent + Need ----------
  function audienceIntent(audience, keywords) {
    const blob = `${(audience||"").toLowerCase()} ${(keywords||"").toLowerCase()}`;
    if (/(fantasy|espn|commish|commissioner|league|sleeper|yahoo)/.test(blob)) {
      return { persona: "fantasy_commissioners", voice: "casual", emojiBias: ["🏈","😂","🎙️","📣"], needs: ["save time", "keep the league chat active", "funny recaps"] };
    }
    if (/(contractor|plumber|hvac|electrician|roof|remodel)/.test(blob)) {
      return { persona: "contractors", voice: "direct", emojiBias: ["🛠️","🏠","📍","⏱️"], needs: ["book jobs", "look legit locally", "save admin time"] };
    }
    if (/(realtor|real estate|broker|agent)/.test(blob)) {
      return { persona: "realtors", voice: "polished", emojiBias: ["🏡","📍","🗝️","📆"], needs: ["book showings", "grow referrals", "post consistently"] };
    }
    if (/(restaurant|cafe|coffee|food|bakery)/.test(blob)) {
      return { persona: "food_service", voice: "warm", emojiBias: ["🍔","☕","🥗","📸"], needs: ["foot traffic", "repeat visits", "local visibility"] };
    }
    return { persona: "general_smallbiz", voice: "friendly", emojiBias: ["📌","🤝","📈","🧭"], needs: ["save time", "post consistently", "sound human"] };
  }
  function extractNeed(problem, outcome, intent) {
    const p = (problem||"").toLowerCase();
    const o = (outcome||"").toLowerCase();
    if (/time|busy|no time|save time|faster/.test(p+o)) return "save time";
    if (/engage|chat|banter|conversation|quiet|silent|crickets/.test(p+o)) return "keep the conversation going";
    if (/leads|book|sales|call|inbox/.test(p+o)) return "get more inquiries";
    if (/consistent|presence|on-brand|look/.test(p+o)) return "stay consistent without sounding robotic";
    return intent.needs[0] || "get results faster";
  }
  function whoAndNeedLine(audience, need, intent) {
    const who = (audience || "your audience").trim();
    switch (intent.persona) {
      case "fantasy_commissioners": return `${who} need to ${need} (and keep the league chat alive).`;
      case "contractors":          return `${who} need to ${need} and look legit locally.`;
      case "realtors":             return `${who} need to ${need} and show up consistently.`;
      case "food_service":         return `${who} need to ${need} and bring people in the door.`;
      default:                     return `${who} need to ${need}.`;
    }
  }

  // ---------- Voice Mode (UI or fallback) ----------
  function resolveVoiceMode(intent, platform) {
    const uiVal = document.getElementById("voiceMode")?.value;
    if (uiVal) return uiVal; // "leadgen" | "community" | "authority"
    if (intent.persona === "fantasy_commissioners") return "community";
    if ((platform || "").toLowerCase() === "linkedin") return "authority";
    return "leadgen";
  }

  // ---------- Domain-aware angles (variety; no boilerplate) ----------
  function domainProfile(audience, keywords, offer) {
    const blob = (audience + " " + keywords + " " + offer).toLowerCase();
    const isFantasy = /fantasy|espn|sleeper|yahoo|commissioner|commish|league/.test(blob);
    if (isFantasy) {
      return {
        domain: "fantasy",
        pains: [
          "no time to write weekly recaps",
          "Sunday-night scramble to sound witty",
          "league chat going quiet by mid-season"
        ],
        benefits_time: [
          "you get your Sunday night back",
          "skip the scramble—recaps arrive done",
          "automation handles the recap grind"
        ],
        benefits_social: [
          "your group chat stays loud past Week 6",
          "friends keep the trash talk going",
          "the league actually reads the recaps"
        ],
        benefits_status: [
          "you look like an MVP commissioner",
          "your league treats you like a pro",
          "everyone thinks you hired a writer"
        ],
        result_verbs: ["Result", "Outcome", "Bottom line"]
      };
    }
    // default (general)
    return {
      domain: "generic",
      pains: [
        "hard to keep up with posts",
        "content takes too long to write",
        "ideas run out mid-week"
      ],
      benefits_time: [
        "you get hours back each week",
        "no more blank-page panic",
        "posts are ready when you are"
      ],
      benefits_social: [
        "your audience actually engages",
        "comments don’t fizzle out",
        "more saves and shares"
      ],
      benefits_status: [
        "you look consistent and on-brand",
        "you sound like a real person",
        "you ship content without stress"
      ],
      result_verbs: ["Result", "Outcome", "Bottom line"]
    };
  }

  // VOICE MODE aware angle selection
  function angleLines(profile, variantIndex, problemInput, outcomeInput, offer, voiceMode) {
    const pv = profile.result_verbs;

    // Voice: COMMUNITY / FUN
    if (voiceMode === "community") {
      const pains = profile.pains;
      const social = profile.benefits_social;
      const time = profile.benefits_time;

      if (variantIndex % 3 === 0) {
        return {
          pain: problemInput || `No time to keep your group lively: ${pains[0]}.`,
          benefit: `With ${offer}, ${time[variantIndex % time.length]}.`,
          result: `${pv[variantIndex % pv.length]}: ${outcomeInput || social[(variantIndex+1) % social.length]}.`
        };
      }
      if (variantIndex % 3 === 1) {
        return {
          pain: problemInput || `It’s easy to burn out: ${pains[1]}.`,
          benefit: `We handle the words so you don’t have to—${social[variantIndex % social.length]}.`,
          result: `${pv[variantIndex % pv.length]}: ${outcomeInput || social[(variantIndex+1) % social.length]}.`
        };
      }
      return {
        pain: problemInput || `Keeping momentum is hard: ${pains[2]}.`,
        benefit: `${offer} means ${social[variantIndex % social.length]}.`,
        result: `${pv[variantIndex % pv.length]}: ${outcomeInput || time[(variantIndex+1) % time.length]}.`
      };
    }

    // Voice: AUTHORITY / PRO
    if (voiceMode === "authority") {
      const pains = profile.pains;
      const status = profile.benefits_status;
      const time = profile.benefits_time;

      if (variantIndex % 3 === 0) {
        return {
          pain: problemInput || `Credibility slips when content lags: ${pains[0]}.`,
          benefit: `With ${offer}, you show up reliably and on-message.`,
          result: `${pv[variantIndex % pv.length]}: ${outcomeInput || status[(variantIndex+1) % status.length]}.`
        };
      }
      if (variantIndex % 3 === 1) {
        return {
          pain: problemInput || `Consistency is a heavy lift: ${pains[1]}.`,
          benefit: `${offer} cuts the lift so your expertise stays front and center.`,
          result: `${pv[variantIndex % pv.length]}: ${outcomeInput || time[(variantIndex+1) % time.length]}.`
        };
      }
      return {
        pain: problemInput || `The job’s bigger than it looks: ${pains[2]}.`,
        benefit: `${offer} helps you communicate like a trusted voice.`,
        result: `${pv[variantIndex % pv.length]}: ${outcomeInput || status[(variantIndex+1) % status.length]}.`
      };
    }

    // Default: LEAD GEN / SALES
    const pains = profile.pains;
    const time = profile.benefits_time;
    const social = profile.benefits_social;

    if (variantIndex % 3 === 0) {
      return {
        pain: problemInput || `It’s tough when people can’t find you: ${pains[0]}.`,
        benefit: `With ${offer}, you save hours and stay visible.`,
        result: `${pv[variantIndex % pv.length]}: ${outcomeInput || "more inquiries without the scramble"}.`
      };
    }
    if (variantIndex % 3 === 1) {
      return {
        pain: problemInput || `Content eats your time: ${pains[1]}.`,
        benefit: `${offer} handles the heavy lifting—${time[variantIndex % time.length]}.`,
        result: `${pv[variantIndex % pv.length]}: ${outcomeInput || social[(variantIndex+1) % social.length]}.`
      };
    }
    return {
      pain: problemInput || `Ideas run out mid-week: ${pains[2]}.`,
      benefit: `${offer} keeps you shipping, stress-free.`,
      result: `${pv[variantIndex % pv.length]}: ${outcomeInput || "consistent posts that sound human"}.`
    };
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

  // ---------- Writer Persona: onboarding + toggle + persistence ----------
  const LS_PERSONAS = "cc_onboarding_personas";      // JSON: [{id:'owner'|'brand'|'mascot', label:'...', name?:'Sabre'}]
  const LS_SELECTED  = "cc_writer_persona_selected"; // 'owner'|'brand'|'mascot'
  const LS_MASCOT    = "cc_mascot_name";             // string

  function seedPersonaDefaultsIfMissing() {
    if (!localStorage.getItem(LS_PERSONAS)) {
      const defaults = [{ id: "brand", label: "My Brand (we/us)" }];
      localStorage.setItem(LS_PERSONAS, JSON.stringify(defaults));
      localStorage.setItem(LS_SELECTED, "brand");
    }
  }
  seedPersonaDefaultsIfMissing();

  // Public API for onboarding screen
  window.CaptionCraft = window.CaptionCraft || {};
  window.CaptionCraft.saveOnboardingPersonas = function(personas) {
    try {
      if (!Array.isArray(personas) || personas.length === 0) return;
      localStorage.setItem(LS_PERSONAS, JSON.stringify(personas));
      const sel = localStorage.getItem(LS_SELECTED);
      const ids = new Set(personas.map(p => p.id));
      if (!sel || !ids.has(sel)) {
        localStorage.setItem(LS_SELECTED, personas[0].id);
      }
      const m = personas.find(p => p.id === "mascot" && p.name);
      if (m && m.name) localStorage.setItem(LS_MASCOT, m.name);
      initWriterPersonaUI();
    } catch (_) {}
  };

  function getOnboardedPersonas() {
    try { return JSON.parse(localStorage.getItem(LS_PERSONAS) || "[]"); }
    catch { return []; }
  }
  function getSelectedPersona() { return localStorage.getItem(LS_SELECTED) || "brand"; }
  function setSelectedPersona(id) { localStorage.setItem(LS_SELECTED, id); }
  function getMascotName() { return localStorage.getItem(LS_MASCOT) || ""; }
  function setMascotName(name) { localStorage.setItem(LS_MASCOT, (name || "").trim()); }

  function initWriterPersonaUI() {
    const personas = getOnboardedPersonas();
    const group = document.getElementById("writerPersonaGroup");
    const select = document.getElementById("writerPersona");
    const mGroup = document.getElementById("mascotNameGroup");
    const mInput = document.getElementById("mascotName");
    if (!group || !select) return;

    if (!personas || personas.length <= 1) {
      group.style.display = "none";
    } else {
      group.style.display = "";
      select.innerHTML = "";
      personas.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.label || p.id;
        select.appendChild(opt);
      });
      select.value = getSelectedPersona();

      const hasMascot = personas.some(p => p.id === "mascot");
      const sel = select.value;
      if (mGroup) mGroup.style.display = (hasMascot && sel === "mascot") ? "" : "none";
      if (mInput && hasMascot) {
        const onboardMascot = personas.find(p => p.id === "mascot" && p.name)?.name;
        mInput.value = onboardMascot || getMascotName() || "";
        mInput.addEventListener("input", () => setMascotName(mInput.value));
      }
      select.addEventListener("change", () => {
        setSelectedPersona(select.value);
        if (mGroup) mGroup.style.display = (select.value === "mascot") ? "" : "none";
      });
    }
  }
  initWriterPersonaUI();

  function resolveWriterPersona() {
    const personas = getOnboardedPersonas();
    const sel = getSelectedPersona();
    const exists = personas.some(p => p.id === sel);
    return exists ? sel : (personas[0]?.id || "brand");
  }
  function writerPrefix(writerId, audience) {
    const who = (audience || "your audience").toString().trim();
    if (writerId === "owner") {
      return `As a fellow ${who}, I get it:`;
    }
    if (writerId === "mascot") {
      const name = getMascotName() || "your mascot";
      return `${name} here — quick reality check:`;
    }
    return `At Bluedobie, we get it.`;
  }

  // ---------- Templates (Audience/Need + Angles + Voice Mode + Writer) ----------
  const TPL = {
    _assemble(ctx) {
    const { writerLine, variantIndex, profile, voiceMode, hook, whoNeed, offer, outcome, cta, tags, details, spacing, problem } = ctx;
      const a = angleLines(profile, variantIndex, problem, outcome, offer, voiceMode);
      const intro = hook ? `${hook}.` : "";
      const speaker = writerLine ? `${writerLine}` : "";
      const open = whoNeed;
      const sol  = a.benefit;
      const res  = a.result;
      const call = cta;
      let body = [intro, speaker, open, sol, res, call].filter(Boolean).join(spacing ? "\n\n" : " ");
      return tags ? `${body}\n\n${tags}` : body;
    },

    // ---- Facebook ----
    "facebook:post"(ctx) { return TPL._assemble(ctx); },
    "facebook:story"({ writerLine, profile, voiceMode, variantIndex, whoNeed, offer, outcome, cta }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let body = `${writerLine ? writerLine + "\n" : ""}${whoNeed.replace(/[.]+$/, "")}?\n${offer}\n${a.result}\n${cta}`;
      return body;
    },
    "facebook:reel"({ writerLine, profile, voiceMode, variantIndex, hook, offer, outcome, cta, tags }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let body = `${hook}\n${writerLine ? writerLine + "\n" : ""}${offer} → ${a.result.replace(/^.*?:\s*/,"")}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- Instagram ----
    "instagram:post"({ writerLine, profile, voiceMode, variantIndex, hook, whoNeed, offer, outcome, cta, tags, details, problem }) {
      const a = angleLines(profile, variantIndex, problem, outcome, offer, voiceMode);
      const lines = details
        ? [ hook, writerLine, whoNeed, `We’re handling it with ${offer}.`, a.result, cta ]
        : [ hook, writerLine, `${offer} → ${a.result.replace(/^.*?:\s*/,"")}`, cta ];
      let body = lines.filter(Boolean).join("\n\n");
      body = clip(body, 900);
      return tags ? `${body}\n\n${tags}` : body;
    },
    "instagram:story"({ writerLine, whoNeed, offer, cta }) {
      let body = `${writerLine ? writerLine + "\n" : ""}${whoNeed.replace(/[.]+$/, "")}?\n${offer}\n${cta}`;
      return clip(body, 220);
    },
    "instagram:reel"({ writerLine, profile, voiceMode, variantIndex, hook, offer, outcome, cta, tags }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let body = `${hook}\n${writerLine ? writerLine + "\n" : ""}${offer} → ${a.result.replace(/^.*?:\s*/,"")}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- Twitter (X) ----
    "twitter:post"({ writerLine, whoNeed, offer, outcome, cta, tags, profile, voiceMode, variantIndex }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let line = `${writerLine ? writerLine + " " : ""}${whoNeed} ${offer} → ${a.result.replace(/^.*?:\s*/,"")}. ${stripTrailingPunct(cta)}.`;
      line = clip(line, 280);
      return tags ? `${line} ${tags}` : line;
    },

    // ---- LinkedIn ----
    "linkedin:profile"(ctx) { return TPL._assemble(ctx); },
    "linkedin:page"(ctx)    { return TPL._assemble(ctx); },

    // ---- Google My Business ----
    "gmb:post"({ writerLine, whoNeed, offer, outcome, cta }) {
      const head = `**${offer}**`;
      const p = `${writerLine ? writerLine + "\n" : ""}${whoNeed}`;
      const res = outcome ? outcome : "";
      const call = cta;
      const contact = `Call **270-388-3535** or visit **bluedobiedev.com/contact**`;
      return [head, "", p, res ? `\n${res}` : "", call, "", contact].join("\n");
    },

    // ---- TikTok ----
    "tiktok:video"({ writerLine, whoNeed, offer, profile, voiceMode, variantIndex, outcome, cta, tags }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let body = `${writerLine ? writerLine + "\n" : ""}${whoNeed}\n${offer}\n${a.result}\n${cta}`;
      body = clip(body, 500);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- YouTube Shorts ----
    "ytshorts:short"({ writerLine, whoNeed, offer, profile, voiceMode, variantIndex, outcome, cta, tags }) {
      const a = angleLines(profile, variantIndex, "", outcome, offer, voiceMode);
      let body = `${writerLine ? writerLine + "\n" : ""}${whoNeed}\n${offer} → ${a.result.replace(/^.*?:\s*/,"")}\n${cta}`;
      body = clip(body, 300);
      return tags ? `${body}\n${tags}` : body;
    },

    // ---- YouTube longform ----
    "youtube:video"({ writerLine, whoNeed, offer, outcome, cta }) {
      const title = clip(`${offer}: ${ (outcome || whoNeed).replace(/^[A-Z]/, (m) => m.toLowerCase()) }`, 100);
      const descLines = [
        `【 Speaker 】`,
        writerLine || "—",
        "",
        `【 Who this is for 】`,
        `${whoNeed}`,
        "",
        `【 What you’ll learn 】`,
        `• Why this matters`,
        `• How ${offer} solves it`,
        `• What changes: ${outcome || "less stress, better results"}`,
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

  // Build three variants with rotating angles & hooks
  function buildVariants(ctx, platform, format) {
    const key = `${platform}:${format}`.toLowerCase();
    const make = TPL[key] || TPL["facebook:post"];
    const variants = [];
    for (let i = 0; i < 3; i++) {
      const ctxWithVariant = { ...ctx, variantIndex: i };
      variants.push(make(ctxWithVariant));
      ctx.hook = pick(ctx.hookPool);
    }
    return variants;
  }

  // ---- First Comment generator (Instagram + LinkedIn) ----
  function buildFirstComment(platform, format, tags, utmUrl) {
    const p = (platform || "").toLowerCase();
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
  if (!offer || offer.length < 2) issues.push("Offer looks empty/too short.");
  if (!problem || problem.length < 3) issues.push("Problem looks empty/too short.");
  if (!outcome || outcome.length < 3) issues.push("Outcome looks empty/too short.");
  if (!cta || cta.length < 2) issues.push("CTA looks empty/too short.");
  return issues;
}

  // ---------- Form handling ----------
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!results) return;
    results.innerHTML = "";

    const audience = ($("#audience")?.value || "small business owners").trim();
    const offer = humanizeOffer($("#offer")?.value || "our $299 three-page website special");
    const outcome = humanizeOutcome($("#outcome")?.value || "more qualified leads in your inbox");
    const problem = humanizeProblem($("#problem")?.value || "customers can’t find your business online");
    const rawCTA = ($("#cta")?.value || "Book your consultation this week.").trim();
    const keywords = ($("#keywords")?.value || "webdesign, marketing, bluedobiedev").trim();

    const platform = (platformEl?.value || "Facebook").trim().toLowerCase();
    const format = (formatEl?.value || "Post").trim().toLowerCase();

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

    // Audience intent + needs + who/need line
    const intent = audienceIntent(audience, keywords);
    const need = extractNeed(problem, outcome, intent);
    const whoNeed = whoAndNeedLine(audience, need, intent);

    // Voice Mode (UI or fallback)
    const voiceMode = resolveVoiceMode(intent, platform);

    // Domain profile for angle variety
    const profile = domainProfile(audience, keywords, offer);

    // Writer persona (from onboarding or toggle)
    const writerId = resolveWriterPersona();
    const writerLine = writerPrefix(writerId, audience);

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

    // Shared context for templates
    let ctx = {
      hook, hookPool,
      audience, problem, offer, outcome,
      cta: ctaNoUrl,
      tags, details, spacing,
      intent, need, whoNeed, profile, voiceMode,
      writerId, writerLine
    };

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

    // Emoji uniformity check across the set
    const allEmojis = caps.flatMap(c => extractEmojis(c.out));
    const dominantGeneric = allEmojis.filter(e => GENERIC_AI_EMOJIS.includes(e));
    const setUniformWarning = dominantGeneric.length >= 3;

    // ---------- Render ----------
    caps.forEach((obj, i) => {
      let text = obj.out;
      const fragFixed = obj.changed;

      // Analyze emojis & prepare suggestions
      const issuesE = emojiIssues(text);
      const suggestPool = suggestEmojiPool(keywords, audience, platform);
      const looksAIish = issuesE.looksAIish || setUniformWarning;

      const card = document.createElement("div");
      card.className = "caption-card";
      const meta = `${platform.toUpperCase()} • ${format.toUpperCase()} • ${voiceMode.toUpperCase()}`;
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

      copyBtn?.addEventListener("click", () => {
        ta.select(); document.execCommand("copy");
        copyBtn.textContent = "Copied!"; setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });

      emojiBtn?.addEventListener("click", () => {
        const newText = deAIifyEmojis(ta.value, suggestEmojiPool(keywords, audience, platform), platform);
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
  clearBtn?.addEventListener("click", () => {
    ["audience","offer","outcome","problem","cta","keywords"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    const lenEl = document.getElementById("captionLength"); if (lenEl) lenEl.value = "Medium";
    const denEl = document.getElementById("hashtagDensity"); if (denEl) denEl.value = "Standard";
    const cleanEl = document.getElementById("cleanHashtags"); if (cleanEl) cleanEl.checked = true;
    const toneEl = document.getElementById("tone"); if (toneEl) toneEl.value = 0.5;
    const voiceEl = document.getElementById("voiceMode"); if (voiceEl) voiceEl.value = voiceEl.value || "leadgen";
    results.innerHTML = "";
  });
});