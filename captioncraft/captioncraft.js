// @ts-nocheck
/* DobieCore Captions — durable submit wiring, platform/format helpers, safe guards
   This file intentionally avoids optional selector explosions and ensures rendering always occurs.
*/

// ---------- tiny helpers
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- state: usage gating with API check
const USAGE_KEY_PREFIX = "dcc_usage_";
const API_BASE = "https://dobiecore-remix.melanie-brown.workers.dev/api";

// Check if user is pro (checks API first, then falls back to localStorage)
async function isPro() {
  const email = localStorage.getItem("dcc_email");
  if (!email) return false;
  
  // Check cache first (valid for 5 minutes)
  const cacheKey = "dcc_pro_cache";
  const cacheTime = "dcc_pro_cache_time";
  const cached = localStorage.getItem(cacheKey);
  const cacheTimestamp = parseInt(localStorage.getItem(cacheTime) || "0");
  const now = Date.now();
  
  if (cached === "true" && (now - cacheTimestamp) < 5 * 60 * 1000) {
    return true;
  }
  
  // Check API
  try {
    const res = await fetch(`${API_BASE}/check-pro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.isPro) {
        localStorage.setItem(cacheKey, "true");
        localStorage.setItem(cacheTime, String(now));
        return true;
      }
    }
  } catch (err) {
    console.warn("Pro check failed, using local cache:", err);
  }
  
  // Clear cache if not pro
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(cacheTime);
  return false;
}

const todayKey = () => {
  const d = new Date();
  return `${USAGE_KEY_PREFIX}${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const getUsage = () => parseInt(localStorage.getItem(todayKey()) || "0", 10);
const incUsage = () => localStorage.setItem(todayKey(), String(getUsage()+1));

async function updateUsageCounter(){
  const el = qs("#usageCounter");
  if (!el) return;
  
  const pro = await isPro();
  el.textContent = pro ? "Pro: unlimited captions" : `Free today: ${Math.max(0, 3 - getUsage())} of 3 left`;
}

// ---------- platform/format hints
const FORMAT_MAP = {
  facebook:["Post","Story","Reel"],
  instagram:["Post","Story","Reel"],
  twitter:["Post"],
  linkedin:["Profile","Page"],
  gmb:["Post"],
  tiktok:["Video"],
  ytshorts:["Short"],
  youtube:["Video"]
};
const FORMAT_HINT = {
  "facebook:post":"1–3 short paragraphs • 4–7 hashtags",
  "facebook:story":"2–3 lines • no hashtags • link sticker",
  "facebook:reel":"Hook + 1–2 lines • 3–5 hashtags",
  "instagram:post":"Hook + 2–3 lines • 5–9 hashtags",
  "instagram:story":"Very short • no hashtag soup • link sticker",
  "instagram:reel":"Hook + benefit + CTA • 3–7 hashtags",
  "twitter:post":"≤ 280 chars • ≤ 2 hashtags",
  "linkedin:profile":"3–6 lines • business tone • ≤ 3 hashtags",
  "linkedin:page":"Brand voice • ≤ 3 hashtags",
  "gmb:post":"Plain, local keywords • no hashtags",
  "tiktok:video":"Hook + 2 lines + CTA • 6–10 hashtags",
  "ytshorts:short":"2–3 lines • 3–5 hashtags",
  "youtube:video":"Title + description • avoid hashtag soup"
};

function refreshFormats(){
  const platformEl = qs("#platform");
  const formatEl   = qs("#format");
  if (!platformEl || !formatEl) return;
  const platform = String(platformEl.value || "Facebook").toLowerCase();
  const options = FORMAT_MAP[platform] || ["Post"];
  formatEl.innerHTML = "";
  for (const opt of options){
    const o = document.createElement("option");
    o.textContent = opt;
    formatEl.appendChild(o);
  }
  updateFormatHint();
}
function updateFormatHint(){
  const platformEl = qs("#platform");
  const formatEl   = qs("#format");
  const hint       = qs("#formatHint");
  if (!platformEl || !formatEl || !hint) return;
  const key = `${String(platformEl.value||"Facebook").toLowerCase()}:${String(formatEl.value||"Post").toLowerCase()}`;
  hint.textContent = FORMAT_HINT[key] || "";
}

// ---------- text utilities
function cleanPunctuation(s=""){
  return s
    .replace(/\s{2,}/g," ")
    .replace(/([.!?])\1{1,}/g,"$1")
    .replace(/([.!?])\s*([.!?])/g,"$1 ")
    .replace(/\s+([,.;:!?])/g,"$1")
    .replace(/([,.;:!?])([^\s])/g,"$1 $2")
    .trim();
}
function humanize(s, {platform} = {}){
  if (!s) return s;
  let out = cleanPunctuation(s);
  if (String(platform).toLowerCase() === "linkedin"){
    const lines = out.split("\n"); if (lines.length > 6) out = lines.slice(0,6).join("\n");
  }
  return out.trim();
}
function cleanTag(s){ return s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"").replace(/^#+/,""); }
function buildHashtags(keywords="", density="standard", clean=true, platform="instagram", format="post"){
  const p = String(platform||"").toLowerCase();
  const f = String(format||"").toLowerCase();
  if (p==="gmb"||p==="youtube"||f==="story") return "";
  let parts = String(keywords||"").split(",").map(t=>t.trim()).filter(Boolean);
  if (clean) parts = parts.map(cleanTag);
  parts = [...new Set(parts)].filter(Boolean);
  let cap = 7;
  if (p==="twitter") cap = density==="heavy"?3:2;
  else if (p==="linkedin") cap = density==="heavy"?5:density==="light"?2:3;
  else if (p==="tiktok") cap = density==="heavy"?15:density==="light"?6:10;
  else if (p==="ytshorts") cap = density==="heavy"?7:density==="light"?3:5;
  return parts.slice(0,cap).map(t=>`#${t}`).join(" ");
}
function platformStyle(p){
  switch(String(p||"").toLowerCase()){
    case "linkedin": return {emoji:false,lineBreaks:true};
    case "twitter":  return {emoji:false,lineBreaks:true};
    case "tiktok":   return {emoji:true,lineBreaks:false};
    case "facebook": return {emoji:true,lineBreaks:true};
    default:         return {emoji:true,lineBreaks:true}; // instagram etc
  }
}

// ---------- caption factory (local)
function makeCaption({company, offer, audience, problem, outcome, cta, platform, format, length, tone, keywords}){
  const p = platformStyle(platform);
  const hookPool = {
    pro: ["Quick win you'll actually use","A small change, big payoff","This fixes the 'no time' problem"],
    friendly: ["Weekend vibes + real help","Hey, local friends — this helps","What if 'marketing' felt easy?"]
  };
  const hooks = tone <= 0.4 ? hookPool.pro : hookPool.friendly;
  const hook = pick(hooks);

  const who = audience ? `For ${audience},` : `For busy folks,`;
  const body = [
    company ? `At ${company}, we get it.` : null,
    offer || "Your offer here.",
    problem ? `You're battling ${problem} —` : null,
    outcome ? `we'll help you get ${outcome}.` : null
  ].filter(Boolean).join(" ");

  const ctas = ["Book now","Message us to claim","Learn more","Call today","Get a free quote"];
  const picked = cta && cta.trim() ? cta.trim() : pick(ctas);
  const capLen = String(length||"Medium").toLowerCase();
  const trimmed = capLen === "short" ? `${hook}. ${offer || ""} ${picked}`.trim()
                : capLen === "long"  ? `${hook}. ${who} ${body} ${picked}.`
                : `${hook}. ${body} ${picked}.`;

  const tags = buildHashtags(keywords, (qs("#hashtagDensity")?.value||"Standard").toLowerCase(), !!qs("#cleanHashtags")?.checked, platform, format);
  const text = p.lineBreaks ? [trimmed, tags].filter(Boolean).join("\n\n") : `${trimmed} ${tags}`.trim();
  return humanize(text, {platform});
}

// ---------- render
function renderCards(texts){
  const root = qs("#results"); if (!root) return;
  root.innerHTML = "";
  texts.forEach((text, i) => {
    const card = document.createElement("article");
    card.className = "card";
    // first comment block (hashtags only)
    const hashtagsOnly = text.split("\n").filter(l => l.trim().startsWith("#")).join(" ");
    const fcBlock = hashtagsOnly ? `
      <div class="first-comment">
        <div class="row" style="justify-content:space-between"><strong>First comment (copy)</strong>
          <button type="button" class="btn secondary" data-firstcopy>Copy first comment</button>
        </div>
        <textarea readonly>${hashtagsOnly}</textarea>
      </div>` : "";

    card.innerHTML = `
      <h3>Caption ${i+1}</h3>
      <textarea id="cap_${i+1}" readonly>${text}</textarea>
      <div class="row">
        <button type="button" class="btn" data-copy="cap_${i+1}">Copy</button>
        <span class="meta muted">Auto-formatted</span>
      </div>
      ${fcBlock}
    `;
    root.appendChild(card);
  });

  // Wire copy buttons
  root.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-copy]");
    if (btn){
      const id = btn.getAttribute("data-copy");
      const ta = document.getElementById(id);
      if (ta){ ta.select(); document.execCommand("copy"); btn.textContent = "Copied!"; setTimeout(()=>btn.textContent="Copy", 1000); }
    }
    if (ev.target.matches("button[data-firstcopy]")){
      const ta = ev.target.closest(".first-comment")?.querySelector("textarea");
      if (ta){ ta.select(); document.execCommand("copy"); ev.target.textContent="Copied!"; setTimeout(()=>ev.target.textContent="Copy first comment", 1000); }
    }
  }, { once:true });
}

// ---------- AI remix (everyone gets AI, usage gated elsewhere)
const WORKER_URLS = [
  `${API_BASE}/remix`,
  "https://www.bluedobiedev.com/api/remix"
];
async function maybeRemixWithAI(texts, brief){
  const payload = {
    drafts: texts.map((t,i)=>({id:String(i+1),text:t})),
    platform: brief.platform, tone: brief.tone, length: brief.length,
    ctaOptions: [brief.cta].filter(Boolean),
    hashtags: buildHashtags(brief.keywords, (brief.hashtagDensity||"standard").toLowerCase(), brief.cleanHashtags !== false, brief.platform, brief.format)
  };
  for (const url of WORKER_URLS){
    try{
      const res = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data.map(d => String(d.text||"")).filter(Boolean);
    }catch{/* ignore */}
  }
  console.warn("AI remix unavailable; using local drafts");
  return texts;
}

// ---------- read brief
function readBrief(){
  const v = id => qs(`#${id}`)?.value?.trim() || "";
  return {
    company: v("company"),
    offer: v("offer"),
    audience: v("audience"),
    problem: v("problem"),
    outcome: v("outcome"),
    cta: v("cta"),
    keywords: v("keywords"),
    platform: v("platform") || "Instagram",
    format: v("format") || "Post",
    length: v("captionLength") || "Medium",
    tone: parseFloat(v("tone") || "0.5"),
    hashtagDensity: v("hashtagDensity") || "Standard",
    cleanHashtags: qs("#cleanHashtags")?.checked !== false
  };
}

// ---------- wiring
(function init(){
  const form = qs("#captionForm");
  const results = qs("#results");
  if (!form || !results){ console.warn("DobieCore Captions: required DOM not found."); return; }

  refreshFormats(); 
  updateUsageCounter(); // This is now async but we don't need to await it

  // tone label
  const toneEl = qs("#tone"); const toneLbl = toneEl?.nextElementSibling;
  toneEl?.addEventListener("input", () => {
    const t = parseFloat(toneEl.value||"0.5");
    toneLbl && (toneLbl.textContent = t < 0.35 ? "Professional" : t > 0.65 ? "Playful" : "Balanced");
  });

  qs("#platform")?.addEventListener("change", refreshFormats);
  qs("#format")?.addEventListener("change", updateFormatHint);

  // Modal actions
  const modal = qs("#upgradeModal");
  qs("#upgradeBtn")?.addEventListener("click", () => window.location.href = "https://buy.stripe.com/6oUaEY6oTaHBcd6drP0x203");
  qs("#alreadyProBtn")?.addEventListener("click", () => {
    const email = prompt("Enter the email you used to purchase (this will verify with our system):");
    if (email && /\S+@\S+\.\S+/.test(email)){ 
      localStorage.setItem("dcc_email", email.toLowerCase());
      // Clear cache to force a fresh check
      localStorage.removeItem("dcc_pro_cache");
      localStorage.removeItem("dcc_pro_cache_time");
      updateUsageCounter(); 
      modal?.setAttribute("hidden",""); 
      alert("Checking your pro status. If you just purchased, please wait a moment and try generating a caption."); 
    }
    else alert("That email doesn't look valid.");
  });
  qs("#closeModalBtn")?.addEventListener("click", () => modal?.setAttribute("hidden",""));
  window.addEventListener("click", (e) => { if (e.target === modal) modal?.setAttribute("hidden",""); });

  // Submit
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const brief = readBrief();
    if (!brief.offer){
      alert("Please add what you're promoting (the Offer).");
      qs("#offer")?.focus();
      return;
    }

    const pro = await isPro();
    if (!pro && getUsage() >= 3){
      modal?.removeAttribute("hidden");
      return;
    }

    // build local drafts
    const drafts = [makeCaption(brief), makeCaption(brief), makeCaption(brief)];

    // optional AI remix
    const out = await maybeRemixWithAI(drafts, brief);

    renderCards(out);

    if (!pro){ incUsage(); updateUsageCounter(); }
    results.scrollIntoView({behavior:"smooth",block:"start"});
  });

  // Clear
  qs("#clearBtn")?.addEventListener("click", () => {
    ["company","offer","audience","problem","outcome","cta","keywords"].forEach(id => { const el = qs(`#${id}`); if (el) el.value = ""; });
    qs("#captionLength") && (qs("#captionLength").value = "Medium");
    qs("#hashtagDensity") && (qs("#hashtagDensity").value = "Standard");
    qs("#cleanHashtags") && (qs("#cleanHashtags").checked = true);
    qs("#tone") && (qs("#tone").value = 0.5);
    results.innerHTML = "";
  });
})();