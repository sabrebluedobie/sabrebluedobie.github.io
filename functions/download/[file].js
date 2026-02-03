export async function onRequest({ params, env }) {
  const fileName = params.file;

  // Basic allowlist (start small)
  const allowedFiles = [
    "Facebook-vs-Website.pdf"
  ];

  if (!allowedFiles.includes(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  const object = await env.DOWNLOADS_BUCKET.get(fileName);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
