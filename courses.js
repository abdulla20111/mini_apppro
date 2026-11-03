const { send, requireMethod, authenticate, supabase } = require("../_lib");

module.exports = async (req, res) => {
  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return send(res, 405, { error: "Method not allowed" });
  }
  const admin = await authenticate(req, res, true);
  if (!admin) return;

  try {
    if (req.method === "GET") {
      const rows = await supabase("courses?select=*&order=created_at.desc");
      return send(res, 200, { courses: rows || [] });
    }
    const body = req.body || {};
    if (req.method === "POST") {
      if (!body.title || !["ai", "it"].includes(body.track)) return send(res, 400, { error: "title va ai/it track kerak." });
      const rows = await supabase("courses", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify([{ title: String(body.title).slice(0, 160), description: String(body.description || "").slice(0, 1000), track: body.track }])
      });
      return send(res, 201, { course: rows?.[0] });
    }
    if (!body.id) return send(res, 400, { error: "id kerak." });
    if (req.method === "PATCH") {
      const patch = {};
      if (body.title !== undefined) patch.title = String(body.title).slice(0, 160);
      if (body.description !== undefined) patch.description = String(body.description).slice(0, 1000);
      if (body.track !== undefined && ["ai", "it"].includes(body.track)) patch.track = body.track;
      await supabase(`courses?id=eq.${encodeURIComponent(body.id)}`, {
        method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch)
      });
      return send(res, 200, { ok: true });
    }
    await supabase(`courses?id=eq.${encodeURIComponent(body.id)}`, { method: "DELETE" });
    return send(res, 200, { ok: true });
  } catch (error) {
    return send(res, 500, { error: error.message });
  }
};
