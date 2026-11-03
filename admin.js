const checking = document.getElementById("checking");
const denied = document.getElementById("denied");
const panel = document.getElementById("adminPanel");
const reason = document.getElementById("deniedReason");

function showDenied(message) {
  checking.classList.add("hidden");
  panel.classList.add("hidden");
  denied.classList.remove("hidden");
  reason.textContent = message;
}

function showAdmin(userId) {
  checking.classList.add("hidden");
  denied.classList.add("hidden");
  panel.classList.remove("hidden");
  document.getElementById("adminId").textContent = userId;
}

async function checkAdmin() {
  const tg = window.Telegram?.WebApp;
  if (!tg?.initData) {
    showDenied("Admin sahifasini Telegram bot ichidagi Mini App orqali oching.");
    return;
  }
  tg.ready();
  tg.expand();

  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData })
    });
    const result = await response.json();
    if (!response.ok || result.role !== "admin") {
      throw new Error(result.error || "Admin ruxsati tasdiqlanmadi.");
    }
    showAdmin(result.user.id);
    loadAdminData(tg.initData);
  } catch (error) {
    showDenied(error.message || "Server tekshiruvida xatolik.");
  }
}

async function api(path, initData, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData,
      ...(options.headers || {})
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "API xatosi");
  return data;
}

async function loadAdminData(initData) {
  try {
    const [usersData, coursesData] = await Promise.all([
      api("/api/admin/users", initData),
      api("/api/admin/courses", initData)
    ]);
    const target = document.getElementById("adminPanel");
    let area = document.getElementById("backendData");
    if (!area) {
      area = document.createElement("section");
      area.id = "backendData";
      target.appendChild(area);
    }

    area.innerHTML = `
      <div class="section-title">O‘QUVCHILAR (${usersData.users.length})</div>
      <div class="backend-list">
        ${usersData.users.map(u => `
          <article class="backend-row">
            <div><strong>${escapeHtml([u.first_name,u.last_name].filter(Boolean).join(" ") || "Foydalanuvchi")}</strong>
            <small>ID: ${escapeHtml(u.telegram_id)} · ${escapeHtml(u.status)}</small></div>
            <div class="backend-actions">
              <button data-user="${escapeHtml(u.telegram_id)}" data-status="approved">Tasdiqlash</button>
              <button data-user="${escapeHtml(u.telegram_id)}" data-status="blocked">Bloklash</button>
            </div>
          </article>`).join("") || "<p>Hozircha o‘quvchi yo‘q.</p>"}
      </div>
      <div class="section-title">KURSLAR (${coursesData.courses.length})</div>
      <form id="courseForm" class="backend-form">
        <input name="title" placeholder="Kurs nomi" required maxlength="160">
        <select name="track"><option value="ai">Sun’iy intellekt (AI)</option><option value="it">IT</option></select>
        <input name="description" placeholder="Qisqa tavsif">
        <button type="submit">Kurs qo‘shish</button>
      </form>
      <div class="backend-list">
        ${coursesData.courses.map(c => `<article class="backend-row"><div><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.track.toUpperCase())} · ${escapeHtml(c.description || "")}</small></div><button data-course="${escapeHtml(c.id)}">O‘chirish</button></article>`).join("") || "<p>Hozircha kurs yo‘q.</p>"}
      </div>
      <p class="backend-note">Video fayllarni hozircha Supabase Storage ichidagi private academy-videos bucketiga yuklang. Darslar jadvaliga storage_path kiriting.</p>
    `;

    area.querySelectorAll("[data-user]").forEach(button => button.addEventListener("click", async () => {
      await api("/api/admin/users", initData, {
        method: "POST",
        body: JSON.stringify({ telegram_id: button.dataset.user, status: button.dataset.status })
      });
      loadAdminData(initData);
    }));

    area.querySelectorAll("[data-course]").forEach(button => button.addEventListener("click", async () => {
      await api("/api/admin/courses", initData, {
        method: "DELETE", body: JSON.stringify({ id: button.dataset.course })
      });
      loadAdminData(initData);
    }));

    document.getElementById("courseForm").addEventListener("submit", async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await api("/api/admin/courses", initData, {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"), track: form.get("track"), description: form.get("description")
        })
      });
      loadAdminData(initData);
    });
  } catch (error) {
    console.error(error);
    const note = document.createElement("p");
    note.className = "backend-note";
    note.textContent = "Backend ma’lumotlari yuklanmadi: " + error.message;
    document.getElementById("adminPanel").appendChild(note);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

checkAdmin();
