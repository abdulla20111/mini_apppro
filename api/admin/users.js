const { send, requireMethod, authenticate, supabase } = require("../_lib");

module.exports = async (req, res) => {
  if (!requireMethod(req, res, req.method === "GET" ? "GET" : "POST")) return;
  const admin = await authenticate(req, res, true);
  if (!admin) return;

  try {
    if (req.method === "GET") {
      const rows = await supabase("users?select=telegram_id,first_name,last_name,username,status,created_at&order=created_at.desc");
      return send(res, 200, { users: rows || [] });
    }
    const { telegram_id, status } = req.body || {};
    if (!telegram_id || !["pending", "approved", "blocked"].includes(status)) {
      return send(res, 400, { error: "telegram_id va pending/approved/blocked status kerak." });
    }
    await supabase(`users?telegram_id=eq.${encodeURIComponent(String(telegram_id))}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status })
    });
    return send(res, 200, { ok: true });
  } catch (error) {
    return send(res, 500, { error: error.message });
  }
};
