// ----- Config -----
const API_URL = "https://quickspin-api.vercel.app/api/create"; // same as form action

// ----- Elements -----
const form = document.getElementById('quickspin-form');
const out = document.getElementById('output');
const statusEl = document.getElementById('status');
const dlBtn = document.getElementById('download');

// ----- Render helper -----
function render(data){
  // supports { posts: [...] } shape or legacy { result: "..." }
  if (data && Array.isArray(data.posts)) {
    return data.posts.map((p,i)=>{
      const hs = (p.hashtags||[]).join(' ');
      return [
        `— Post ${i+1} —`,
        p.short ? `[Short]\n${p.short}` : "",
        p.medium ? `\n[Medium]\n${p.medium}` : "",
        p.cta ? `\n[CTA]\n${p.cta}` : "",
        hs ? `\n[Hashtags]\n${hs}` : "",
        p.image_prompt ? `\n[Image Prompt]\n${p.image_prompt}` : ""
      ].filter(Boolean).join("\n");
    }).join("\n\n");
  }
  return (data && data.result) ? data.result : 'No result.';
}

// ----- Submit handler -----
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  out.textContent = "Thinking…";
  statusEl.textContent = "";

  try {
    const body = Object.fromEntries(new FormData(form).entries());
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || ('HTTP '+res.status));
    }

    const data = await res.json();
    out.textContent = render(data) + (data.mode ? `\n\n(mode: ${data.mode})` : "");
    statusEl.textContent = "Done";
  } catch (err) {
    out.textContent = "Error: " + (err && err.message ? err.message : "Failed.");
    statusEl.textContent = "Failed";
    console.error(err);
  }
});

// ----- Download .txt -----
dlBtn.addEventListener('click', () => {
  const blob = new Blob([out.textContent || ""], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quickspin_result.txt';
  a.click();
  URL.revokeObjectURL(url);
});
