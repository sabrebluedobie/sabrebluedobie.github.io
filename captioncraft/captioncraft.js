// @ts-nocheck
// DobieCore CaptionCraft — clean HTML form, 3/day gating, optional AI remix via Worker
// This is a full-drop replacement for /captioncraft/captioncraft.js

// ---------- tiny DOM helpers (avoid '$ already declared' issues)
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- usage gating (3/day for Free)
function todayKey() {
  const d = new Date();
  return `dcc_usage_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
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
function resetIfNewDay() {
  // noop by design: different key per day
  return;
}
function isPro() {
  // Local dev/pro unlocks
  return localStorage.getItem("dcc_pro") === "1" || !!localStorage.getItem("dcc_pro_email");
}
function updateUsageCounter() {
  const el = qs("#usageCounter");
  if (!el) return;
  if (isPro()) {
    el.textContent = "Pro: unlimited captions";
    return;
  }
  const { n } = getUsage();
  el.textContent = `Free today: ${Math.max(0, 3 - n)} of 3 left`;
}
function showUpgrade() {
  qs("#upgradeModal").style.display = "block";
}
function closeModal() {
  qs("#upgradeModal").style.display = "none";
}

// ---------- platform utilities
function platformKey(p = "Instagram", f = "Post") {
  return `${String(p||"").toLowerCase()}:${String(f||"").toLowerCase()}`;
}
function platformStyle(p) {
  switch ((p||"").toLowerCase()) {
    case "linkedin": return { emoji:false, lineBreaks:true, hashCap:6 };
    case "tiktok":   return { emoji:true,  lineBreaks:false, hashCap:8 };
    case "facebook": return { emoji:true,  lineBreaks:true,  hashCap:8 };
    case "twitter":  return { emoji:false, lineBreaks:true,  hashCap:4 };
    default:         return { emoji:true,  lineBreaks:true,  hashCap:12 }; // Instagram et al.
  }
}

// ---------- punctuation + basics
function cleanPunctuation(s="") {
  return s
    .replace(/\s{2,}/g, " ")
    .replace(/([.!?])\1{1,}/g, "$1")      // ... -> . / !! -> !
    .replace(/([.!?])\s*([.!?])/g, "$1 ") // prevent back-to-back
    .replace(/\s+([,.;:!?])/g, "$1")      // trim space before punctuation
    .replace(/([,.;:!?])([^\s])/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .trim();
}
const COMMON_VERBS = /(?:get|have|be|is|are|was|were|do|make|build|grow|find|fix|help|win|drive|boost|book|buy|claim|start|learn|see|save|earn|bring|keep|write|post|plan|schedule|recap)/i;
function isHashtagLine(line){ return /^#\w/.test(line.trim()); }
function isUrl(s){ return /^https?:\/\//i.test(s); }
function isTitleLine(line){ return /^caption\s+\d+/i.test(line.trim()); }
function cleanLine(line){
  if (isHashtagLine(line) || isUrl(line) || isTitleLine(line)) return line.trim();
  let s = line.replace(/\s{2,}/g," ").replace(/\.{4,}/g,"…").trim();
  s = s.replace(/\b(\w+)\s+\1\b/gi,"$1");
  if (s.length>0) s = s[0].toUpperCase()+s.slice(1);
  const tooShort = s.length<25 && !/[!?]$/.test(s);
  const noVerb   = !COMMON_VERBS.test(s);
  if (tooShort || noVerb) return s; // keep short lines if intentionally short
  return s;
}

// ---------- hashtags
function cleanTag(s){
  return s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"").replace(/^#+/,"");
}
function buildHashtags(keywords="", density="standard", clean=true, platform="instagram", format="post"){
  const p = String(platform||"").toLowerCase();
  const f = String(format||"").toLowerCase();
  if (p==="gmb" || p==="youtube" || f==="story") return "";
  let parts = String(keywords||"").split(",").map(t => t.trim()).filter(Boolean);
  if (clean) parts = parts.map(cleanTag);
  parts = [...new Set(parts)].filter(Boolean);
  let cap = 5;
  if (p==="instagram" || p==="facebook") cap = (f==="reel") ? 7 : (density==="heavy" ? 10 : density==="light" ? 4 : 7);
  else if (p==="twitter") cap = (density==="heavy" ? 3 : 2);
  else if (p==="linkedin") cap = (density==="heavy" ? 5 : density==="light" ? 2 : 3);
  else if (p==="tiktok") cap = (density==="heavy" ? 15 : density==="light" ? 6 : 10);
  else if (p==="ytshorts") cap = (density==="heavy" ? 7 : density==="light" ? 3 : 5);
  return parts.slice(0, cap).map(t => t ? `#${t}` : "").filter(Boolean).join(" ");
}

// ---------- company intro
function brandLead(company){
  const c = (company||"").trim();
  if (!c) return ""; // no default "At Bluedobie" if empty
  return Math.random()<0.5 ? `At ${c}, ` : `${c} — `;
}

// ---------- local templates
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

function makeTemplate(ctx){
  const { company, audience, problem, outcome, offer, cta, platform, tone, length, keywords, format, voiceMode } = ctx;
  const p = platformStyle(platform);
  const intro = `${brandLead(company)}we get it—small business owners need more inquiries.`;
  const hooks = [
    `Quick win: ${outcome || "better results, less stress"}.`,
    `Tired of ${problem || "content taking too long"}?`,
    `${(audience||"Busy owners")[0].toUpperCase()+(audience||"Busy owners").slice(1)}, this is for you.`
  ];
  let hook = hooks[Math.floor(Math.random()*hooks.length)];
  const bodyBits = [
    offer ? `We built ${offer} for real‑world schedules.` : `We built a tool for real‑world schedules.`,
    `Get captions done fast so you can stay visible.`,
    outcome ? `Bottom line: ${outcome}.` : ``,
    cta ? `${cta}` : ``
  ].filter(Boolean);

  // length control
  let keep = 3;
  const L = String(length||"medium").toLowerCase();
  if (L==="short") keep = 2;
  if (L==="medium") keep = 3;
  if (L==="long") keep = Math.min(bodyBits.length, 5);
  const chosen = [];
  let pool = bodyBits.slice();
  while (chosen.length<keep && pool.length) chosen.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);

  let text = [hook, intro, chosen.join(p.lineBreaks? "\n" : " ")].filter(Boolean).join(p.lineBreaks? "\n\n" : " ");
  const tags = buildHashtags(keywords, qs("#hashtagDensity")?.value?.toLowerCase() || "standard", !!qs("#cleanHashtags")?.checked, platform, format);
  if (tags) text = p.lineBreaks ? `${text}\n\n${tags}` : `${text} ${tags}`;
  text = cleanPunctuation(text);
  return text;
}

// ---------- CTA helpers
const CTA_POOL = [
  "Book now", "Call today", "Message us to claim", "Learn more", "See how it works", "Get your free consult"
];
function pickCTAs(userCTA){
  const out = [];
  if (userCTA && userCTA.trim()) out.push(userCTA.trim());
  while (out.length<3) {
    const x = CTA_POOL[Math.floor(Math.random()*CTA_POOL.length)];
    if (!out.includes(x)) out.push(x);
  }
  return Array.from(new Set(out)).slice(0,3);
}

// ---------- AI Remix (Cloudflare Worker) optional
const WORKER_URLS = [
  "https://www.bluedobiedev.com/api/remix",
  "https://dobiecore-remix.melanie-brown.workers.dev"
];

async function maybeRemixWithAI(texts, brief){
  const allowAI = isPro(); // set localStorage dcc_pro=1 to force-enable
  if (!allowAI) return texts;
  const payload = {
    drafts: texts.map((t,i)=>({ id:String(i+1), text:t })),
    platform: (brief.platform||"instagram"),
    tone: typeof brief.tone === "number" ? brief.tone : 0.5,
    length: (brief.length||"medium").toLowerCase(),
    ctaOptions: pickCTAs(brief.cta),
    hashtags: buildHashtags(brief.keywords, (brief.hashtagDensity||"standard").toLowerCase(), brief.cleanHashtags !== false, brief.platform, brief.format)
  };
  for (const url of WORKER_URLS){
    try{
      const res = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        return data.map(d => String(d.text || "")).filter(Boolean);
      }
    }catch{ /* try next url */ }
  }
  console.warn("AI remix unavailable; using local drafts");
  return texts;
}

// ---------- render
function renderCards(texts){
  const results = qs("#results");
  results.innerHTML = "";
  texts.forEach((text, i) => {
    const card = document.createElement("article");
    card.className = "caption-card";
    const hashtagsOnly = text.split("\n").filter(l => l.trim().startsWith("#")).join(" ");
    const fcBlock = hashtagsOnly ? `<div class="first-comment"><div class="muted">First comment</div><textarea readonly>${hashtagsOnly}</textarea><div class="actions"><button type="button" class="copy-first-btn">Copy first comment</button></div></div>` : "";
    card.innerHTML = `
      <h3>Caption ${i+1}</h3>
      <textarea readonly>${text}</textarea>
      <div class="row" style="gap:8px;flex-wrap:wrap;">
        <button type="button" class="copy-btn">Copy</button>
        <span class="meta">Platform-ready</span>
      </div>
      ${fcBlock}
    `;
    results.appendChild(card);

    const copyBtn = card.querySelector(".copy-btn");
    const ta = card.querySelector("textarea");
    copyBtn?.addEventListener("click", () => { ta.select(); document.execCommand("copy"); copyBtn.textContent="Copied!"; setTimeout(()=>copyBtn.textContent="Copy",1200); });
    const fcCopy = card.querySelector(".copy-first-btn");
    if (fcCopy){
      const fta = card.querySelector(".first-comment textarea");
      fcCopy.addEventListener("click", ()=>{ fta.select(); document.execCommand("copy"); fcCopy.textContent="Copied!"; setTimeout(()=>fcCopy.textContent="Copy first comment",1200); });
    }
  });
}

// ---------- brief reader
function readBrief(){
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
  resetIfNewDay();
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
  window.addEventListener("click", (e) => { const modal = qs("#upgradeModal"); if (e.target === modal) closeModal(); });

  // Submit → generate
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // gating
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

    // build 3 local variants
    const key = platformKey(brief.platform, brief.format);
    const make = TPL[key] || makeTemplate;
    const local = [];
    for (let i=0;i<3;i++) local.push(make(brief));

    // optional AI remix
    const remixed = await maybeRemixWithAI(local, brief);

    // render
    renderCards(remixed);

    if (!isPro()) {
      incrementUsage();
      updateUsageCounter();
    }
  });

  clearBtn?.addEventListener("click", () => {
    qs("#captionForm").reset();
    results.innerHTML = "";
    updateUsageCounter();
  });
});
