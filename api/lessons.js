const { send, requireMethod, authenticate, supabase, requireConfig } = require("./_lib");

module.exports = async (req, res) => {
  if (!requireMethod(req, res, "GET")) return;
  const user = await authenticate(req, res, false);
  if (!user) return;
  if (!requireConfig(res)) return;

  try {
    if (!user.isAdmin) {
      const rows = await supabase(`users?select=status&telegram_id=eq.${encodeURIComponent(user.id)}&limit=1`);
      if (rows?.[0]?.status !== "approved") return send(res, 403, { error: "Darslarni ko‘rish uchun admin tasdig‘i kerak." });
    }

    const lessons = await supabase("lessons?select=id,title,description,track,storage_path,created_at&order=created_at.desc");
    const result = [];
    for (const lesson of lessons || []) {
      const signed = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/sign/academy-videos/${lesson.storage_path}`, {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expiresIn: 300 })
      });
      if (!signed.ok) continue;
      const signedData = await signed.json();
      result.push({
        id: lesson.id, title: lesson.title, description: lesson.description,
        track: lesson.track,
        video_url: `${process.env.SUPABASE_URL}/storage/v1${signedData.signedURL}`
      });
    }
    return send(res, 200, { lessons: result });
  } catch (error) {
    return send(res, 500, { error: error.message });
  }
};
