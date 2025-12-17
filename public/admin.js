// Backend API base (same logic as your main script.js)
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://hearmeout-backend-45l1.onrender.com`;

// Frontend base to generate ticket URLs
const FRONTEND_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5500/index.html"
    : "https://hearmeout-backend-45l1.onrender.com/index.html";

let allAttendees = [];
let allWaitlist = [];          // store last fetched waitlist
let attendeesSort = { col: 'ticket_id', dir: 'asc' };

// ---------- Fetch summary ----------
async function loadSummary() {
  try {
    const resp = await fetch(`${API_BASE}/api/admin/summary`);
    if (!resp.ok) {
      console.error("Error loading summary:", resp.status);
      return;
    }
    const data = await resp.json();
    if (!data.ok) return;

    document.getElementById("summary-total-attendees").textContent =
      data.totalAttendees ?? 0;
    document.getElementById("summary-total-purchases").textContent =
      data.totalPurchases ?? 0;
  } catch (err) {
    console.error("Error loading summary:", err);
  }
}

// ---------- Fetch attendees ----------
async function loadAttendees() {
  try {
    const resp = await fetch(`${API_BASE}/api/admin/attendees`);
    if (!resp.ok) {
      console.error("Error loading attendees:", resp.status);
      return;
    }
    const data = await resp.json();
    if (!data.ok) return;

    allAttendees = data.attendees || [];
    renderAttendees(allAttendees);
  } catch (err) {
    console.error("Error loading attendees:", err);
  }
}

// ---------- Render attendees with search ----------
function renderAttendees() {
    // apply sorting to a copy of allAttendees
  const sortCol = attendeesSort.col;
  const sortDir = attendeesSort.dir;
  const listToRender = [...allAttendees].sort((x, y) => compareValues(x, y, sortCol, sortDir));

  
  
  const tbody = document.getElementById("admin-attendees-body");
  tbody.innerHTML = "";

  const searchValue = document
    .getElementById("admin-search")
    .value.toLowerCase()
    .trim();

  const filtered = allAttendees.filter((a) => {
    if (!searchValue) return true;
    const haystack = `${a.ticket_id} ${a.name}`.toLowerCase();
    return haystack.includes(searchValue);
  });

  filtered.forEach((att) => {
    const tr = document.createElement("tr");

    const url = `${FRONTEND_BASE}?id=${encodeURIComponent(att.ticket_id)}`;

    tr.innerHTML = `
      <td>${att.ticket_id}</td>
      <td>${att.name || ""}</td>
      <td>${att.admits || ""}</td>
      <td>${att.price != null ? "₹" + att.price : ""}</td>
      <td>
        <span class="status-pill ${
          att.is_booked ? "booked" : "not-booked"
        }">
          ${att.is_booked ? "Booked" : "Not booked"}
        </span>
      </td>
      <td>
        <span class="status-pill ${
          att.is_email_sent ? "sent" : "not-sent"
        }">
          ${att.is_email_sent ? "Sent" : "Not sent"}
        </span>
      </td>
      <td style="max-width: 180px; white-space: normal;">
        <a href="${url}" target="_blank" style="color:#93c5fd;">${url}</a>
      </td>
      <td>
        <button class="copy-btn" data-url="${url}">Copy</button>
      </td>
    `;

    tbody.appendChild(tr);
      // Wire copy buttons for the newly rendered rows
  tbody.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.getAttribute("data-url");
      try {
        await navigator.clipboard.writeText(url);
        btn.classList.add("copied");
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.textContent = "Copy";
        }, 1500);
      } catch (err) {
        console.error("Clipboard error:", err);
        // fallback for older browsers
        prompt("Copy this link:", url);
      }
    });
  });

  });
}

  // ---------- Fetch waitlist ----------
async function loadWaitlist() {
  try {
    const resp = await fetch(`${API_BASE}/api/admin/waitlist`);
    if (!resp.ok) {
      console.error("Error loading waitlist:", resp.status);
      return;
    }
    const data = await resp.json();
    if (!data.ok) return;

    renderWaitlist(data.waitlist || []);
  } catch (err) {
    console.error("Error loading waitlist:", err);
  }
}

function renderWaitlist(list) {
  const tbody = document.getElementById("admin-waitlist-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  list.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.mobile || ""}</td>
      <td>${row.instagram || ""}</td>
      <td>${row.created_at}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- generic sort helper ----------
function compareValues(a, b, key, dir = 'asc') {
  let va = a[key];
  let vb = b[key];

  // normalize booleans / ints / strings
  if (typeof va === 'string' && /^\d+$/.test(va)) va = Number(va);
  if (typeof vb === 'string' && /^\d+$/.test(vb)) vb = Number(vb);

  // treat undefined/null as ""
  if (va === undefined || va === null) va = "";
  if (vb === undefined || vb === null) vb = "";

  // numbers:
  if (typeof va === 'number' || typeof vb === 'number') {
    const na = Number(va) || 0;
    const nb = Number(vb) || 0;
    return dir === 'asc' ? na - nb : nb - na;
  }

  // booleans -> convert to number
  if (typeof va === 'boolean' || typeof vb === 'boolean') {
    const na = va ? 1 : 0;
    const nb = vb ? 1 : 0;
    return dir === 'asc' ? na - nb : nb - na;
  }

  // fallback: string compare (case-insensitive)
  const sa = String(va).toLowerCase();
  const sb = String(vb).toLowerCase();
  if (sa < sb) return dir === 'asc' ? -1 : 1;
  if (sa > sb) return dir === 'asc' ? 1 : -1;
  return 0;
}


  


// ---------- Add attendee ----------
async function addAttendee() {
  const nameInput = document.getElementById("admin-name");
  const admitsInput = document.getElementById("admin-admits");
  const priceInput = document.getElementById("admin-price");
  const btn = document.getElementById("admin-add-btn");
  const lastUrlEl = document.getElementById("admin-last-url");

  const name = nameInput.value.trim();
  const admits = admitsInput.value.trim();
  const priceRaw = priceInput.value.trim();

  if (!name) {
    alert("Please enter a name.");
    return;
  }

  const payload = {
    name,
  };

  if (admits) {
    payload.admits = admits;
  }
  if (priceRaw) {
    const priceNum = Number(priceRaw);
    if (!Number.isNaN(priceNum)) {
      payload.price = priceNum;
    }
  }

  btn.disabled = true;
  btn.textContent = "Adding...";

  try {
    const resp = await fetch(`${API_BASE}/api/admin/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Error adding attendee:", resp.status, text);
      alert("Error adding attendee. Check console.");
      return;
    }

    const data = await resp.json();
    if (!data.ok) {
      alert("Error adding attendee: " + (data.error || "Unknown error"));
      return;
    }

    const att = data.attendee;
    const url = `${FRONTEND_BASE}?id=${encodeURIComponent(att.ticket_id)}`;

    // Show last generated URL
    lastUrlEl.style.display = "block";
    lastUrlEl.textContent = `New attendee created. Ticket ID: ${att.ticket_id} – URL: ${url}`;

    // Clear inputs
    nameInput.value = "";
    admitsInput.value = "";
    priceInput.value = "";

    // Refresh data
    await loadSummary();
    await loadAttendees();
  } catch (err) {
    console.error("Error adding attendee:", err);
    alert("Error adding attendee. Check console.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Add attendee";
  }
}

// ---------- Init ----------
window.addEventListener("DOMContentLoaded", () => {
  loadSummary();
  loadAttendees();
  loadWaitlist();

  document
    .getElementById("admin-search")
    .addEventListener("input", () => renderAttendees());

  document
    .getElementById("admin-refresh-btn")
    .addEventListener("click", () => {
      loadSummary();
      loadAttendees();
    });

  document
    .getElementById("admin-add-btn")
    .addEventListener("click", addAttendee);
});
