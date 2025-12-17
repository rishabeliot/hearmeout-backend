const urlParams = new URLSearchParams(window.location.search);
const ticketId = urlParams.get('id');
let attendee = null;

console.log("📦 ticketId =", ticketId);

async function fetchAttendee(ticketId) {
  try {
    const resp = await fetch(`${API_BASE}/api/attendees/${ticketId}`);
    if (!resp.ok) {
      throw new Error("Invalid ticket");
    }
    const data = await resp.json();
    if (!data.ok) {
      throw new Error("Invalid ticket");
    }
    return data.attendee;
  } catch (err) {
    console.error("Failed to fetch attendee:", err);
    alert("Invalid or expired ticket link.");
    throw err;
  }
}


// Backend API base URL (works for localhost and your phone on Wi-Fi)
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`;

// const attendee = {
//     "99999": { Name: "General admission", Price: 1500, Admits: "One admit", "Ticket ID": "99999"},
//     "31111": { Name: "HMO Test", Price: 1, Admits: "One admit", "Ticket ID": "31111"},
//     "30001": { Name: "Janani", Price: 1, Admits: "One admit", "Ticket ID": "30001"},
//     "30002": { Name: "Karan", Price: 1, Admits: "One admit", "Ticket ID": "30002"},
//     "30003": { Name: "Fida", Price: 1, Admits: "One admit", "Ticket ID": "30003"},
//     "30004": { Name: "Shidzu", Price: 1, Admits: "One admit", "Ticket ID": "30004"},
//     "30005": { Name: "Aman", Price: 1, Admits: "One admit", "Ticket ID": "30005"},
//     "30006": { Name: "Divyam", Price: 1, Admits: "One admit", "Ticket ID": "30006"},
//     "30007": { Name: "Rudraksh", Price: 1, Admits: "One admit", "Ticket ID": "30007"},
//     "30008": { Name: "Harish", Price: 1, Admits: "One admit", "Ticket ID": "30008"},
//     "30060": { Name: "Putta", Price: 1, Admits: "One admit", "Ticket ID": "30060"},
//     "30009": { Name: "Ira", Price: 1500, Admits: "One admit", "Ticket ID": "30009"},
//     "30010": { Name: "Merr", Price: 1500, Admits: "One admit", "Ticket ID": "30010"},
//     "30011": { Name: "Aaira", Price: 1500, Admits: "One admit", "Ticket ID": "30011"},
//     "30012": { Name: "Sasi", Price: 1500, Admits: "One admit", "Ticket ID": "30012"},
//     "30013": { Name: "Ayuj", Price: 1500, Admits: "One admit", "Ticket ID": "30013"},
//     "30014": { Name: "Rohi", Price: 1500, Admits: "One admit", "Ticket ID": "30014"},
//     "30015": { Name: "Big M", Price: 1500, Admits: "One admit", "Ticket ID": "30015"},
//     "30016": { Name: "Sid K", Price: 1500, Admits: "One admit", "Ticket ID": "30016"},
//     "30017": { Name: "Srini", Price: 1500, Admits: "One admit", "Ticket ID": "30017"},
//     "30018": { Name: "Vipin", Price: 1500, Admits: "One admit", "Ticket ID": "30018"},
//     "30019": { Name: "Shivander", Price: 1500, Admits: "One admit", "Ticket ID": "30019"},
//     "30020": { Name: "Abby", Price: 1500, Admits: "One admit", "Ticket ID": "30020"},
//     "30021": { Name: "Teeps", Price: 1500, Admits: "One admit", "Ticket ID": "30021"},
//     "30022": { Name: "Maans", Price: 1500, Admits: "One admit", "Ticket ID": "30022"},
//     "30023": { Name: "Chiggy", Price: 1500, Admits: "One admit", "Ticket ID": "30023"},
//     "30024": { Name: "Neel", Price: 1500, Admits: "One admit", "Ticket ID": "30024"},
//     "30025": { Name: "Babu", Price: 1500, Admits: "One admit", "Ticket ID": "30025"},
//     "30026": { Name: "Christina", Price: 1500, Admits: "One admit", "Ticket ID": "30026"},
//     "30027": { Name: "Vibhs", Price: 1500, Admits: "One admit", "Ticket ID": "30027"},
//     "30028": { Name: "Yo", Price: 1500, Admits: "One admit", "Ticket ID": "30028"},
//     "30029": { Name: "Zo", Price: 1500, Admits: "One admit", "Ticket ID": "30029"},
//     "30030": { Name: "Storm", Price: 1500, Admits: "One admit", "Ticket ID": "30030"},
//     "30031": { Name: "AK47", Price: 1500, Admits: "One admit", "Ticket ID": "30031"},
//     "30032": { Name: "Minnie", Price: 1500, Admits: "One admit", "Ticket ID": "30032"},
//     "30033": { Name: "Hugh", Price: 1500, Admits: "One admit", "Ticket ID": "30033"},
//     "30034": { Name: "Bunty", Price: 1, Admits: "One admit", "Ticket ID": "30034"},
//     "30035": { Name: "Kau", Price: 1500, Admits: "One admit", "Ticket ID": "30035"},
//     "30036": { Name: "Swathi", Price: 1500, Admits: "One admit", "Ticket ID": "30036"},
//     "30037": { Name: "Dhiren", Price: 1500, Admits: "One admit", "Ticket ID": "30037"},
//     "30038": { Name: "KAK", Price: 1500, Admits: "One admit", "Ticket ID": "30038"},
//     "30039": { Name: "Shivani", Price: 1500, Admits: "One admit", "Ticket ID": "30039"},
//     "30040": { Name: "Nan", Price: 1500, Admits: "One admit", "Ticket ID": "30040"},
//     "30041": { Name: "Kadi", Price: 1500, Admits: "One admit", "Ticket ID": "30041"},
//     "30042": { Name: "Lanwin", Price: 1500, Admits: "One admit", "Ticket ID": "30042"},
//     "30043": { Name: "Mayur", Price: 1500, Admits: "One admit", "Ticket ID": "30043"},
//     "30044": { Name: "Eshan", Price: 1500, Admits: "One admit", "Ticket ID": "30044"},
//     "30045": { Name: "Grooviyer", Price: 1500, Admits: "One admit", "Ticket ID": "30045"},
//     "30046": { Name: "Pattu", Price: 1500, Admits: "One admit", "Ticket ID": "30046"},
//     "30047": { Name: "Ahalya", Price: 1500, Admits: "One admit", "Ticket ID": "30047"},
//     "30048": { Name: "Dhruv", Price: 1500, Admits: "One admit", "Ticket ID": "30048"},
//     "30049": { Name: "Aadira", Price: 1500, Admits: "One admit", "Ticket ID": "30049"},
//     "30050": { Name: "Subbu", Price: 1, Admits: "One admit", "Ticket ID": "30050"},
//     "30051": { Name: "Ananya", Price: 1500, Admits: "One admit", "Ticket ID": "30051"},
//     "30052": { Name: "Davda", Price: 1500, Admits: "One admit", "Ticket ID": "30052"},
//     "30053": { Name: "DD", Price: 1500, Admits: "One admit", "Ticket ID": "30053"},
//     "30054": { Name: "Jak", Price: 1500, Admits: "One admit", "Ticket ID": "30054"},
//     "30055": { Name: "Saswat", Price: 1500, Admits: "One admit", "Ticket ID": "30055"},
//     "30056": { Name: "Anish", Price: 1500, Admits: "One admit", "Ticket ID": "30056"},
//     "30057": { Name: "Rishabh", Price: 1500, Admits: "One admit", "Ticket ID": "30057"},
//     "30058": { Name: "Akshata", Price: 1500, Admits: "One admit", "Ticket ID": "30058"},
//     "30059": { Name: "Sohil", Price: 1500, Admits: "One admit", "Ticket ID": "30059"},
//     // Tier 2
//     "30061": { Name: "Shynah", Price: 1500, Admits: "One admit", "Ticket ID": "30061"},
//     "30062": { Name: "Himanish", Price: 1500, Admits: "One admit", "Ticket ID": "30062"},
//     "30063": { Name: "Anish", Price: 1500, Admits: "One admit", "Ticket ID": "30063"},
//     "30064": { Name: "Bharath", Price: 1500, Admits: "One admit", "Ticket ID": "30064"},
//     "30065": { Name: "Daksh", Price: 1500, Admits: "One admit", "Ticket ID": "30065"},
//     "30066": { Name: "Pranav", Price: 1500, Admits: "One admit", "Ticket ID": "30066"},
//     "30067": { Name: "Poori", Price: 1500, Admits: "One admit", "Ticket ID": "30067"},
//     "30068": { Name: "Jagga", Price: 1500, Admits: "One admit", "Ticket ID": "30068"},
//     "30069": { Name: "Surabhi", Price: 1500, Admits: "One admit", "Ticket ID": "30069"},
//     "30070": { Name: "Bali", Price: 1500, Admits: "One admit", "Ticket ID": "30070"},
//     "30071": { Name: "Rae", Price: 1500, Admits: "One admit", "Ticket ID": "30071"},
//     "30072": { Name: "Kashish", Price: 1500, Admits: "One admit", "Ticket ID": "30072"},
//     "30073": { Name: "Uddit", Price: 1500, Admits: "One admit", "Ticket ID": "30073"},
//     "30074": { Name: "Sharanya", Price: 1500, Admits: "One admit", "Ticket ID": "30074"},
//     "30075": { Name: "Tanay", Price: 1500, Admits: "One admit", "Ticket ID": "30075"},
//     "30076": { Name: "Rahul", Price: 1500, Admits: "One admit", "Ticket ID": "30076"},
//     "30077": { Name: "Ninad", Price: 1500, Admits: "One admit", "Ticket ID": "30077"},
//     "30078": { Name: "Vir", Price: 1500, Admits: "One admit", "Ticket ID": "30078"},
//     "30079": { Name: "Trina", Price: 1500, Admits: "One admit", "Ticket ID": "30079"},
//     "30080": { Name: "Rudransh", Price: 1500, Admits: "One admit", "Ticket ID": "30080"},
//     "30081": { Name: "Shruthi", Price: 1500, Admits: "One admit", "Ticket ID": "30081"},
//     "30082": { Name: "Thrijay", Price: 1500, Admits: "One admit", "Ticket ID": "30082"},
//     "30083": { Name: "Aryan", Price: 1500, Admits: "One admit", "Ticket ID": "30083"},
//     "30084": { Name: "Pranav", Price: 1500, Admits: "One admit", "Ticket ID": "30084"},
//     "30085": { Name: "Vivek", Price: 1500, Admits: "One admit", "Ticket ID": "30085"},
//     "30086": { Name: "Suchet", Price: 1500, Admits: "One admit", "Ticket ID": "30086"},
//     "30087": { Name: "Arshia", Price: 1500, Admits: "One admit", "Ticket ID": "30087"},
//     "30088": { Name: "Roshan", Price: 1500, Admits: "One admit", "Ticket ID": "30088"},
//     "30089": { Name: "Sam", Price: 1500, Admits: "One admit", "Ticket ID": "30089"},
//     "30090": { Name: "Baldy", Price: 1500, Admits: "One admit", "Ticket ID": "30090"},
//     "30091": { Name: "Sakshi", Price: 1500, Admits: "One admit", "Ticket ID": "30091"},
//     "30092": { Name: "Devang", Price: 1500, Admits: "One admit", "Ticket ID": "30092"},
//     "30093": { Name: "Pravit", Price: 1500, Admits: "One admit", "Ticket ID": "30093"},
//     "30094": { Name: "Sohil", Price: 1500, Admits: "One admit", "Ticket ID": "30094"},
//     "30095": { Name: "Big Mac", Price: 1500, Admits: "One admit", "Ticket ID": "30095"},
//     "30096": { Name: "Amrita", Price: 1500, Admits: "One admit", "Ticket ID": "30096"},
//     "30097": { Name: "Varun", Price: 1500, Admits: "One admit", "Ticket ID": "30097"},
//     "30098": { Name: "Ashok", Price: 1500, Admits: "One admit", "Ticket ID": "30098"},
//     "30099": { Name: "Dakshaini", Price: 1500, Admits: "One admit", "Ticket ID": "30099"},
//     "30100": { Name: "Prithvi", Price: 1500, Admits: "One admit", "Ticket ID": "30100"},

//     // Tier 3
//     "30101": { Name: "Riya", Price: 1500, Admits: "One admit", "Ticket ID": "30101"},
//   "30102": { Name: "Ananditha", Price: 1500, Admits: "One admit", "Ticket ID": "30102"},
//   "30103": { Name: "Chef", Price: 1500, Admits: "One admit", "Ticket ID": "30103"},
//   "30104": { Name: "Kanch", Price: 1500, Admits: "One admit", "Ticket ID": "30104"},
//   "30105": { Name: "Allen", Price: 1500, Admits: "One admit", "Ticket ID": "30105"},
//   "30106": { Name: "Khushi", Price: 1500, Admits: "One admit", "Ticket ID": "30106"},
//   "30107": { Name: "Kabir", Price: 1500, Admits: "One admit", "Ticket ID": "30107"},
//   "30108": { Name: "Nada", Price: 1500, Admits: "One admit", "Ticket ID": "30108"},
//   "30109": { Name: "Varun", Price: 1500, Admits: "One admit", "Ticket ID": "30109"},
//   "30110": { Name: "Adhvika", Price: 1500, Admits: "One admit", "Ticket ID": "30110"},
//   "30111": { Name: "Suraj", Price: 1500, Admits: "One admit", "Ticket ID": "30111"},
//   "30112": { Name: "Amal", Price: 1500, Admits: "One admit", "Ticket ID": "30112"},
//   "30113": { Name: "Shwetha", Price: 1500, Admits: "One admit", "Ticket ID": "30113"},
//   "30114": { Name: "Sanjay", Price: 1500, Admits: "One admit", "Ticket ID": "30114"},
//   "30115": { Name: "Konda", Price: 1500, Admits: "One admit", "Ticket ID": "30115"},
//   "30116": { Name: "Ammaar", Price: 1500, Admits: "One admit", "Ticket ID": "30116"},
//   "30117": { Name: "Saahil", Price: 1500, Admits: "One admit", "Ticket ID": "30117"},
//   "30118": { Name: "Adi", Price: 1500, Admits: "One admit", "Ticket ID": "30118"},
//   "30119": { Name: "Vinnie", Price: 1500, Admits: "One admit", "Ticket ID": "30119"},
//   "30120": { Name: "Harsha", Price: 1500, Admits: "One admit", "Ticket ID": "30120"},

//   // Last additions
//   "30121": { Name: "Aditya", Price: 1500, Admits: "One admit", "Ticket ID": "30121"},
//   "30122": { Name: "Disha", Price: 1500, Admits: "One admit", "Ticket ID": "30122"},
//   "30123": { Name: "Raunak", Price: 1, Admits: "One admit", "Ticket ID": "30123"},
//   "30124": { Name: "Naga", Price: 1, Admits: "One admit", "Ticket ID": "30124"},

//   "30125": { Name: "Kunal", Price: 1500, Admits: "One admit", "Ticket ID": "30125"},
//   "30126": { Name: "Sushi", Price: 1500, Admits: "One admit", "Ticket ID": "30126"},
//   "30127": { Name: "Hari", Price: 1500, Admits: "One admit", "Ticket ID": "30127"},
//   "30128": { Name: "Maya", Price: 1500, Admits: "One admit", "Ticket ID": "30128"},
//   "30129": { Name: "Siddharth", Price: 1500, Admits: "One admit", "Ticket ID": "30129"},
//   "30130": { Name: "Kabir", Price: 1500, Admits: "One admit", "Ticket ID": "30130"},
  
// "30131": { Name: "Yaya", Price: 1500, Admits: "One admit", "Ticket ID": "30131"},
// "30132": { Name: "Sadar", Price: 1500, Admits: "One admit", "Ticket ID": "30132"},
// "30133": { Name: "Keshav", Price: 1500, Admits: "One admit", "Ticket ID": "30133"},
// "30134": { Name: "Bhavya", Price: 1500, Admits: "One admit", "Ticket ID": "30134"},
// "30135": { Name: "Kailash", Price: 1500, Admits: "One admit", "Ticket ID": "30135"},

// "30136": { Name: "Saakshi", Price: 1500, Admits: "One admit", "Ticket ID": "30136"},
// "30137": { Name: "Aayush", Price: 1500, Admits: "One admit", "Ticket ID": "30137"},
// "30138": { Name: "Kartik", Price: 1500, Admits: "One admit", "Ticket ID": "30138"},
// "30139": { Name: "Hari", Price: 1500, Admits: "One admit", "Ticket ID": "30139"}
// };

// ---------- State & timing ----------
let currentScreenStartTime = Date.now();
let currentScreenId = "loader";  // we start on loader

let formData = {
  ticketId: ticketId,
  name: "",
  mobile: "",
  dob: "",
  email: "",
  survey: [],
  suggestedVenue: "",
  screenTimes: {}
};


// ---------- DB helpers (SQLite via Node backend) ----------
async function saveBasicInfoToDB() {
  try {
    const body = {
      ticketId: formData.ticketId || ticketId,
      name: formData.name,
      dob: formData.dob,
      mobile: formData.mobile,
      email: formData.email,
    };

    console.log("📤 Sending basic info to DB:", body);

    const resp = await fetch(`${API_BASE}/api/bookings/basic-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("❌ DB basic-info error:", resp.status, text);
    } else {
      console.log("✅ Basic info stored in DB");
    }
  } catch (err) {
    console.error("❌ Network error while saving basic info:", err);
  }
}

async function markBookingAsPaidInDB() {
  try {
    const body = {
      ticketId: formData.ticketId || ticketId,
    };

    console.log("📤 Marking booking as paid in DB:", body);

    const resp = await fetch(`${API_BASE}/api/bookings/mark-booked`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("❌ DB mark-booked error:", resp.status, text);
    } else {
      console.log("✅ Booking marked as paid in DB");
    }
  } catch (err) {
    console.error("❌ Network error while marking booking as paid:", err);
  }
}

(async function initTicketFromDB() {
  try {
    attendee = await fetchAttendee(ticketId);

    // Welcome screen
    const welcomeTitleEl = document.getElementById("welcome-title");
    if (welcomeTitleEl) {
      welcomeTitleEl.textContent = `Hey ${attendee.name}`;
    }

    // Checkout price
    const priceEl = document.getElementById("checkout-ticket-price");
    if (priceEl && attendee.price != null) {
      priceEl.innerText = attendee.price;
    }

    // Hydrate base formData
    formData.name = attendee.name;

    console.log("✅ Attendee loaded from DB:", attendee);
  } catch (err) {
    alert("Invalid or expired ticket link.");
    console.error(err);
  }
})();


// ---------- Initial UI hydrate for ticket (welcome + checkout + confirmation) ----------
// (function initTicketUI() {
//   const data = attendee[ticketId];
//   if (!ticketId || !data) {
//     // we'll handle invalid ticket in the loader flow
//     console.warn("No valid ticket data for id:", ticketId);
//     return;
//   }

//   // Checkout price + admits
//   const priceEl = document.getElementById("checkout-ticket-price");
//   if (priceEl && data?.Price != null) {
//     priceEl.innerText = data.Price;
//   }


//   const welcomeTitleEl = document.getElementById("welcome-title");
//   const confSpan = document.getElementById("confirmation-id");

//   if (ticketId === "99999") {
//     // Special behaviour for 99999
//     if (welcomeTitleEl) {
//       welcomeTitleEl.innerText = "Looks like someone wants you to Hear Me Out";
//       welcomeTitleEl.style.fontSize = "40px";
//     }

//     if (confSpan) {
//       let wrapper = null;
//       if (typeof confSpan.closest === "function") {
//         wrapper = confSpan.closest("strong") || confSpan.closest("p");
//       } else if (confSpan.parentElement) {
//         wrapper = confSpan.parentElement.parentElement || confSpan.parentElement;
//       }
//       if (wrapper) wrapper.style.display = "none";
//       confSpan.innerText = `#${data["Ticket ID"]}`;
//     }
//   } else {
//     // Normal behaviour for all other ticket IDs
//     if (welcomeTitleEl) {
//       let attendee = null;

//         (async function initTicket() {
//           try {
//             attendee = await fetchAttendeeFromDB(ticketId);

//             document.getElementById("welcome-title").textContent =
//               `Hey ${attendee.name}`;

//             // Optional: if price is shown anywhere
//             if (document.getElementById("ticket-price")) {
//               document.getElementById("ticket-price").textContent =
//                 `₹${attendee.price}`;
//             }

//           } catch (err) {
//             alert("Invalid or expired ticket link");
//             console.error(err);
//           }
//         })();

//     }
//     if (confSpan) {
//       const wrapper = confSpan.closest
//         ? (confSpan.closest("strong") || confSpan.closest("p"))
//         : confSpan.parentElement;
//       if (wrapper) wrapper.style.display = "";
//       confSpan.innerText = `#${data["Ticket ID"]}`;
//     }
//   }
// })();

function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;

  toast.style.position = "fixed";
  toast.style.bottom = "40px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "rgba(0, 0, 0, 0.85)";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "20px";
  toast.style.fontFamily = "DM Sans, sans-serif";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}


// ---------- Screen navigation helper ----------
function goToScreen(screenName) {
  console.log("🔀 goToScreen called with:", screenName);
  
  const now = Date.now();
  const timeSpent = now - currentScreenStartTime;
  formData.screenTimes[currentScreenId] = timeSpent;

  currentScreenId = screenName;
  currentScreenStartTime = now;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(`screen-${screenName}`);
  if (target) {
    target.classList.add("active");
  } else {
    console.error("No screen element for:", screenName);
  }

  window.scrollTo(0, 0);
}

// ---------- Basic Info validation ----------
async function validateBasicInfo() {
  const name = document.getElementById("fullname").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("DOB").value.trim();

  if (!name) {
    alert("Please enter your full name.");
    return;
  }
  if (!/^\d{10}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  formData.name = name;
  formData.mobile = mobile;
  formData.dob = dob;
  formData.email = email;

  console.log("💾 Saved to formData (basic info):", formData);

  // 🔴 NEW: immediately save to DB
  await saveBasicInfoToDB();

  // Then go to checkout as before
  goToScreen("checkout");
}

const checkoutShareBtn = document.getElementById("checkout-share-btn");

if (checkoutShareBtn) {
  checkoutShareBtn.addEventListener("click", async () => {
    const shareUrl = "https://hearmeoutcollective.in/waitlist";

    // Modern clipboard API (HTTPS / localhost)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied");
        return;
      } catch (err) {
        console.warn("Clipboard API failed, falling back", err);
      }
    }

    // Fallback (works everywhere)
    const textarea = document.createElement("textarea");
    textarea.value = shareUrl;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      showToast("Link copied");
    } catch (err) {
      showToast("Unable to copy link");
    }

    document.body.removeChild(textarea);
  });
}




// ---------- Survey validation ----------
function validateSurvey() {
  const checkboxes = document.querySelectorAll(
    "#survey-dropdown input[type=checkbox]"
  );
  const selected = Array.from(checkboxes)
    .filter((c) => c.checked)
    .map((c) => c.value);

  if (selected.length === 0 || selected.length > 2) {
    alert("Please select 1 or 2 options.");
    return;
  }

  const venue = document.getElementById("suggested-venue").value.trim();

  formData.survey = selected;
  formData.suggestedVenue = venue || "";

  console.log("💾 Survey saved:", {
    survey: formData.survey,
    suggestedVenue: formData.suggestedVenue,
  });

  goToScreen("checkout");
}

// ---------- Razorpay payment flow ----------
function proceedToPayment() {
  
  // const data = attendee[ticketId];
  // if (!data) {
  //   alert("Invalid ticket");
  //   return;
  // }

  // const amountInPaise = data.Price * 100;

  if (!attendee) {
  alert("Ticket not loaded yet. Please refresh.");
  return;
}

const amountInPaise = attendee.price * 100;


  const options = {
    key: "rzp_live_6siEurfftpV6qb", // live
    // key: "rzp_test_aLEqKxrmlyNhE1", // test
    amount: amountInPaise,
    currency: "INR",
    name: "Hear Me Out",
    description: `Entry for ${attendee.Admits}`,
        handler: async function (response) {
      console.log("✅ Payment success:", response);

      const now = Date.now();
      const timeSpent = now - currentScreenStartTime;
      formData.screenTimes[currentScreenId] = timeSpent;

      console.log("📤 Calling sendFormDataToAirtable()");
      // You can keep this for now or remove later if you fully move to SQLite
      sendFormDataToAirtable();

      // 🔴 NEW: mark in DB as booked
      await markBookingAsPaidInDB();

      const redirectBase =
        window.location.hostname === "localhost"
          ? "http://localhost:5500"
          : "https://hearmeoutcollective.in";

      const redirectUrl = `${redirectBase}/?id=${ticketId}&paid=true`;

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    },

    prefill: {
      name: attendee.name,
      email: document.getElementById("email").value || "",
      contact: document.getElementById("mobile").value || "",
    },
    notes: {
      ticket_id: ticketId,
      admits: attendee.admits,
    },
    theme: {
      color: "#3f2d2dff",
    },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

// ---------- Airtable (unchanged, just wrapped safely) ----------
async function sendFormDataToAirtable() {
  try {
    const airtableToken =
      "patXBLKyXvVszo9cg.0033e7100da99c005896913b6e4b0dca3460479222cd0e3bbb26aa26ed75dc87";
    const baseId = "appDuKB6OBVlq1Kki";
    const tableName = "Vault";

    let surveyValue;
    if (Array.isArray(formData.survey)) {
      surveyValue = JSON.stringify(formData.survey);
    } else if (typeof formData.survey === "string") {
      surveyValue = formData.survey;
    } else {
      surveyValue = "";
    }

    const fields = {
      "Ticket ID": formData.ticketId || "",
      Name: formData.name || "",
      Mobile: formData.mobile || "",
      Email: formData.email || "",
      DOB: formData.dob || "",
      Survey: surveyValue,
      "Suggested Venue": formData.suggestedVenue || "",
      "Screen Times": JSON.stringify(formData.screenTimes || {}),
    };

    const recordData = { records: [{ fields }] };

    console.log("📤 Sending to Airtable:", recordData);

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName
    )}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(recordData),
    });

    const text = await resp.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }

    if (!resp.ok) {
      console.error(
        "❌ Airtable returned an error. Status:",
        resp.status,
        "Body:",
        text
      );
      alert("Airtable error: " + resp.status + " — check console for body");
      return { ok: false, status: resp.status, body: json || text };
    }

    console.log("✅ Airtable success response:", json || text);
    return { ok: true, status: resp.status, body: json || text };
  } catch (err) {
    console.error("❌ Network or unexpected error sending to Airtable:", err);
    return { ok: false, error: err && err.toString() };
  }
}

// ---------- Loader: 3 seconds, then route ----------
// ✅ Step 9: After full load, show loader for 3s, then route (with logs)
window.addEventListener("load", () => {
  console.log("🟢 window load fired");
  console.log("🔹 raw URL:", window.location.href);
  console.log("🔹 ticketId from URL params:", ticketId);

  setTimeout(() => {
    console.log("⏰ 3s timeout reached inside loader logic");

    const isPaid = urlParams.get("paid") === "true";
    console.log("💰 isPaid flag from URL:", isPaid);

    // const data = attendee[ticketId];
    // console.log("📇 attendee for ticketId:", data);
    console.log("📇 attendee loaded from DB:", attendee);

    // Invalid or missing ticket → show alert and stay on welcome
    if (!ticketId || !attendee) {
      alert("Invalid or missing ticket ID.");
      goToScreen("welcome");
      return;
    }

    formData.ticketId = ticketId;
    formData.name = attendee.name;

    console.log("💾 formData after loader:", formData);

    if (isPaid) {
      console.log("➡️ Routing to confirmation screen");
      goToScreen("confirmation");
    } else {
      console.log("➡️ Routing to welcome screen");
      goToScreen("welcome");
    }
  }, 3000); // 3-second loader
});

// Global error logger so we see if something blows up before this runs
window.addEventListener("error", (event) => {
  console.error("🌋 Global JS error:", event.error || event.message || event);
});

// Copy waitlist link button
(function setupWaitlistCopy() {
  const btn = document.getElementById('copy-waitlist-btn');
  if (!btn) return;

  const FRONTEND_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:5500/waitlist.html"
      : "https://hearmeoutcollective.in/waitlist.html";

  btn.addEventListener('click', async () => {
    const url = FRONTEND_BASE;
    try {
      await navigator.clipboard.writeText(url);
      // small feedback: temporarily change text
      const old = btn.textContent;
      btn.textContent = 'Link copied!';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1500);
    } catch (err) {
      // fallback prompt
      prompt('Copy this link:', url);
    }
  });
})();

// Checkout Terms link → open modal
const checkoutTermsLink = document.getElementById("checkout-terms-link");
if (checkoutTermsLink) {
  checkoutTermsLink.addEventListener("click", (e) => {
    e.preventDefault();
    const modal = document.getElementById("terms-modal");
    if (modal) modal.style.display = "block";
  });
}

// Checkout Pay button logic
const checkoutPayBtn = document.getElementById("checkout-pay-btn");
const checkoutTermsCheckbox = document.getElementById("checkout-terms-checkbox");

if (checkoutPayBtn) {
  checkoutPayBtn.addEventListener("click", () => {
    if (!checkoutTermsCheckbox || !checkoutTermsCheckbox.checked) {
      showToast("Please accept Terms & Conditions");
      return;
    }

    proceedToPayment(); // ✅ only called when checkbox is ticked
  });
}



document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("terms-modal");
  const openLink = document.getElementById("checkout-terms-link");
  const closeBtn = modal?.querySelector(".close-button");

  if (!modal || !openLink || !closeBtn) return;

  openLink.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});


// ---------- Custom dropdown (checkbox-based) ----------
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("survey-dropdown");
  if (!dropdown) return;

  const display = dropdown.querySelector(".dropdown-display");
  const options = dropdown.querySelector(".dropdown-options");
  const checkboxes = options.querySelectorAll("input[type=checkbox]");

  function toggleDropdown() {
    options.style.display = options.style.display === "block" ? "none" : "block";
  }

  display.addEventListener("click", toggleDropdown);
  display.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      toggleDropdown();
    },
    { passive: false }
  );

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      let selected = Array.from(checkboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);

      if (selected.length === 0) {
        display.textContent = "Pick up to 2";
      } else {
        display.textContent = `Your poisons: ${selected.join(", ")}`;
      }

      if (selected.length >= 2) {
        checkboxes.forEach((c) => {
          if (!c.checked) c.disabled = true;
        });
      } else {
        checkboxes.forEach((c) => (c.disabled = false));
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      options.style.display = "none";
    }
  });
});



  


  
  
  