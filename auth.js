const { send, requireMethod, authenticate } = require("./_lib");

module.exports = async (req, res) => {
  if (!requireMethod(req, res, "POST")) return;
  const user = await authenticate(req, res, false);
  if (!user) return;
  try {
    let status = "pending";
    if (user.isAdmin) status = "approved";
    else {
      const rows = await require("./_lib").supabase(
        `users?select=status&telegram_id=eq.${encodeURIComponent(user.id)}&limit=1`
      );
      status = rows?.[0]?.status || "pending";
    }
    send(res, 200, {
      user: { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username },
      role: user.isAdmin ? "admin" : "student",
      status
    });
  } catch (error) {
    send(res, 500, { error: error.message });
  }
};
