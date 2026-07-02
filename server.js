import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure directories exist
const dataDir = path.join(process.cwd(), "src", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "db.json");

// Pre-seeded database state
const defaultState = {
  users: [
    {
      id: "u_1",
      fullName: "Deepika Iyer",
      age: 31,
      gender: "Female",
      bloodGroup: "O+",
      phoneNumber: "9876543211",
      email: "deepika@donor.com",
      address: "12 Gandhi street, T Nagar",
      city: "CHENNAI",
      state: "Tamil Nadu",
      lastDonationDate: "2026-02-15", // eligible (>90 days from June 9, 2026)
      totalDonations: 4,
      livesSaved: 12,
      requestsAccepted: 2,
      badges: ["First Donation", "Life Saver", "Hero Donor"],
      isAvailable: true,
      createdAt: new Date("2025-01-20").toISOString(),
      passwordHash: "donor123", // keeping simple for live preview login
    },
    {
      id: "u_2",
      fullName: "Alex Johnson",
      age: 28,
      gender: "Male",
      bloodGroup: "B+",
      phoneNumber: "9876543210",
      email: "alex@donor.com",
      address: "45 Bandra West Link Road",
      city: "MUMBAI",
      state: "Maharashtra",
      lastDonationDate: null, // eligible (never donated)
      totalDonations: 0,
      livesSaved: 0,
      requestsAccepted: 0,
      badges: [],
      isAvailable: true,
      createdAt: new Date("2026-03-10").toISOString(),
      passwordHash: "donor123",
    },
    {
      id: "u_3",
      fullName: "Rajesh Patel",
      age: 45,
      gender: "Male",
      bloodGroup: "AB-",
      phoneNumber: "9876543212",
      email: "rajesh@donor.com",
      address: "89 Anna Salai, Alwarpet",
      city: "CHENNAI",
      state: "Tamil Nadu",
      lastDonationDate: "2026-05-20", // wait is less than 90 days
      totalDonations: 8,
      livesSaved: 24,
      requestsAccepted: 5,
      badges: ["First Donation", "Life Saver", "Hero Donor"],
      isAvailable: true,
      createdAt: new Date("2023-11-15").toISOString(),
      passwordHash: "donor123",
    },
    {
      id: "u_4",
      fullName: "Sarah Connor",
      age: 26,
      gender: "Female",
      bloodGroup: "O-",
      phoneNumber: "9876543213",
      email: "sarah@donor.com",
      address: "56 Electronic City Phase 1",
      city: "BANGALORE",
      state: "Karnataka",
      lastDonationDate: null,
      totalDonations: 1,
      livesSaved: 3,
      requestsAccepted: 1,
      badges: ["First Donation"],
      isAvailable: true,
      createdAt: new Date("2026-01-15").toISOString(),
      passwordHash: "donor123",
    },
    {
      id: "u_5",
      fullName: "Vijay Kumar",
      age: 34,
      gender: "Male",
      bloodGroup: "B+",
      phoneNumber: "9876543214",
      email: "vijay@donor.com",
      address: "102 Velachery Main Road",
      city: "CHENNAI",
      state: "Tamil Nadu",
      lastDonationDate: null,
      totalDonations: 2,
      livesSaved: 6,
      requestsAccepted: 1,
      badges: ["First Donation"],
      isAvailable: true,
      createdAt: new Date("2025-08-01").toISOString(),
      passwordHash: "donor123",
    },
  ],
  hospitals: [
    {
      id: "h_1",
      hospitalName: "City General Hospital",
      licenseNumber: "CGH-7781-TN",
      email: "citygeneral@hospital.com",
      phone: "0442345678",
      address: "500 Poonamallee High Road",
      city: "CHENNAI",
      isApproved: true,
      bloodInventory: {
        "A+": 12,
        "A-": 4,
        "B+": 8,
        "B-": 2,
        "AB+": 6,
        "AB-": 1,
        "O+": 25,
        "O-": 3,
      },
      createdAt: new Date("2024-05-15").toISOString(),
      passwordHash: "hosp123",
    },
    {
      id: "h_2",
      hospitalName: "Metro Health Care",
      licenseNumber: "MHC-9921-TN",
      email: "metro@hospital.com",
      phone: "0443456789",
      address: "15 Sardar Patel Road, Adyar",
      city: "CHENNAI",
      isApproved: true,
      bloodInventory: {
        "A+": 5,
        "A-": 1,
        "B+": 15,
        "B-": 3,
        "AB+": 2,
        "AB-": 0,
        "O+": 18,
        "O-": 2,
      },
      createdAt: new Date("2025-02-10").toISOString(),
      passwordHash: "hosp123",
    },
    {
      id: "h_3",
      hospitalName: "Apex Emergency Center",
      licenseNumber: "AEC-1029-MH",
      email: "apex@hospital.com",
      phone: "0228877665",
      address: "77 Linking Road, Santacruz West",
      city: "MUMBAI",
      isApproved: false, // Pending Admin Approval
      bloodInventory: {
        "A+": 8,
        "A-": 2,
        "B+": 4,
        "B-": 1,
        "AB+": 3,
        "AB-": 1,
        "O+": 10,
        "O-": 1,
      },
      createdAt: new Date("2026-05-01").toISOString(),
      passwordHash: "hosp123",
    },
  ],
  bloodRequests: [
    {
      id: "r_1",
      hospitalId: "h_1",
      hospitalName: "City General Hospital",
      bloodGroup: "O+",
      unitsRequired: 5,
      unitsMatched: 2,
      urgency: "Critical",
      patientReference: "PAT-8812",
      notes: "Emergency accident victim in ICU. Urgent transfusion needed.",
      city: "CHENNAI",
      status: "broadcasted",
      createdAt: new Date("2026-06-09T06:30:00Z").toISOString(),
      acceptedByDonorId: null,
      acceptedByDonorName: null,
      acceptedByDonorPhone: null,
    },
    {
      id: "r_2",
      hospitalId: "h_2",
      hospitalName: "Metro Health Care",
      bloodGroup: "B+",
      unitsRequired: 3,
      unitsMatched: 1,
      urgency: "Medium",
      patientReference: "PAT-9022",
      notes: "Scheduled surgery on Wednesday morning.",
      city: "CHENNAI",
      status: "completed",
      createdAt: new Date("2026-06-08T10:00:00Z").toISOString(),
      acceptedByDonorId: "u_5",
      acceptedByDonorName: "Vijay Kumar",
      acceptedByDonorPhone: "9876543214",
    },
  ],
  donationHistory: [
    {
      id: "dh_1",
      donorId: "u_1",
      donorName: "Deepika Iyer",
      hospitalId: "h_1",
      hospitalName: "City General Hospital",
      bloodGroup: "O+",
      units: 1,
      date: "2026-02-15",
      status: "completed",
    },
    {
      id: "dh_2",
      donorId: "u_5",
      donorName: "Vijay Kumar",
      hospitalId: "h_2",
      hospitalName: "Metro Health Care",
      bloodGroup: "B+",
      units: 1,
      date: "2026-06-08",
      status: "completed",
    },
  ],
  notifications: [
    {
      id: "n_1",
      userId: "u_1",
      title: "Immediate Emergency Alert!",
      message:
        "City General Hospital in CHENNAI requires O+ blood. Your profile is a perfect match!",
      type: "emergency",
      read: false,
      requestId: "r_1",
      createdAt: new Date("2026-06-09T06:30:00Z").toISOString(),
    },
  ],
  camps: [
    {
      id: "c_1",
      title: "Mega Blood Donation Drive",
      location: "YMCA Ground, Nandanam",
      city: "CHENNAI",
      date: "2026-06-15",
      time: "09:00 AM - 04:00 PM",
      organizer: "City General Hospital & Rotary Club",
      contact: "9840012345",
    },
    {
      id: "c_2",
      title: "World Blood Donor Day Festival",
      location: "Phoenix Marketcity Mall Main Atrium",
      city: "BANGALORE",
      date: "2026-06-14",
      time: "10:00 AM - 07:00 PM",
      organizer: "Bangalore Red Cross Society",
      contact: "8022131234",
    },
    {
      id: "c_3",
      title: "Emergency Corporate Donation Camp",
      location: "Nesco IT Park, Western Express Highway",
      city: "MUMBAI",
      date: "2026-06-25",
      time: "10:00 AM - 05:00 PM",
      organizer: "Kokilaben Hospital",
      contact: "2226262626",
    },
  ],
  admins: [
    {
      id: "admin_1",
      username: "admin",
      email: "admin@lifedrop.org",
      passwordHash: "admin123",
    },
  ],
};

// Database state in memory
let state = defaultState;

// Load state from file if exists
const loadState = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const parsed = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      // Merge with defaultState to ensure all tables exist
      state = { ...defaultState, ...parsed };
      // Merge with default admin to ensure login always works
      if (!state.admins || state.admins.length === 0) {
        state.admins = defaultState.admins;
      }
      if (!state.activityLogs) state.activityLogs = [];
      if (!state.emailLogs) state.emailLogs = [];
      if (!state.smsLogs) state.smsLogs = [];
    } else {
      // Ensure seed state has these tables
      if (!state.activityLogs) state.activityLogs = [];
      if (!state.emailLogs) state.emailLogs = [];
      if (!state.smsLogs) state.smsLogs = [];
      saveState();
    }
  } catch (err) {
    console.error("Error reading database file, using pre-seed.", err);
    state = defaultState;
  }
};

// Save state to file
const saveState = () => {
  try {
    // Ensure lists are defined in state when saving
    if (!state.activityLogs) state.activityLogs = [];
    if (!state.emailLogs) state.emailLogs = [];
    if (!state.smsLogs) state.smsLogs = [];
    fs.writeFileSync(dbPath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database state to file", err);
  }
};

loadState();

// Core Engines: Loggers and Notifications Simulators
const logActivity = (userId, role, action, description) => {
  if (!state.activityLogs) state.activityLogs = [];
  const newLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    role,
    action,
    description,
    timestamp: new Date().toISOString(),
  };
  state.activityLogs.unshift(newLog);
  saveState();
  broadcastToAll("ACTIVITY_LOGGED", newLog);
};

const sendSimulatedEmail = (toEmail, subject, body) => {
  if (!state.emailLogs) state.emailLogs = [];
  const newEmail = {
    id: `mail_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    to: toEmail,
    subject,
    body,
    timestamp: new Date().toISOString(),
    status: "SENT",
  };
  state.emailLogs.unshift(newEmail);
  saveState();
  broadcastToAll("EMAIL_SENT", newEmail);
  console.log(`[SIMULATED MAIL] Sent to ${toEmail}: ${subject}`);
};

const sendSimulatedSMS = (toPhone, message) => {
  if (!state.smsLogs) state.smsLogs = [];
  const cleanPhone = toPhone.replace(/[\s\-()]/g, "");
  const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  let status = "FAILED";
  let error = undefined;
  if (indianPhoneRegex.test(cleanPhone)) {
    status = "DELIVERED";
  } else {
    error = "No standard Indian mobile prefix matched.";
  }

  const newSms = {
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    to: toPhone,
    body: message,
    timestamp: new Date().toISOString(),
    status,
    error,
  };
  state.smsLogs.unshift(newSms);
  saveState();
  broadcastToAll("SMS_SENT", newSms);
  console.log(`[SIMULATED SMS] Sent to ${toPhone}: ${message} (${status})`);
};

// Express SSE connections
let sseClients = [];

// Helper to broadcast live logs / events
const broadcastToAll = (type, data) => {
  const activeClients = [];
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify({ type, data })}\n\n`);
      activeClients.push(client);
    } catch (err) {
      console.warn(
        `[SSE Broadcast] Failed to write to client ${client.id}, removing.`,
        err,
      );
    }
  });
  sseClients = activeClients;
};

// Periodic heartbeat to prevent connection timeouts and prune dead connections
setInterval(() => {
  const activeClients = [];
  sseClients.forEach((client) => {
    try {
      client.write(`: heartbeat\n\n`);
      activeClients.push(client);
    } catch (err) {
      console.warn(
        `[SSE Heartbeat] Failed to ping client ${client.id}, removing.`,
        err,
      );
    }
  });
  sseClients = activeClients;
}, 15000);

// SSE stream endpoint
app.get("/api/live", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    write: (msg) => res.write(msg),
  };
  sseClients.push(newClient);

  try {
    // Send initial connected statement
    res.write(
      `data: ${JSON.stringify({ type: "CONNECTED", data: { status: "OK", totalClients: sseClients.length } })}\n\n`,
    );
  } catch (err) {
    console.error(
      `[SSE Initial] Failed to write initial payload to client ${clientId}`,
      err,
    );
  }

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Calculate wait days
function getEligibility(lastDonationStr) {
  if (!lastDonationStr) return { eligible: true, waitDays: 0 };
  const lastDate = new Date(lastDonationStr);
  const now = new Date("2026-06-09T08:38:59Z"); // using fixed metadata time or current server time
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays >= 90) {
    return { eligible: true, waitDays: 0 };
  } else {
    return { eligible: false, waitDays: 90 - diffDays };
  }
}

// Global stats getter
const getGlobalStats = () => {
  const livesSaved =
    state.users.reduce((sum, u) => sum + u.livesSaved, 0) + 120; // adding preseed multiplier
  return {
    registeredDonors: state.users.length + 24995, // adding initial context metrics
    livesSaved: livesSaved + 8380,
    partnerHospitals: state.hospitals.filter((h) => h.isApproved).length + 118,
    totalRequests: state.bloodRequests.length + 420,
  };
};

/* ================== API ENDPOINTS ================== */

// Get stats
app.get("/api/stats", (req, res) => {
  res.json(getGlobalStats());
});

// Camps
app.get("/api/camps", (req, res) => {
  res.json(state.camps);
});

app.post("/api/camps", (req, res) => {
  const { title, location, city, date, time, organizer, contact } = req.body;
  if (!title || !location || !city || !date || !time || !organizer) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newCamp = {
    id: `c_${Date.now()}`,
    title,
    location,
    city: city.toUpperCase(),
    date,
    time,
    organizer,
    contact: contact || "",
  };
  state.camps.push(newCamp);
  saveState();
  broadcastToAll("CAMP_ADDED", newCamp);
  res.status(201).json(newCamp);
});

// Authentication
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please supply email and password" });
  }

  // Check Admin first
  const admin = state.admins.find(
    (a) => a.email.toLowerCase() === email.toLowerCase(),
  );
  if (admin && password === admin.passwordHash) {
    return res.json({
      token: `token_admin_${admin.id}`,
      userType: "admin",
      account: { id: admin.id, name: admin.username, email: admin.email },
    });
  }

  // Check Donor (user)
  const donor = state.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (donor) {
    if (password === donor.passwordHash) {
      return res.json({
        token: `token_donor_${donor.id}`,
        userType: "donor",
        account: donor,
      });
    } else {
      return res.status(401).json({ error: "Incorrect password for Donor" });
    }
  }

  // Check Hospital
  const hospital = state.hospitals.find(
    (h) => h.email.toLowerCase() === email.toLowerCase(),
  );
  if (hospital) {
    if (password === hospital.passwordHash) {
      if (!hospital.isApproved) {
        return res
          .status(403)
          .json({ error: "Hospital account pending administrator approval." });
      }
      return res.json({
        token: `token_hospital_${hospital.id}`,
        userType: "hospital",
        account: hospital,
      });
    } else {
      return res.status(401).json({ error: "Incorrect password for Hospital" });
    }
  }

  return res.status(404).json({ error: "No account found with this email" });
});

// Register Donor
app.post("/api/auth/register-donor", (req, res) => {
  const {
    fullName,
    age,
    gender,
    bloodGroup,
    phoneNumber,
    email,
    password,
    address,
    city,
    state: stateName,
    lastDonationDate,
  } = req.body;
  if (
    !fullName ||
    !age ||
    !gender ||
    !bloodGroup ||
    !phoneNumber ||
    !email ||
    !password ||
    !address ||
    !city ||
    !stateName
  ) {
    return res
      .status(400)
      .json({ error: "Please fill out all required fields" });
  }

  // Check duplicates
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res
      .status(409)
      .json({ error: "Email already registered as a donor" });
  }

  const newDonor = {
    id: `u_${Date.now()}`,
    fullName,
    age: Number(age),
    gender,
    bloodGroup,
    phoneNumber,
    email,
    address,
    city: city.toUpperCase(),
    state: stateName,
    lastDonationDate: lastDonationDate || null,
    totalDonations: 0,
    livesSaved: 0,
    requestsAccepted: 0,
    badges: [],
    isAvailable: true,
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };

  state.users.push(newDonor);
  saveState();
  // High fidelity logging and simulated email
  logActivity(
    newDonor.id,
    "donor",
    "REGISTERED",
    `${newDonor.fullName} registered as a new Compatible Donor (${newDonor.bloodGroup}) in ${newDonor.city}`,
  );
  sendSimulatedEmail(
    newDonor.email,
    "Welcome to LifeDrop Network!",
    `Dear ${newDonor.fullName},\n\nThank you for volunteering with LifeDrop. Your profile has been added to our network of active compatible donors in ${newDonor.city}. You will receive immediate alerts whenever there's an emergency blood request matching ${newDonor.bloodGroup} in your area!\n\nRegards,\nLifeDrop Team`,
  );

  broadcastToAll("DONOR_REGISTERED", {
    fullName: newDonor.fullName,
    bloodGroup: newDonor.bloodGroup,
    city: newDonor.city,
  });

  res.status(201).json({
    token: `token_donor_${newDonor.id}`,
    userType: "donor",
    account: newDonor,
  });
});

// Register Hospital
app.post("/api/auth/register-hospital", (req, res) => {
  const { hospitalName, licenseNumber, email, phone, address, city, password } =
    req.body;

  if (
    !hospitalName ||
    !licenseNumber ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !password
  ) {
    return res
      .status(400)
      .json({ error: "Please fill out all required fields" });
  }

  if (
    state.hospitals.some((h) => h.email.toLowerCase() === email.toLowerCase())
  ) {
    return res
      .status(409)
      .json({ error: "Email already registered as a hospital" });
  }

  const newHospital = {
    id: `h_${Date.now()}`,
    hospitalName,
    licenseNumber,
    email,
    phone,
    address,
    city: city.toUpperCase(),
    isApproved: false, // Needs admin approval!
    bloodInventory: {
      "A+": 0,
      "A-": 0,
      "B+": 0,
      "B-": 0,
      "AB+": 0,
      "AB-": 0,
      "O+": 0,
      "O-": 0,
    },
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };

  state.hospitals.push(newHospital);
  saveState();

  // High fidelity logging and simulated email
  logActivity(
    newHospital.id,
    "hospital",
    "REGISTERED",
    `${newHospital.hospitalName} submitted licensing registration request from ${newHospital.city}`,
  );
  sendSimulatedEmail(
    newHospital.email,
    "LifeDrop Registration Verification Required",
    `Dear ${newHospital.hospitalName} Staff,\n\nWe have successfully received your licensing registration request (License: ${newHospital.licenseNumber}). Our admin board will review details within 24 hours to approve full database and broadcast privileges.\n\nBest Regards,\nLifeDrop Verification Team`,
  );

  broadcastToAll("HOSPITAL_REGISTERED", {
    hospitalName: newHospital.hospitalName,
    city: newHospital.city,
  });

  res.status(201).json({
    message: "Hospital account requested. Pending Admin approval.",
    hospital: newHospital,
  });
});

// Notifications
app.get("/api/notifications", (req, res) => {
  const { userId, hospitalId } = req.query;
  let list = state.notifications;
  if (userId) {
    list = list.filter((n) => n.userId === userId);
  } else if (hospitalId) {
    list = list.filter((n) => n.hospitalId === hospitalId);
  }
  res.json(
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
});

app.put("/api/notifications/mark-read", (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids)) {
    state.notifications = state.notifications.map((n) => {
      if (ids.includes(n.id)) return { ...n, read: true };
      return n;
    });
    saveState();
  }
  res.json({ success: true });
});

// Donor Dashboard Endpoints
app.get("/api/donors/:id", (req, res) => {
  const donor = state.users.find((u) => u.id === req.params.id);
  if (!donor) return res.status(404).json({ error: "Donor not found" });
  const eligibility = getEligibility(donor.lastDonationDate);
  res.json({
    ...donor,
    eligibility,
  });
});

app.put("/api/donors/:id", (req, res) => {
  const donorIndex = state.users.findIndex((u) => u.id === req.params.id);
  if (donorIndex === -1)
    return res.status(404).json({ error: "Donor not found" });

  const current = state.users[donorIndex];
  const updated = {
    ...current,
    fullName: req.body.fullName || current.fullName,
    age: req.body.age ? Number(req.body.age) : current.age,
    gender: req.body.gender || current.gender,
    phoneNumber: req.body.phoneNumber || current.phoneNumber,
    email: req.body.email || current.email,
    address: req.body.address || current.address,
    city: req.body.city ? req.body.city.toUpperCase() : current.city,
    state: req.body.state || current.state,
    isAvailable:
      req.body.isAvailable !== undefined
        ? req.body.isAvailable
        : current.isAvailable,
  };

  state.users[donorIndex] = updated;
  saveState();
  res.json(updated);
});

// Donor History
app.get("/api/donors/:id/history", (req, res) => {
  const history = state.donationHistory.filter(
    (dh) => dh.donorId === req.params.id,
  );
  res.json(history);
});

// Accept Emergency Alert Action
app.post("/api/donors/:id/accept/:requestId", (req, res) => {
  const { id, requestId } = req.params;
  const donor = state.users.find((u) => u.id === id);
  if (!donor) return res.status(404).json({ error: "Donor not found" });

  const request = state.bloodRequests.find((r) => r.id === requestId);
  if (!request)
    return res.status(404).json({ error: "Emergency request not found" });

  if (request.status === "completed") {
    return res
      .status(400)
      .json({ error: "This request has already been completed" });
  }

  // Update request counts and flags
  request.unitsMatched += 1;
  request.status = "accepted";
  request.acceptedByDonorId = donor.id;
  request.acceptedByDonorName = donor.fullName;
  request.acceptedByDonorPhone = donor.phoneNumber;

  // Add donation history record
  const newDonation = {
    id: `dh_${Date.now()}`,
    donorId: donor.id,
    donorName: donor.fullName,
    hospitalId: request.hospitalId,
    hospitalName: request.hospitalName,
    bloodGroup: request.bloodGroup,
    units: 1,
    date: new Date().toISOString().split("T")[0],
    status: "completed",
  };
  state.donationHistory.push(newDonation);

  // Update donor profile stats
  donor.totalDonations += 1;
  donor.livesSaved += 3; // 1 unit saves 3 lives generally!
  donor.requestsAccepted += 1;
  donor.lastDonationDate = new Date().toISOString().split("T")[0];

  // Enforce achievements badges
  if (donor.totalDonations >= 1 && !donor.badges.includes("First Donation")) {
    donor.badges.push("First Donation");
  }
  if (donor.totalDonations >= 3 && !donor.badges.includes("Life Saver")) {
    donor.badges.push("Life Saver");
  }
  if (donor.totalDonations >= 5 && !donor.badges.includes("Hero Donor")) {
    donor.badges.push("Hero Donor");
  }

  // Create real-time notification for Hospital
  const notifyHospital = {
    id: `n_${Date.now()}_h`,
    hospitalId: request.hospitalId,
    title: "Donor Matched!",
    message: `${donor.fullName} (${donor.bloodGroup}) has accepted your urgent emergency broadcast request!`,
    type: "match",
    read: false,
    requestId: request.id,
    createdAt: new Date().toISOString(),
  };
  state.notifications.push(notifyHospital);

  // High fidelity email, SMS notifications and activity logs
  logActivity(
    donor.id,
    "donor",
    "REQUEST_ACCEPTED",
    `${donor.fullName} accepted emergency blood request (Ref: ${request.patientReference}) from ${request.hospitalName}`,
  );

  if (donor.emailEnabled !== false) {
    sendSimulatedEmail(
      donor.email,
      "Emergency Broadcast Accepted",
      `Dear ${donor.fullName},\n\nThank you for accepting the emergency blood donation request from ${request.hospitalName}.\n\nHospital: ${request.hospitalName}\nPatient Ref: ${request.patientReference}\nGroup: ${request.bloodGroup}\n\nPlease proceed to the hospital as soon as possible. Thank you for saving lives!\n\nRegards,\nLifeDrop Emergency Care`,
    );
  }

  const hospital = state.hospitals.find((h) => h.id === request.hospitalId);
  if (hospital) {
    if (hospital.emailEnabled !== false) {
      sendSimulatedEmail(
        hospital.email,
        `LifeDrop Emergency: Donor Matched!`,
        `Dear Team,\n\nA volunteer donor has accepted your urgent broadcast request!\n\nDonor Name: ${donor.fullName}\nBlood Group: ${donor.bloodGroup}\nContact Phone: ${donor.phoneNumber}\nPatient Ref: ${request.patientReference}\n\nPlease contact the donor immediately to confirm their arrival time.\n\nWarm Regards,\nLifeDrop Emergency Center`,
      );
    }
    if (hospital.smsEnabled !== false) {
      sendSimulatedSMS(
        hospital.phone,
        `LifeDrop Alert: Donor ${donor.fullName} (${donor.bloodGroup}) has accepted your request! Phone: ${donor.phoneNumber}. Please reach out immediately.`,
      );
    }
  }

  // Close connected matching notifications for donor
  state.notifications = state.notifications.map((n) => {
    if (n.userId === donor.id && n.requestId === requestId) {
      return { ...n, read: true };
    }
    return n;
  });

  saveState();

  // Send SSE real-time sync broadcast!
  broadcastToAll("REQUEST_ACCEPTED", {
    requestId: request.id,
    hospitalId: request.hospitalId,
    donorName: donor.fullName,
    bloodGroup: request.bloodGroup,
  });

  res.json({
    message:
      "Success! You have accepted the broadcast alert. Your detail has been shared with the hospital.",
    request,
    donor,
  });
});

// Hospital inventory
app.get("/api/hospitals/:id", (req, res) => {
  const hospital = state.hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });
  res.json(hospital);
});

app.put("/api/hospitals/:id/inventory", (req, res) => {
  const { inventory } = req.body;
  const hospIndex = state.hospitals.findIndex((h) => h.id === req.params.id);
  if (hospIndex === -1)
    return res.status(404).json({ error: "Hospital not found" });

  state.hospitals[hospIndex].bloodInventory = {
    ...state.hospitals[hospIndex].bloodInventory,
    ...inventory,
  };
  saveState();

  broadcastToAll("INVENTORY_UPDATED", {
    hospitalId: req.params.id,
    hospitalName: state.hospitals[hospIndex].hospitalName,
    inventory: state.hospitals[hospIndex].bloodInventory,
  });

  res.json(state.hospitals[hospIndex]);
});

// Hospital Create Broadcast Request (Triggers Auto-matching & Sends alerts!)
app.post("/api/hospitals/:id/requests", (req, res) => {
  const { bloodGroup, unitsRequired, urgency, patientReference, notes } =
    req.body;
  const hospital = state.hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });

  if (!bloodGroup || !unitsRequired || !urgency || !patientReference) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newRequest = {
    id: `r_${Date.now()}`,
    hospitalId: hospital.id,
    hospitalName: hospital.hospitalName,
    bloodGroup,
    unitsRequired: Number(unitsRequired),
    unitsMatched: 0,
    urgency,
    patientReference,
    notes: notes || "",
    city: hospital.city, // Request city binds to hospital location
    status: "broadcasted",
    createdAt: new Date().toISOString(),
    acceptedByDonorId: null,
    acceptedByDonorName: null,
    acceptedByDonorPhone: null,
  };

  state.bloodRequests.push(newRequest);

  // AUTOMATIC MATCHING ALGORITHM:
  // Find eligible, available donors in the same city and match their blood group!
  const targetCity = hospital.city.toUpperCase();
  const matchedDonors = state.users.filter((user) => {
    // Check city
    if (user.city.toUpperCase() !== targetCity) return false;
    // Check blood group compatibility (or exact match, direct required = user.bloodGroup)
    if (user.bloodGroup !== bloodGroup) return false;
    // Check availability
    if (!user.isAvailable) return false;
    // Check eligibility (limit of 90 days)
    const { eligible } = getEligibility(user.lastDonationDate);
    return eligible;
  });

  // Create custom notifications for each matched donor
  const alerts = [];
  matchedDonors.forEach((donor) => {
    const freshAlert = {
      id: `n_${Date.now()}_${donor.id}`,
      userId: donor.id,
      title: `URGENT: ${urgency} Blood Match!`,
      message: `${hospital.hospitalName} requires ${unitsRequired} units of ${bloodGroup} blood for Patient reference ${patientReference}. Contact: ${hospital.phone}.`,
      type: "emergency",
      read: false,
      requestId: newRequest.id,
      createdAt: new Date().toISOString(),
    };
    state.notifications.push(freshAlert);
    alerts.push(donor.id);

    // Send high-fidelity simulated matching communications
    if (donor.emailEnabled !== false) {
      sendSimulatedEmail(
        donor.email,
        `URGENT: LifeDrop Emergency ${bloodGroup} Alert`,
        `Dear ${donor.fullName},\n\nAn urgent blood requirement has been broadcasted by ${hospital.hospitalName} in ${donor.city}.\n\nThey require ${unitsRequired} units of ${bloodGroup} blood for Patient reference ${patientReference}.\n\nPlease log in to your LifeDrop donor panel to view and accept this request.\n\nRegards,\nLifeDrop India Emergency Network`,
      );
    }

    if (donor.smsEnabled !== false) {
      sendSimulatedSMS(
        donor.phoneNumber,
        `LifeDrop Alert: ${hospital.hospitalName} urgently requires ${bloodGroup} blood. Patient: ${patientReference}. Please accept from portal!`,
      );
    }
  });

  // Log Hospital Action
  logActivity(
    hospital.id,
    "hospital",
    "EMERGENCY_BROADCAST",
    `${hospital.hospitalName} broadcasted an urgent ${urgency} alert for ${unitsRequired} units of ${bloodGroup} (Ref: ${patientReference})`,
  );

  saveState();

  // Send SSE broadcast to let all active matching clients know
  broadcastToAll("EMERGENCY_BROADCAST", {
    request: newRequest,
    targetedDonorIds: alerts,
    matchCount: matchedDonors.length,
  });

  res.status(201).json({
    message: `Emergency request broadcasted. Found ${matchedDonors.length} matching donors nearby.`,
    request: newRequest,
    matchedDonorsCount: matchedDonors.length,
  });
});

// Update Request Status / Complete Request
app.put("/api/hospitals/:id/requests/:requestId/complete", (req, res) => {
  const { id, requestId } = req.params;
  const request = state.bloodRequests.find((r) => r.id === requestId);
  if (!request) return res.status(404).json({ error: "Request not found" });

  request.status = "completed";

  // Automatically increase inventory of that blood group for the hospital by the matched amount
  const hospital = state.hospitals.find((h) => h.id === id);
  if (hospital) {
    const completedUnits = request.unitsRequired;
    hospital.bloodInventory[request.bloodGroup] =
      (hospital.bloodInventory[request.bloodGroup] || 0) + completedUnits;
  }

  // Create real-time notification, Email, SMS, and Activity Logger
  logActivity(
    id,
    "hospital",
    "REQUEST_COMPLETED",
    `${hospital ? hospital.hospitalName : "Hospital"} finalized emergency broadcast for ${request.bloodGroup} (Ref: ${request.patientReference}). Inventory auto-updated.`,
  );

  if (request.acceptedByDonorId) {
    const donor = state.users.find((u) => u.id === request.acceptedByDonorId);
    if (donor) {
      const thankYouAlert = {
        id: `n_${Date.now()}_thanks`,
        userId: donor.id,
        title: "Donation Completed & Certified! 🏆",
        message: `Thank you for donating blood at ${hospital ? hospital.hospitalName : "Hospital"}. Your life-saving badge and electronic donation certificate is ready!`,
        type: "system",
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.push(thankYouAlert);

      if (donor.emailEnabled !== false) {
        sendSimulatedEmail(
          donor.email,
          "Thank you for saving lives! Official Donation Certificate",
          `Dear ${donor.fullName},\n\nOn behalf of the medical staff at ${hospital ? hospital.hospitalName : "Hospital"} and the LifeDrop Network, we express our profound gratitude for your blood donation.\n\nYour act of kindness helps save up to 3 lives! We have issued an electronic Donation Certificate to your account. You can download and print this certificate anytime through your donor portal.\n\nKeep shining!\n\nRegards,\nLifeDrop Clinical Board`,
        );
      }

      if (donor.smsEnabled !== false) {
        sendSimulatedSMS(
          donor.phoneNumber,
          `LifeDrop: Thank you for donating! Your official Certificate is now ready. Download it from your dashboard.`,
        );
      }
    }
  }

  saveState();
  broadcastToAll("REQUEST_COMPLETED", { requestId, hospitalId: id });
  res.json({
    message: "Request blood fulfilled, inventory successfully auto-updated.",
    request,
  });
});

// Admin management
app.get("/api/admin/overview", (req, res) => {
  const totalDonors = state.users.length;
  const totalHospitals = state.hospitals.length;
  const pendingHospitals = state.hospitals.filter((h) => !h.isApproved).length;
  const totalRequests = state.bloodRequests.length;
  const completedRequests = state.bloodRequests.filter(
    (r) => r.status === "completed",
  ).length;
  res.json({
    totalDonors,
    totalHospitals,
    pendingHospitals,
    totalRequests,
    completedRequests,
    livesSaved: state.users.reduce((sum, u) => sum + u.livesSaved, 0),
    globalStats: getGlobalStats(),
  });
});

app.get("/api/admin/hospitals", (req, res) => {
  res.json(state.hospitals);
});

app.get("/api/admin/donors", (req, res) => {
  res.json(state.users);
});

app.get("/api/admin/requests", (req, res) => {
  res.json(state.bloodRequests);
});

app.put("/api/admin/hospitals/approve/:id", (req, res) => {
  const hospIndex = state.hospitals.findIndex((h) => h.id === req.params.id);
  if (hospIndex === -1)
    return res.status(404).json({ error: "Hospital not found" });

  const hospital = state.hospitals[hospIndex];
  hospital.isApproved = true;
  saveState();

  // Create systemic notifications, email, and logs
  logActivity(
    "admin",
    "admin",
    "HOSPITAL_APPROVED",
    `Admin approved registration licensing for ${hospital.hospitalName}.`,
  );
  // Notify hospital
  const appNot = {
    id: `n_${Date.now()}_appr`,
    hospitalId: hospital.id,
    title: "Account Approved! 🏥",
    message:
      "Your hospital profile has been successfully verified. You have full emergency broadcast permission.",
    type: "system",
    read: false,
    createdAt: new Date().toISOString(),
  };
  state.notifications.push(appNot);

  if (hospital.emailEnabled !== false) {
    sendSimulatedEmail(
      hospital.email,
      "Welcome to LifeDrop Network - Account Approved!",
      `Dear ${hospital.hospitalName} Administrators,\n\nWe are pleased to inform you that your registration and license verification have been approved by the LifeDrop Administrative Board.\n\nYou now have immediate access to query the donor database, monitor real-time stock levels, and broadcast emergency blood requirements to local compatible pre-screened volunteer donors.\n\nBest Regards,\nLifeDrop India Operations`,
    );
  }

  // Notify via SSE
  broadcastToAll("HOSPITAL_APPROVED", {
    hospitalId: req.params.id,
    name: hospital.hospitalName,
  });

  res.json({
    message:
      "Hospital license verified and registration has been fully approved.",
    hospital,
  });
});

// Settings and Preferences update
app.put("/api/auth/settings", (req, res) => {
  const { id, userType, theme, emailEnabled, smsEnabled } = req.body;
  if (!id || !userType) {
    return res
      .status(400)
      .json({ error: "Missing required parameters (id, userType)" });
  }

  if (userType === "donor") {
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      state.users[idx] = {
        ...state.users[idx],
        theme: theme !== undefined ? theme : state.users[idx].theme || "light",
        emailEnabled:
          emailEnabled !== undefined
            ? emailEnabled
            : (state.users[idx].emailEnabled ?? true),
        smsEnabled:
          smsEnabled !== undefined
            ? smsEnabled
            : (state.users[idx].smsEnabled ?? true),
      };
      saveState();
      logActivity(
        id,
        "donor",
        "SETTINGS_UPDATED",
        `Updated account preferences (Email: ${emailEnabled}, SMS: ${smsEnabled}, Theme: ${theme})`,
      );
      return res.json({ success: true, account: state.users[idx] });
    }
  } else if (userType === "hospital") {
    const idx = state.hospitals.findIndex((h) => h.id === id);
    if (idx !== -1) {
      state.hospitals[idx] = {
        ...state.hospitals[idx],
        theme:
          theme !== undefined ? theme : state.hospitals[idx].theme || "light",
        emailEnabled:
          emailEnabled !== undefined
            ? emailEnabled
            : (state.hospitals[idx].emailEnabled ?? true),
        smsEnabled:
          smsEnabled !== undefined
            ? smsEnabled
            : (state.hospitals[idx].smsEnabled ?? true),
      };
      saveState();
      logActivity(
        id,
        "hospital",
        "SETTINGS_UPDATED",
        `Updated hospital settings (Email: ${emailEnabled}, SMS: ${smsEnabled}, Theme: ${theme})`,
      );
      return res.json({ success: true, account: state.hospitals[idx] });
    }
  }
  return res
    .status(404)
    .json({ error: "Account not found for preference update" });
});

// Logs fetch endpoints
app.get("/api/activity-logs", (req, res) => {
  const { userId, role } = req.query;
  let list = state.activityLogs || [];
  if (userId) {
    list = list.filter((l) => l.userId === userId);
  } else if (role) {
    list = list.filter((l) => l.role === role);
  }
  res.json(list);
});

app.get("/api/email-sms-logs", (req, res) => {
  res.json({
    emailLogs: state.emailLogs || [],
    smsLogs: state.smsLogs || [],
  });
});

app.delete("/api/admin/donors/:id", (req, res) => {
  const donor = state.users.find((u) => u.id === req.params.id);
  state.users = state.users.filter((u) => u.id !== req.params.id);
  saveState();
  logActivity(
    "admin",
    "admin",
    "DONOR_DELETED",
    `Admin deleted donor profile: ${donor ? donor.fullName : req.params.id}`,
  );
  res.json({ success: true, message: "Donor profile deleted." });
});

app.delete("/api/admin/hospitals/:id", (req, res) => {
  const hosp = state.hospitals.find((h) => h.id === req.params.id);
  state.hospitals = state.hospitals.filter((h) => h.id !== req.params.id);
  saveState();
  logActivity(
    "admin",
    "admin",
    "HOSPITAL_DELETED",
    `Admin deleted hospital profile: ${hosp ? hosp.hospitalName : req.params.id}`,
  );
  res.json({ success: true, message: "Hospital deleted." });
});

/* ================== API ENDS ================== */

// Serve React Web Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    // Handles catch-all for SPAs in development
    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexHtml = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8",
        );
        const html = await vite.transformIndexHtml(url, indexHtml);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LifeDrop Server] Online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
