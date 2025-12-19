const express = require("express");
const cors = require("cors");
const path = require("path");
// const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Pool } = require("pg");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 SERVER VERSION 2025-01-EMAIL-FIX");


// Razorpay webhook secret
const RAZORPAY_WEBHOOK_SECRET = "hmo_webhook_2025";

// ---------- Postgres (Neon) ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on("connect", () => {
  console.log("✅ Connected to Neon Postgres");
});

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Email (Nodemailer) ----------
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// transporter.verify((err) => {
//   if (err) {
//     console.error("❌ Email transporter error:", err.message);
//   } else {
//     console.log("📧 Email transporter ready");
//   }
// });




function buildConfirmationEmail({ name, ticketId }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Hear Me Out – Booking Confirmed 🎟️</h2>
      <p>Hey ${name || "there"}, you're in.</p>
      <p><strong>Confirmation number:</strong> ${ticketId}</p>
      <p>📍 Candles Brewhouse, Hebbal<br/>📅 31st December · 8pm onwards</p>
      <p>See you soon!</p>
      <p>The Hear Me Out Collective</p>
    </div>
  `;
}

// ---------- Health ----------
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- Save basic info ----------
app.post("/api/bookings/basic-info", async (req, res) => {
  const { ticketId, name, dob, mobile, email } = req.body || {};
  if (!ticketId) {
    return res.status(400).json({ ok: false, error: "ticketId is required" });
  }

  try {
    await pool.query(
      `
      INSERT INTO bookings (ticket_id, name, dob, mobile, email)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (ticket_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        dob = EXCLUDED.dob,
        mobile = EXCLUDED.mobile,
        email = EXCLUDED.email
      `,
      [ticketId, name || "", dob || null, mobile || "", email || ""]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error saving basic info:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Fetch attendee ----------
app.get("/api/attendees/:ticketId", async (req, res) => {
  const { ticketId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ticket_id, name, price, admits FROM attendees WHERE ticket_id = $1`,
      [ticketId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, error: "Invalid ticket ID" });
    }

    res.json({ ok: true, attendee: result.rows[0] });
  } catch (err) {
    console.error("Error fetching attendee:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Admin: attendees ----------
app.get("/api/admin/attendees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.ticket_id,
        a.name,
        a.price,
        a.admits,
        COALESCE(b.is_booked, FALSE) AS is_booked,
        COALESCE(b.is_email_sent, FALSE) AS is_email_sent
      FROM attendees a
      LEFT JOIN bookings b ON a.ticket_id = b.ticket_id
      ORDER BY a.ticket_id
    `);

    res.json({ ok: true, attendees: result.rows });
  } catch (err) {
    console.error("Admin attendees error:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Admin: summary ----------
app.get("/api/admin/summary", async (req, res) => {
  try {
    const totalAttendees = await pool.query(
      "SELECT COUNT(*) FROM attendees"
    );
    const totalPurchases = await pool.query(
      "SELECT COUNT(*) FROM bookings WHERE is_booked = TRUE"
    );

    res.json({
      ok: true,
      totalAttendees: Number(totalAttendees.rows[0].count),
      totalPurchases: Number(totalPurchases.rows[0].count)
    });
  } catch (err) {
    console.error("Admin summary error:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Waitlist ----------
app.post("/api/waitlist", async (req, res) => {
  const { name, mobile, instagram } = req.body || {};
  if (!name) {
    return res.status(400).json({ ok: false, error: "Name required" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO waitlist (name, phone, instagram)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name.trim(), mobile || "", instagram || ""]
    );

    res.json({ ok: true, entry: result.rows[0] });
  } catch (err) {
    console.error("Waitlist error:", err);
    res.status(500).json({ ok: false });
  }
});

app.get("/api/admin/waitlist", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM waitlist ORDER BY created_at DESC"
    );
    res.json({ ok: true, waitlist: result.rows });
  } catch (err) {
    console.error("Admin waitlist error:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Mark paid + email ----------
async function markPaidAndSendEmail(ticketId) {
  console.log("📧 markPaidAndSendEmail CALLED for", ticketId);

  // 1️⃣ Fetch attendee + booking data together
  const result = await pool.query(
    `
    SELECT 
      a.name,
      b.email,
      b.is_booked,
      b.is_email_sent
    FROM attendees a
    LEFT JOIN bookings b ON a.ticket_id = b.ticket_id
    WHERE a.ticket_id = $1
    `,
    [ticketId]
  );

  const row = result.rows[0];
  if (!row) {
    console.warn("⚠️ No attendee found for", ticketId);
    return;
  }

  // 2️⃣ Ensure booking row exists + mark booked
  // 2️⃣ Ensure booking row exists WITH REQUIRED FIELDS
await pool.query(
  `
  INSERT INTO bookings (
    ticket_id,
    name,
    email,
    mobile,
    is_booked
  )
  SELECT
    a.ticket_id,
    a.name,
    b.email,
    b.mobile,
    TRUE
  FROM attendees a
  LEFT JOIN bookings b ON a.ticket_id = b.ticket_id
  WHERE a.ticket_id = $1
  ON CONFLICT (ticket_id)
  DO UPDATE SET
    is_booked = TRUE
  `,
  [ticketId]
);


  // 3️⃣ Stop if email already sent
  if (row.is_email_sent) {
    console.log("📭 Email already sent for", ticketId);
    return;
  }

  // 4️⃣ Ensure email exists
  if (!row.email) {
    console.warn("⚠️ No email found for", ticketId);
    return;
  }

  // 5️⃣ Send email
  const html = buildConfirmationEmail({
    name: row.name || "there",
    ticketId
  });

  await resend.emails.send({
    from: "Hear Me Out <noreply@hearmeoutcollective.in>",
    to: row.email,
    subject: "Your Hear Me Out Ticket Confirmation",
    html
  });

  // 6️⃣ Mark email sent
  await pool.query(
    `UPDATE bookings SET is_email_sent = TRUE WHERE ticket_id = $1`,
    [ticketId]
  );

  console.log("✅ Booking confirmed + email sent for", ticketId);
}





app.post("/api/bookings/mark-booked", async (req, res) => {
  const { ticketId } = req.body || {};
  if (!ticketId) {
    return res.status(400).json({ ok: false });
  }

  try {
    await markPaidAndSendEmail(ticketId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Mark booked error:", err);
    res.status(500).json({ ok: false });
  }
});

// ---------- Razorpay webhook ----------
app.post(
  "/api/razorpay/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body.toString("utf8");

    const expected = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(body);
    const payment = payload?.payload?.payment?.entity;

    if (payload.event === "payment.captured" && payment?.notes?.ticket_id) {
      try {
        await markPaidAndSendEmail(payment.notes.ticket_id);
      } catch (e) {
        console.error("Webhook error:", e);
      }
    }

    res.json({ ok: true });
  }
);

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
