import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

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
      lastDonationDate: "2026-02-15",
      totalDonations: 4,
      livesSaved: 12,
      requestsAccepted: 2,
      badges: ["First Donation", "Life Saver", "Hero Donor"],
      isAvailable: true,
      createdAt: new Date("2025-01-20").toISOString(),
      passwordHash: "donor123",
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
      lastDonationDate: null,
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
      lastDonationDate: "2026-05-20",
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

let state = defaultState;

const loadState = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const parsed = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      state = { ...defaultState, ...parsed };
      if (!state.admins || state.admins.length === 0) {
        state.admins = defaultState.admins;
      }
      if (!state.activityLogs) state.activityLogs = [];
      if (!state.emailLogs) state.emailLogs = [];
      if (!state.smsLogs) state.smsLogs = [];
    } else {
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

const saveState = () => {
  try {
    if (!state.activityLogs) state.activityLogs = [];
    if (!state.emailLogs) state.emailLogs = [];
    if (!state.smsLogs) state.smsLogs = [];
    fs.writeFileSync(dbPath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database state to file", err);
  }
};

loadState();

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

let sseClients = [];

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

function getEligibility(lastDonationStr) {
  if (!lastDonationStr) return { eligible: true, waitDays: 0 };
  const lastDate = new Date(lastDonationStr);
  const now = new Date("2026-06-09T08:38:59Z");
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays >= 90) {
    return { eligible: true, waitDays: 0 };
  } else {
    return { eligible: false, waitDays: 90 - diffDays };
  }
}

const getGlobalStats = () => {
  const livesSaved =
    state.users.reduce((sum, u) => sum + u.livesSaved, 0) + 120;
  return {
    registeredDonors: state.users.length + 24995,
    livesSaved: livesSaved + 8380,
    partnerHospitals: state.hospitals.filter((h) => h.isApproved).length + 118,
    totalRequests: state.bloodRequests.length + 420,
  };
};

app.get("/api/stats", (req, res) => {
  res.json(getGlobalStats());
});

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

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please supply email and password" });
  }

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
    isApproved: false,
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

app.get("/api/donors/:id", (req, res) => {
  const donor = state.users.find((u) => u.id === req.params.id);
  if (!donor) return res.status(404).json({ error: "Donor not found" });
  const eligibility = getEligibility(donor.lastDonationDate);
  res.json({
    ...donor,
    eligibility,
  });
});

app.get("/api/donors/:id/history", (req, res) => {
  const history = state.donationHistory.filter((d) => d.donorId === req.params.id);
  res.json(history);
});

app.get("/api/admin/requests", (req, res) => {
  res.json(state.bloodRequests);
});

app.put("/api/donors/:id", (req, res) => {
  const donorIndex = state.users.findIndex((u) => u.id === req.params.id);
  if (donorIndex === -1) return res.status(404).json({ error: "Donor not found" });
  const updated = { ...state.users[donorIndex], ...req.body };
  state.users[donorIndex] = updated;
  saveState();
  res.json(updated);
});

app.post("/api/donors/:id/accept/:requestId", (req, res) => {
  const donorId = req.params.id;
  const requestId = req.params.requestId;
  const donor = state.users.find((u) => u.id === donorId);
  const request = state.bloodRequests.find((r) => r.id === requestId);
  if (!donor || !request) return res.status(404).json({ error: "Not found" });
  request.status = "accepted";
  request.acceptedByDonorId = donor.id;
  request.acceptedByDonorName = donor.fullName;
  request.acceptedByDonorPhone = donor.phoneNumber;
  saveState();
  broadcastToAll("REQUEST_ACCEPTED", request);
  res.json({ success: true });
});

app.get("/api/email-sms-logs", (req, res) => {
  res.json({ emailLogs: state.emailLogs || [], smsLogs: state.smsLogs || [] });
});

app.put("/api/auth/settings", (req, res) => {
  const { id, userType, theme, emailEnabled, smsEnabled } = req.body;
  let account = null;
  if (userType === "donor") {
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      state.users[idx] = { ...state.users[idx], theme, emailEnabled, smsEnabled };
      account = state.users[idx];
      saveState();
    }
  }
  res.json({ account });
});

app.get("/api/notifications/all", (req, res) => {
  res.json(state.notifications);
});

// Hospital details
app.get("/api/hospitals/:id", (req, res) => {
  const hospital = state.hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });
  res.json(hospital);
});

// Hospital stock update
app.put("/api/hospitals/:id/inventory", (req, res) => {
  const hospitalIndex = state.hospitals.findIndex((h) => h.id === req.params.id);
  if (hospitalIndex === -1) return res.status(404).json({ error: "Hospital not found" });
  state.hospitals[hospitalIndex].bloodInventory = req.body.inventory;
  saveState();
  logActivity(req.params.id, "hospital", "INVENTORY_UPDATED", `Adjusted blood stock inventory`);
  res.json(state.hospitals[hospitalIndex]);
});

// Create emergency blood request broadcast
app.post("/api/hospitals/:id/requests", (req, res) => {
  const hospital = state.hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });
  const { bloodGroup, unitsRequired, urgency, patientReference, notes } = req.body;
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
    city: hospital.city.toUpperCase(),
    status: "broadcasted",
    createdAt: new Date().toISOString(),
    acceptedByDonorId: null,
    acceptedByDonorName: null,
    acceptedByDonorPhone: null,
  };
  state.bloodRequests.push(newRequest);
  saveState();
  logActivity(hospital.id, "hospital", "BROADCASTED", `${hospital.hospitalName} broadcasted emergency matching alert for ${bloodGroup}`);

  // Find matching donors
  const matchingDonors = state.users.filter(
    (u) =>
      u.city.toUpperCase() === hospital.city.toUpperCase() &&
      u.bloodGroup === bloodGroup &&
      u.isAvailable
  );

  // Send notifications
  matchingDonors.forEach((donor) => {
    const notId = `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newNot = {
      id: notId,
      userId: donor.id,
      title: "Immediate Emergency Alert!",
      message: `${hospital.hospitalName} in ${hospital.city} requires ${bloodGroup}. Your profile is a perfect match!`,
      type: "emergency",
      read: false,
      requestId: newRequest.id,
      createdAt: new Date().toISOString(),
    };
    state.notifications.push(newNot);

    if (donor.emailEnabled !== false) {
      sendSimulatedEmail(
        donor.email,
        `Emergency ${bloodGroup} Alert: ${hospital.hospitalName}`,
        `Dear ${donor.fullName},\n\nWe detected a critical need for ${bloodGroup} at ${hospital.hospitalName} in your city. Please access your dashboard to accept.\n\nRegards,\nLifeDrop Team`
      );
    }
    if (donor.smsEnabled !== false) {
      sendSimulatedSMS(
        donor.phoneNumber,
        `LifeDrop URGENT: Emergency alert for ${bloodGroup} at ${hospital.hospitalName}. Check dashboard.`
      );
    }
  });
  saveState();

  broadcastToAll("EMERGENCY_BROADCAST", {
    request: newRequest,
    targetedDonorIds: matchingDonors.map((d) => d.id),
  });

  res.status(201).json(newRequest);
});

// Complete emergency broadcast
app.put("/api/hospitals/:id/requests/:requestId/complete", (req, res) => {
  const request = state.bloodRequests.find(
    (r) => r.id === req.params.requestId && r.hospitalId === req.params.id
  );
  if (!request) return res.status(404).json({ error: "Broadcast request not found" });

  request.status = "completed";
  saveState();

  if (request.acceptedByDonorId) {
    const donor = state.users.find((u) => u.id === request.acceptedByDonorId);
    if (donor) {
      donor.totalDonations = (donor.totalDonations || 0) + 1;
      donor.livesSaved = (donor.livesSaved || 0) + 3;
      donor.lastDonationDate = new Date().toISOString().split("T")[0];

      if (!donor.badges) donor.badges = [];
      if (donor.totalDonations >= 1 && !donor.badges.includes("First Donation")) {
        donor.badges.push("First Donation");
      }
      if (donor.totalDonations >= 3 && !donor.badges.includes("Life Saver")) {
        donor.badges.push("Life Saver");
      }
      if (donor.totalDonations >= 5 && !donor.badges.includes("Hero Donor")) {
        donor.badges.push("Hero Donor");
      }

      const dhRecord = {
        id: `dh_${Date.now()}`,
        donorId: donor.id,
        donorName: donor.fullName,
        hospitalId: request.hospitalId,
        hospitalName: request.hospitalName,
        bloodGroup: request.bloodGroup,
        units: request.unitsRequired || 1,
        date: new Date().toISOString().split("T")[0],
        status: "completed",
      };
      state.donationHistory.push(dhRecord);

      logActivity(
        donor.id,
        "donor",
        "DONATION_COMPLETED",
        `${donor.fullName} successfully transfused ${request.bloodGroup} at ${request.hospitalName}`
      );

      const verifiedNotification = {
        id: `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: donor.id,
        title: "Donation Verified & Certified!",
        message: `Thank you! Your donation at ${request.hospitalName} has been verified. You can now download your digital LifeSaver Certificate!`,
        type: "system",
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.push(verifiedNotification);

      sendSimulatedEmail(
        donor.email,
        "LifeSaver Donation Certificate Ready!",
        `Dear ${donor.fullName},\n\nYour voluntary blood donation at ${request.hospitalName} has been officially completed and verified in our health database.\n\nYou can claim and download your LifeSaver Certificate on your LifeDrop profile dashboard.\n\nRegards,\nLifeDrop Team`
      );
    }
  }
  saveState();
  broadcastToAll("REQUEST_COMPLETED", request);
  res.json({ success: true });
});

// System Activity Logs
app.get("/api/activity-logs", (req, res) => {
  res.json(state.activityLogs || []);
});

// Admin stats overview
app.get("/api/admin/overview", (req, res) => {
  const livesSaved = state.users.reduce((sum, u) => sum + u.livesSaved, 0) + 120;
  res.json({
    totalDonors: state.users.length,
    totalHospitals: state.hospitals.length,
    totalRequests: state.bloodRequests.length,
    completedRequests: state.bloodRequests.filter((r) => r.status === "completed").length,
    livesSaved,
  });
});

// Admin hospital directory list
app.get("/api/admin/hospitals", (req, res) => {
  res.json(state.hospitals);
});

// Admin donor directory list
app.get("/api/admin/donors", (req, res) => {
  res.json(state.users);
});

// Admin approve hospital
app.put("/api/admin/hospitals/approve/:id", (req, res) => {
  const hospital = state.hospitals.find((h) => h.id === req.params.id);
  if (!hospital) return res.status(404).json({ error: "Hospital not found" });
  hospital.isApproved = true;
  saveState();
  logActivity(
    hospital.id,
    "admin",
    "APPROVED",
    `Verified license credentials for ${hospital.hospitalName}`
  );
  broadcastToAll("HOSPITAL_APPROVED", { id: hospital.id, name: hospital.hospitalName });
  res.json({ success: true });
});

// Admin delete donor
app.delete("/api/admin/donors/:id", (req, res) => {
  const idx = state.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Donor not found" });
  const donor = state.users[idx];
  state.users.splice(idx, 1);
  saveState();
  logActivity(req.params.id, "admin", "DELETED", `Removed donor passport profile ${donor.fullName}`);
  res.json({ success: true });
});

// Admin delete hospital
app.delete("/api/admin/hospitals/:id", (req, res) => {
  const idx = state.hospitals.findIndex((h) => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Hospital not found" });
  const hospital = state.hospitals[idx];
  state.hospitals.splice(idx, 1);
  saveState();
  logActivity(req.params.id, "admin", "DELETED", `Removed hospital license profile ${hospital.hospitalName}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`LifeDrop backend server running on port ${PORT}`);
});