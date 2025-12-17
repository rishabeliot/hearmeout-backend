const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// Starting ticket ID if there are no attendees yet
const STARTING_TICKET_ID = 30001;

const app = express();
const PORT = process.env.PORT || 5000;

// Razorpay webhook secret – you'll create this in Razorpay Dashboard later
const RAZORPAY_WEBHOOK_SECRET = "hmo_webhook_2025";


// ---------- Email (Nodemailer) ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  from: process.env.FROM_EMAIL
});

// Quick check (optional, we won't call this automatically)
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter error:", err.message);
  } else {
    console.log("📧 Email transporter ready");
  }
});


// Allow JSON + cross-origin requests (from your front-end)
app.use(cors());
app.use(express.json());

function buildConfirmationEmail({ name, ticketId, admits, price }) {
  // TODO: replace this with your final HTML template later
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Hear Me Out – Booking Confirmed 🎟️</h2>
      <p>Hey ${name || "there"}, you're in.</p>
      <p>Thanks for grabbing your ticket to <strong>Hear Me Out</strong>.</p>
      <p>
        <strong>Confirmation number:</strong> ${ticketId}<br/>
        <strong>Event Details: </strong><br/>
        📍 Location: <a href="https://maps.app.goo.gl/sJSA6HL7nvkaxY4CA"> Candles Brewhouse, 12th Floor, Azure, Hebbal </a>
        📅 Date: 31st December
        🕑 Time: 8pm onwards
      </p>
      <p>We can't wait to see you there.</p>
      <br>
      <p>The Hear Me Out Collective</p>
    </div>
  `;
}


// ---------- SQLite setup ----------
const isProd = process.env.NODE_ENV === "production";

const dbPath = isProd
  ? "/data/database.sqlite"
  : path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath);

console.log("📦 Using DB at:", dbPath);



// Create tables if they don't exist
db.serialize(() => {
  // Table 1: attendees (we'll use this later for the admin console)
  db.run(`
    CREATE TABLE IF NOT EXISTS attendees (
      ticket_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      admits TEXT NOT NULL
    )
  `);

  // Table: waitlist (stores people who sign up for waitlist)
db.run(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT,
    instagram TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);


  // Table 2: bookings (the actual data from users filling the form)
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      ticket_id TEXT PRIMARY KEY,
      name TEXT,
      dob TEXT,
      mobile TEXT,
      email TEXT,
      is_booked INTEGER DEFAULT 0,
      is_email_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ---------- Admin helpers ----------
function getNextTicketId(callback) {
  const sql = `
    SELECT ticket_id
    FROM attendees
    ORDER BY CAST(ticket_id AS INTEGER) DESC
    LIMIT 1
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error("Error getting latest ticket_id:", err);
      return callback(err);
    }

    if (!row || !row.ticket_id) {
      // No attendees yet – start from STARTING_TICKET_ID
      return callback(null, String(STARTING_TICKET_ID));
    }

    const lastIdNum = parseInt(row.ticket_id, 10);
    const nextIdNum = isNaN(lastIdNum) ? STARTING_TICKET_ID : lastIdNum + 1;
    callback(null, String(nextIdNum));
  });
}


// ---------- API routes ----------

// Simple "am I alive?" check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * Save or update basic info for a booking.
 * Called when Basic Info screen is completed.
 * Body: { ticketId, name, dob, mobile, email }
 */
app.post("/api/bookings/basic-info", (req, res) => {
  const { ticketId, name, dob, mobile, email } = req.body || {};

  if (!ticketId) {
    return res.status(400).json({ ok: false, error: "ticketId is required" });
  }

  const sql = `
    INSERT INTO bookings (ticket_id, name, dob, mobile, email, is_booked, is_email_sent)
    VALUES (?, ?, ?, ?, ?, 0, 0)
    ON CONFLICT(ticket_id) DO UPDATE SET
      name = excluded.name,
      dob = excluded.dob,
      mobile = excluded.mobile,
      email = excluded.email
  `;

  db.run(sql, [ticketId, name || "", dob || "", mobile || "", email || ""], function (err) {
    if (err) {
      console.error("Error saving basic info:", err);
      return res.status(500).json({ ok: false, error: "DB error" });
    }
    return res.json({ ok: true });
  });
});

// ---------- Admin: list attendees with booking/email status ----------
app.get("/api/admin/attendees", (req, res) => {
  const sql = `
    SELECT 
      a.ticket_id,
      a.name,
      a.price,
      a.admits,
      COALESCE(b.is_booked, 0) AS is_booked,
      COALESCE(b.is_email_sent, 0) AS is_email_sent
    FROM attendees a
    LEFT JOIN bookings b ON a.ticket_id = b.ticket_id
    ORDER BY CAST(a.ticket_id AS INTEGER)
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching attendees for admin:", err);
      return res.status(500).json({ ok: false, error: "DB error" });
    }

    res.json({
      ok: true,
      attendees: rows || [],
    });
  });
});

// TEMP: one-time DB import endpoint
app.post("/api/admin/import-attendees", express.json(), (req, res) => {
  const attendees = req.body;

  if (!Array.isArray(attendees)) {
    return res.status(400).json({ ok: false, error: "Invalid payload" });
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO attendees (ticket_id, name, price, admits)
    VALUES (?, ?, ?, ?)
  `);

  try {
    db.serialize(() => {
      attendees.forEach(a => {
        stmt.run(
          a.ticket_id,
          a.name,
          a.price,
          a.admits
        );
      });
    });

    stmt.finalize();
    res.json({ ok: true, count: attendees.length });
  } catch (err) {
    console.error("Import failed:", err);
    res.status(500).json({ ok: false });
  }
});


// ---------- Admin: summary ----------
app.get("/api/admin/summary", (req, res) => {
  const sqlTotalAttendees = `SELECT COUNT(*) AS total_attendees FROM attendees`;
  const sqlTotalPurchases = `SELECT COUNT(*) AS total_purchases FROM bookings WHERE is_booked = 1`;

  db.get(sqlTotalAttendees, [], (err1, row1) => {
    if (err1) {
      console.error("Error counting attendees:", err1);
      return res.status(500).json({ ok: false, error: "DB error" });
    }

    db.get(sqlTotalPurchases, [], (err2, row2) => {
      if (err2) {
        console.error("Error counting purchases:", err2);
        return res.status(500).json({ ok: false, error: "DB error" });
      }

      res.json({
        ok: true,
        totalAttendees: row1?.total_attendees || 0,
        totalPurchases: row2?.total_purchases || 0,
      });
    });
  });
});

// ---------- Public: fetch attendee by ticket ID ----------
app.get("/api/attendees/:ticketId", (req, res) => {
  const { ticketId } = req.params;

  const sql = `
    SELECT ticket_id, name, price, admits
    FROM attendees
    WHERE ticket_id = ?
    LIMIT 1
  `;

  db.get(sql, [ticketId], (err, row) => {
    if (err) {
      console.error("Error fetching attendee:", err);
      return res.status(500).json({ ok: false, error: "DB error" });
    }

    if (!row) {
      return res.status(404).json({ ok: false, error: "Invalid ticket ID" });
    }

    res.json({
      ok: true,
      attendee: row
    });
  });
});

function finalizeBooking(ticketId, paymentId, source = "unknown") {
  return new Promise((resolve, reject) => {
    const updateSql = `
      UPDATE bookings
      SET is_booked = 1
      WHERE ticket_id = ?
    `;

    db.run(updateSql, [ticketId], function (err) {
      if (err) {
        console.error("❌ Failed to mark booking as paid:", err);
        return reject(err);
      }

      console.log(
        `✅ Booking marked as paid (ticketId=${ticketId}, source=${source}, rows=${this.changes})`
      );

      resolve();
    });
  });
}


// ---------- Waitlist: submit entry ----------
app.post("/api/waitlist", (req, res) => {
  const { name, mobile, instagram } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }

  const insertSql = `
    INSERT INTO waitlist (name, mobile, instagram)
    VALUES (?, ?, ?)
  `;

  db.run(insertSql, [name.trim(), mobile || "", instagram || ""], function (err) {
    if (err) {
      console.error("Error inserting waitlist entry:", err);
      return res.status(500).json({ ok: false, error: "DB insert error" });
    }

    res.json({
      ok: true,
      entry: {
        id: this.lastID,
        name: name.trim(),
        mobile: mobile || "",
        instagram: instagram || "",
      },
    });
  });
});

// ---------- Admin: list waitlist ----------
app.get("/api/admin/waitlist", (req, res) => {
  const sql = `
    SELECT id, name, mobile, instagram, created_at
    FROM waitlist
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching waitlist for admin:", err);
      return res.status(500).json({ ok: false, error: "DB error" });
    }

    res.json({ ok: true, waitlist: rows || [] });
  });
});


// ---------- Admin: create attendee (auto ticket_id) ----------
app.post("/api/admin/attendees", (req, res) => {
  const { name, admits, price } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }

  // Default values if not provided
  const admitsValue = admits || "1";
  const priceValue = typeof price === "number" ? price : 0;

  getNextTicketId((err, nextTicketId) => {
    if (err) {
      return res.status(500).json({ ok: false, error: "Could not generate ticket ID" });
    }

    const insertSql = `
      INSERT INTO attendees (ticket_id, name, price, admits)
      VALUES (?, ?, ?, ?)
    `;

    db.run(insertSql, [nextTicketId, name.trim(), priceValue, admitsValue], function (insertErr) {
      if (insertErr) {
        console.error("Error inserting attendee:", insertErr);
        return res.status(500).json({ ok: false, error: "DB insert error" });
      }

      res.json({
        ok: true,
        attendee: {
          ticket_id: nextTicketId,
          name: name.trim(),
          price: priceValue,
          admits: admitsValue,
        },
      });
    });
  });
});


function markPaidAndSendEmail(ticketId, callback) {
  console.log("📌 Marking booked + sending email for ticketId:", ticketId);

  // 1) Mark as booked
  const markPaidSql = `UPDATE bookings SET is_booked = 1 WHERE ticket_id = ?`;

  db.run(markPaidSql, [ticketId], function (err) {
    if (err) {
      console.error("Error marking booking as paid:", err);
      return callback(err);
    }

    // 2) Fetch booking + attendee details
    const fetchSql = `
      SELECT 
        b.ticket_id,
        b.name AS booking_name,
        b.email AS booking_email,
        b.is_email_sent,
        a.name AS attendee_name,
        a.price,
        a.admits
      FROM bookings b
      LEFT JOIN attendees a ON b.ticket_id = a.ticket_id
      WHERE b.ticket_id = ?
      LIMIT 1
    `;

    db.get(fetchSql, [ticketId], (fetchErr, row) => {
      if (fetchErr) {
        console.error("Error fetching booking for email:", fetchErr);
        // Booking is marked as paid; just report error upwards
        return callback(fetchErr);
      }

      if (!row || !row.booking_email) {
        console.warn("No email found for ticketId:", ticketId, "row:", row);
        return callback(null, { emailSent: false });
      }

      // If email already sent earlier, don't send twice
      if (row.is_email_sent) {
        console.log("Email already sent for ticketId:", ticketId);
        return callback(null, { emailSent: true, alreadySent: true });
      }

      const nameToUse = row.booking_name || row.attendee_name || "";
      const html = buildConfirmationEmail({
        name: nameToUse,
        ticketId: row.ticket_id,
        admits: row.admits,
        price: row.price,
      });

      const mailOptions = {
        from: '"Hear Me Out" <your-email@gmail.com>', // keep in sync with your transporter
        to: row.booking_email,
        subject: "Your Hear Me Out Ticket Confirmation",
        html,
      };

      // 3) Send email
      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error("❌ Error sending confirmation email:", mailErr);
          // Don't treat as fatal for booking; they paid, we just couldn't email
          return callback(null, { emailSent: false });
        }

        console.log("📧 Confirmation email sent:", info.response);

        // 4) Mark is_email_sent = 1
        const emailFlagSql = `UPDATE bookings SET is_email_sent = 1 WHERE ticket_id = ?`;

        db.run(emailFlagSql, [ticketId], function (flagErr) {
          if (flagErr) {
            console.error("Error setting is_email_sent flag:", flagErr);
            return callback(null, { emailSent: false });
          }

          return callback(null, { emailSent: true });
        });
      });
    });
  });
}


/**
 * Mark a booking as paid.
 * Called after Razorpay success.
 * Body: { ticketId }
 */
app.post("/api/bookings/mark-booked", (req, res) => {
  const { ticketId } = req.body || {};

  if (!ticketId) {
    return res.status(400).json({ ok: false, error: "ticketId is required" });
  }

  markPaidAndSendEmail(ticketId, (err, result) => {
    if (err) {
      return res.status(500).json({ ok: false, error: "DB or email error" });
    }

    return res.json({
      ok: true,
      emailSent: !!(result && result.emailSent),
      alreadySent: !!(result && result.alreadySent),
    });
  });
});

app.use(
  "/api/razorpay/webhook",
  express.raw({ type: "application/json" })
);


// ---------- Razorpay Webhook ----------
app.post(
  "/api/razorpay/webhook",
  express.raw({ type: "application/json" }), // use raw body for signature verification
  (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const bodyBuffer = req.body;           // this is a Buffer
    const bodyString = bodyBuffer.toString("utf8");

    // 1) Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(bodyString)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ Invalid Razorpay webhook signature");
      return res.status(400).send("Invalid signature");
    }

    let payload;
    try {
      payload = JSON.parse(bodyString);
    } catch (e) {
      console.error("Error parsing webhook JSON:", e);
      return res.status(400).send("Invalid JSON");
    }

    const event = payload.event;
    const paymentEntity =
      payload.payload &&
      payload.payload.payment &&
      payload.payload.payment.entity;

    console.log("📨 Razorpay webhook event:", event);

    // We care about successful captured payments
    if (event === "payment.captured" && paymentEntity && paymentEntity.status === "captured") {
      const notes = paymentEntity.notes || {};
      const ticketIdFromNotes = notes.ticket_id || notes.ticketId;

      if (!ticketIdFromNotes) {
        console.warn("No ticket_id in payment notes, skipping webhook");
        return res.json({ ok: true, skipped: true });
      }

      // Use the same helper as the normal flow
      markPaidAndSendEmail(ticketIdFromNotes, (err, result) => {
        if (err) {
          console.error("Error in markPaidAndSendEmail from webhook:", err);
          // Razorpay expects 2xx; still respond 200 so they don't retry forever
          return res.json({ ok: false });
        }

        return res.json({
          ok: true,
          emailSent: !!(result && result.emailSent),
          alreadySent: !!(result && result.alreadySent),
        });
      });
    } else {
      // For now, ignore other events
      console.log("Ignoring webhook event:", event);
      return res.json({ ok: true, ignored: true });
    }
  }
);



// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
