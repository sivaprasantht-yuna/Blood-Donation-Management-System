import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load .env from root or local directory
const rootEnvPath = path.join(process.cwd(), "..", ".env");
const localEnvPath = path.join(process.cwd(), ".env");
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config({ path: localEnvPath });
}

const app = express();
const DEFAULT_PORT = 3000;
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);

app.use(express.json());

let dbConnected = false;
let dbError = null;

// Database connection middleware check
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && req.path !== "/api/live") {
    if (!dbConnected) {
      return res.status(500).json({
        error: `Database connection failed. Please ensure MySQL is running and the credentials in your .env file are correct. Details: ${dbError || "Connecting to database..."}`
      });
    }
  }
  next();
});

// MySQL connection details
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "3306", 10);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "lifedrop";
const dbSslEnabled = process.env.DB_SSL === "true";
const dbSslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false";

let pool;

const initDB = async () => {
  try {
  // Try to create the database if it doesn't exist
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      ssl: dbSslEnabled
        ? {
            minVersion: "TLSv1.2",
            rejectUnauthorized: dbSslRejectUnauthorized,
          }
        : undefined,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();
  } catch (err) {
    console.warn("Failed to automatically verify/create database schema. Assuming it exists or permissions restricted.", err.message);
  }

  // Connect to the database pool
  pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: dbSslEnabled
      ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: dbSslRejectUnauthorized,
        }
      : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Table DDL scripts
  const tables = [
    `CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      fullName VARCHAR(100) NOT NULL,
      age INT NOT NULL,
      gender VARCHAR(20) NOT NULL,
      bloodGroup VARCHAR(10) NOT NULL,
      phoneNumber VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      address TEXT NOT NULL,
      city VARCHAR(50) NOT NULL,
      state VARCHAR(50) NOT NULL,
      lastDonationDate DATE DEFAULT NULL,
      totalDonations INT DEFAULT 0,
      livesSaved INT DEFAULT 0,
      requestsAccepted INT DEFAULT 0,
      badges TEXT DEFAULT NULL,
      isAvailable BOOLEAN DEFAULT TRUE,
      createdAt DATETIME NOT NULL,
      passwordHash VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS hospitals (
      id VARCHAR(50) PRIMARY KEY,
      hospitalName VARCHAR(100) NOT NULL,
      licenseNumber VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(50) NOT NULL,
      isApproved BOOLEAN DEFAULT FALSE,
      bloodInventory TEXT DEFAULT NULL,
      createdAt DATETIME NOT NULL,
      passwordHash VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS bloodRequests (
      id VARCHAR(50) PRIMARY KEY,
      hospitalId VARCHAR(50) NOT NULL,
      hospitalName VARCHAR(100) NOT NULL,
      bloodGroup VARCHAR(10) NOT NULL,
      unitsRequired INT NOT NULL,
      unitsMatched INT DEFAULT 0,
      urgency VARCHAR(20) NOT NULL,
      patientReference VARCHAR(50) NOT NULL,
      notes TEXT,
      city VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL,
      createdAt DATETIME NOT NULL,
      acceptedByDonorId VARCHAR(50) DEFAULT NULL,
      acceptedByDonorName VARCHAR(100) DEFAULT NULL,
      acceptedByDonorPhone VARCHAR(20) DEFAULT NULL,
      acceptedByDonorEmail VARCHAR(100) DEFAULT NULL,
      acceptedByDonorAddress TEXT DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS donationHistory (
      id VARCHAR(50) PRIMARY KEY,
      donorId VARCHAR(50) NOT NULL,
      donorName VARCHAR(100) NOT NULL,
      hospitalId VARCHAR(50) NOT NULL,
      hospitalName VARCHAR(100) NOT NULL,
      bloodGroup VARCHAR(10) NOT NULL,
      units INT NOT NULL,
      date DATE NOT NULL,
      status VARCHAR(20) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) DEFAULT NULL,
      hospitalId VARCHAR(50) DEFAULT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      \`read\` BOOLEAN DEFAULT FALSE,
      requestId VARCHAR(50) DEFAULT NULL,
      createdAt DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS camps (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      location TEXT NOT NULL,
      city VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(100) NOT NULL,
      organizer VARCHAR(100) NOT NULL,
      contact VARCHAR(20) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS activityLogs (
      id VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      role VARCHAR(20) NOT NULL,
      action VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      timestamp DATETIME NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS emailLogs (
      id VARCHAR(50) PRIMARY KEY,
      \`to\` VARCHAR(100) NOT NULL,
      subject VARCHAR(150) NOT NULL,
      body TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      status VARCHAR(20) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS smsLogs (
      id VARCHAR(50) PRIMARY KEY,
      \`to\` VARCHAR(20) NOT NULL,
      body TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      status VARCHAR(20) NOT NULL,
      error TEXT DEFAULT NULL
    )`
  ];

  for (const query of tables) {
    await pool.query(query);
  }

  // Seed default data if tables are empty
  await seedDefaultData();
  dbConnected = true;
  console.log("Database initialized successfully and connected.");
  } catch (err) {
    dbConnected = false;
    dbError = err.message;
    console.error("====================================================");
    console.error("DATABASE CONNECTION ERROR: Failed to connect to MySQL.");
    console.error("Error Details:", err.message);
    console.error("Please ensure:");
    console.error("  1. MySQL Server is running on your machine.");
    console.error("  2. The credentials in your .env file match your MySQL setup.");
    console.error("====================================================");
  }
};

const seedDefaultData = async () => {
  const [admins] = await pool.query("SELECT COUNT(*) as count FROM admins");
  if (admins[0].count === 0) {
    await pool.query("INSERT INTO admins (id, username, email, passwordHash) VALUES (?, ?, ?, ?)", [
      "admin_1", "admin", "admin@lifedrop.org", "admin123"
    ]);
  }

  const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
  if (users[0].count === 0) {
    const defaultUsers = [
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
        badges: JSON.stringify(["First Donation", "Life Saver", "Hero Donor"]),
        isAvailable: true,
        createdAt: new Date("2025-01-20"),
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
        badges: JSON.stringify([]),
        isAvailable: true,
        createdAt: new Date("2026-03-10"),
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
        badges: JSON.stringify(["First Donation", "Life Saver", "Hero Donor"]),
        isAvailable: true,
        createdAt: new Date("2023-11-15"),
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
        badges: JSON.stringify(["First Donation"]),
        isAvailable: true,
        createdAt: new Date("2026-01-15"),
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
        badges: JSON.stringify(["First Donation"]),
        isAvailable: true,
        createdAt: new Date("2025-08-01"),
        passwordHash: "donor123",
      }
    ];

    for (const u of defaultUsers) {
      await pool.query(
        `INSERT INTO users (id, fullName, age, gender, bloodGroup, phoneNumber, email, address, city, state, lastDonationDate, totalDonations, livesSaved, requestsAccepted, badges, isAvailable, createdAt, passwordHash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id, u.fullName, u.age, u.gender, u.bloodGroup, u.phoneNumber, u.email, u.address, u.city, u.state, u.lastDonationDate, u.totalDonations, u.livesSaved, u.requestsAccepted, u.badges, u.isAvailable, u.createdAt, u.passwordHash
        ]
      );
    }
  }

  const [hospitals] = await pool.query("SELECT COUNT(*) as count FROM hospitals");
  if (hospitals[0].count === 0) {
    const defaultHospitals = [
      {
        id: "h_1",
        hospitalName: "City General Hospital",
        licenseNumber: "CGH-7781-TN",
        email: "citygeneral@hospital.com",
        phone: "0442345678",
        address: "500 Poonamallee High Road",
        city: "CHENNAI",
        isApproved: true,
        bloodInventory: JSON.stringify({
          "A+": 12, "A-": 4, "B+": 8, "B-": 2, "AB+": 6, "AB-": 1, "O+": 25, "O-": 3
        }),
        createdAt: new Date("2024-05-15"),
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
        bloodInventory: JSON.stringify({
          "A+": 5, "A-": 1, "B+": 15, "B-": 3, "AB+": 2, "AB-": 0, "O+": 18, "O-": 2
        }),
        createdAt: new Date("2025-02-10"),
        passwordHash: "hosp123",
      }
    ];

    for (const h of defaultHospitals) {
      await pool.query(
        `INSERT INTO hospitals (id, hospitalName, licenseNumber, email, phone, address, city, isApproved, bloodInventory, createdAt, passwordHash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          h.id, h.hospitalName, h.licenseNumber, h.email, h.phone, h.address, h.city, h.isApproved, h.bloodInventory, h.createdAt, h.passwordHash
        ]
      );
    }
  }

  const [bloodRequests] = await pool.query("SELECT COUNT(*) as count FROM bloodRequests");
  if (bloodRequests[0].count === 0) {
    await pool.query(
      `INSERT INTO bloodRequests (id, hospitalId, hospitalName, bloodGroup, unitsRequired, unitsMatched, urgency, patientReference, notes, city, status, createdAt, acceptedByDonorId, acceptedByDonorName, acceptedByDonorPhone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "r_1", "h_1", "City General Hospital", "O+", 5, 2, "Critical", "PAT-8812", "Emergency accident victim in ICU. Urgent transfusion needed.", "CHENNAI", "broadcasted", new Date("2026-06-09T06:30:00Z"), null, null, null
      ]
    );
  }

  const [donationHistory] = await pool.query("SELECT COUNT(*) as count FROM donationHistory");
  if (donationHistory[0].count === 0) {
    await pool.query(
      `INSERT INTO donationHistory (id, donorId, donorName, hospitalId, hospitalName, bloodGroup, units, date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "dh_1", "u_1", "Deepika Iyer", "h_1", "City General Hospital", "O+", 1, "2026-02-15", "completed"
      ]
    );
  }

  const [notifications] = await pool.query("SELECT COUNT(*) as count FROM notifications");
  if (notifications[0].count === 0) {
    await pool.query(
      `INSERT INTO notifications (id, userId, title, message, type, \`read\`, requestId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "n_1", "u_1", "Immediate Emergency Alert!", "City General Hospital in CHENNAI requires O+ blood. Your profile is a perfect match!", "emergency", false, "r_1", new Date("2026-06-09T06:30:00Z")
      ]
    );
  }

  const [camps] = await pool.query("SELECT COUNT(*) as count FROM camps");
  if (camps[0].count === 0) {
    await pool.query(
      `INSERT INTO camps (id, title, location, city, date, time, organizer, contact)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "c_1", "Mega Blood Donation Drive", "YMCA Ground, Nandanam", "CHENNAI", "2026-06-15", "09:00 AM - 04:00 PM", "City General Hospital & Rotary Club", "9840012345"
      ]
    );
  }
};

const logActivity = async (userId, role, action, description) => {
  const newLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    role,
    action,
    description,
    timestamp: new Date()
  };
  try {
    await pool.query(
      "INSERT INTO activityLogs (id, userId, role, action, description, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
      [newLog.id, newLog.userId, newLog.role, newLog.action, newLog.description, newLog.timestamp]
    );
    broadcastToAll("ACTIVITY_LOGGED", {
      ...newLog,
      timestamp: newLog.timestamp.toISOString()
    });
  } catch (err) {
    console.error("Failed to log activity to MySQL:", err.message);
  }
};

const sendSimulatedEmail = async (toEmail, subject, body) => {
  const newEmail = {
    id: `mail_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    to: toEmail,
    subject,
    body,
    timestamp: new Date(),
    status: "SENT"
  };
  try {
    await pool.query(
      "INSERT INTO emailLogs (id, `to`, subject, body, timestamp, status) VALUES (?, ?, ?, ?, ?, ?)",
      [newEmail.id, newEmail.to, newEmail.subject, newEmail.body, newEmail.timestamp, newEmail.status]
    );
    broadcastToAll("EMAIL_SENT", {
      ...newEmail,
      timestamp: newEmail.timestamp.toISOString()
    });
    console.log(`[SIMULATED MAIL] Sent to ${toEmail}: ${subject}`);
  } catch (err) {
    console.error("Failed to log email to MySQL:", err.message);
  }
};

const sendSimulatedSMS = async (toPhone, message) => {
  const cleanPhone = toPhone.replace(/[\s\-()]/g, "");
  const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  let status = "FAILED";
  let error = null;
  if (indianPhoneRegex.test(cleanPhone)) {
    status = "DELIVERED";
  } else {
    error = "No standard Indian mobile prefix matched.";
  }

  const newSms = {
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    to: toPhone,
    body: message,
    timestamp: new Date(),
    status,
    error
  };
  try {
    await pool.query(
      "INSERT INTO smsLogs (id, `to`, body, timestamp, status, error) VALUES (?, ?, ?, ?, ?, ?)",
      [newSms.id, newSms.to, newSms.body, newSms.timestamp, newSms.status, newSms.error]
    );
    broadcastToAll("SMS_SENT", {
      ...newSms,
      timestamp: newSms.timestamp.toISOString()
    });
    console.log(`[SIMULATED SMS] Sent to ${toPhone}: ${message} (${status})`);
  } catch (err) {
    console.error("Failed to log SMS to MySQL:", err.message);
  }
};

let sseClients = [];

const broadcastToAll = (type, data) => {
  const activeClients = [];
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify({ type, data })}\n\n`);
      activeClients.push(client);
    } catch (err) {
      console.warn(`[SSE Broadcast] Failed to write to client ${client.id}, removing.`, err);
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
      console.warn(`[SSE Heartbeat] Failed to ping client ${client.id}, removing.`, err);
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
      `data: ${JSON.stringify({ type: "CONNECTED", data: { status: "OK", totalClients: sseClients.length } })}\n\n`
    );
  } catch (err) {
    console.error(`[SSE Initial] Failed to write initial payload to client ${clientId}`, err);
  }

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

function getEligibility(lastDonationStr) {
  if (!lastDonationStr) return { eligible: true, waitDays: 0 };
  const lastDate = new Date(lastDonationStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays >= 90) {
    return { eligible: true, waitDays: 0 };
  } else {
    return { eligible: false, waitDays: 90 - diffDays };
  }
}

app.get("/api/stats", async (req, res) => {
  try {
    const [userRows] = await pool.query("SELECT SUM(livesSaved) as totalLivesSaved, COUNT(*) as count FROM users");
    const [hospitalRows] = await pool.query("SELECT COUNT(*) as count FROM hospitals WHERE isApproved = 1");
    const [requestRows] = await pool.query("SELECT COUNT(*) as count FROM bloodRequests");

    const usersSaved = Number(userRows[0].totalLivesSaved || 0) + 120;
    const stats = {
      registeredDonors: Number(userRows[0].count || 0) + 24995,
      livesSaved: usersSaved + 8380,
      partnerHospitals: Number(hospitalRows[0].count || 0) + 118,
      totalRequests: Number(requestRows[0].count || 0) + 420,
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/camps", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM camps ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/camps", async (req, res) => {
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
  try {
    await pool.query(
      "INSERT INTO camps (id, title, location, city, date, time, organizer, contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [newCamp.id, newCamp.title, newCamp.location, newCamp.city, newCamp.date, newCamp.time, newCamp.organizer, newCamp.contact]
    );
    broadcastToAll("CAMP_ADDED", newCamp);
    res.status(201).json(newCamp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Please supply email and password" });
  }

  try {
    const [adminRows] = await pool.query("SELECT * FROM admins WHERE LOWER(email) = ?", [email.toLowerCase()]);
    if (adminRows.length > 0 && password === adminRows[0].passwordHash) {
      const admin = adminRows[0];
      return res.json({
        token: `token_admin_${admin.id}`,
        userType: "admin",
        account: { id: admin.id, name: admin.username, email: admin.email },
      });
    }

    const [donorRows] = await pool.query("SELECT * FROM users WHERE LOWER(email) = ?", [email.toLowerCase()]);
    if (donorRows.length > 0) {
      const donor = donorRows[0];
      if (password === donor.passwordHash) {
        let badges = [];
        try {
          badges = JSON.parse(donor.badges || "[]");
        } catch {
          badges = donor.badges ? [donor.badges] : [];
        }
        return res.json({
          token: `token_donor_${donor.id}`,
          userType: "donor",
          account: {
            ...donor,
            badges,
            isAvailable: !!donor.isAvailable
          },
        });
      } else {
        return res.status(401).json({ error: "Incorrect password for Donor" });
      }
    }

    const [hospitalRows] = await pool.query("SELECT * FROM hospitals WHERE LOWER(email) = ?", [email.toLowerCase()]);
    if (hospitalRows.length > 0) {
      const hospital = hospitalRows[0];
      if (password === hospital.passwordHash) {
        if (!hospital.isApproved) {
          return res
            .status(403)
            .json({ error: "Hospital account pending administrator approval." });
        }
        let bloodInventory = {};
        try {
          bloodInventory = JSON.parse(hospital.bloodInventory || "{}");
        } catch {
          bloodInventory = {};
        }
        return res.json({
          token: `token_hospital_${hospital.id}`,
          userType: "hospital",
          account: {
            ...hospital,
            bloodInventory,
            isApproved: !!hospital.isApproved
          },
        });
      } else {
        return res.status(401).json({ error: "Incorrect password for Hospital" });
      }
    }

    return res.status(404).json({ error: "No account found with this email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register-donor", async (req, res) => {
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

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE LOWER(email) = ?", [email.toLowerCase()]);
    if (existing.length > 0) {
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
      badges: JSON.stringify([]),
      isAvailable: true,
      createdAt: new Date(),
      passwordHash: password,
    };

    await pool.query(
      `INSERT INTO users (id, fullName, age, gender, bloodGroup, phoneNumber, email, address, city, state, lastDonationDate, totalDonations, livesSaved, requestsAccepted, badges, isAvailable, createdAt, passwordHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDonor.id, newDonor.fullName, newDonor.age, newDonor.gender, newDonor.bloodGroup, newDonor.phoneNumber, newDonor.email, newDonor.address, newDonor.city, newDonor.state, newDonor.lastDonationDate, newDonor.totalDonations, newDonor.livesSaved, newDonor.requestsAccepted, newDonor.badges, newDonor.isAvailable, newDonor.createdAt, newDonor.passwordHash
      ]
    );

    await logActivity(
      newDonor.id,
      "donor",
      "REGISTERED",
      `${newDonor.fullName} registered as a new Compatible Donor (${newDonor.bloodGroup}) in ${newDonor.city}`
    );

    await sendSimulatedEmail(
      newDonor.email,
      "Welcome to LifeDrop Network!",
      `Dear ${newDonor.fullName},\n\nThank you for volunteering with LifeDrop. Your profile has been added to our network of active compatible donors in ${newDonor.city}. You will receive immediate alerts whenever there's an emergency blood request matching ${newDonor.bloodGroup} in your area!\n\nRegards,\nLifeDrop Team`
    );

    broadcastToAll("DONOR_REGISTERED", {
      fullName: newDonor.fullName,
      bloodGroup: newDonor.bloodGroup,
      city: newDonor.city,
    });

    res.status(201).json({
      token: `token_donor_${newDonor.id}`,
      userType: "donor",
      account: {
        ...newDonor,
        badges: []
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register-hospital", async (req, res) => {
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

  try {
    const [existing] = await pool.query("SELECT id FROM hospitals WHERE LOWER(email) = ?", [email.toLowerCase()]);
    if (existing.length > 0) {
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
      bloodInventory: JSON.stringify({
        "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
      }),
      createdAt: new Date(),
      passwordHash: password,
    };

    await pool.query(
      `INSERT INTO hospitals (id, hospitalName, licenseNumber, email, phone, address, city, isApproved, bloodInventory, createdAt, passwordHash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newHospital.id, newHospital.hospitalName, newHospital.licenseNumber, newHospital.email, newHospital.phone, newHospital.address, newHospital.city, newHospital.isApproved, newHospital.bloodInventory, newHospital.createdAt, newHospital.passwordHash
      ]
    );

    await logActivity(
      newHospital.id,
      "hospital",
      "REGISTERED",
      `${newHospital.hospitalName} submitted licensing registration request from ${newHospital.city}`
    );

    await sendSimulatedEmail(
      newHospital.email,
      "LifeDrop Registration Verification Required",
      `Dear ${newHospital.hospitalName} Staff,\n\nWe have successfully received your licensing registration request (License: ${newHospital.licenseNumber}). Our admin board will review details within 24 hours to approve full database and broadcast privileges.\n\nBest Regards,\nLifeDrop Verification Team`
    );

    broadcastToAll("HOSPITAL_REGISTERED", {
      hospitalName: newHospital.hospitalName,
      city: newHospital.city,
    });

    res.status(201).json({
      message: "Hospital account requested. Pending Admin approval.",
      hospital: {
        ...newHospital,
        bloodInventory: JSON.parse(newHospital.bloodInventory)
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/notifications", async (req, res) => {
  const { userId, hospitalId } = req.query;
  try {
    let query = "SELECT * FROM notifications";
    const params = [];
    if (userId) {
      query += " WHERE userId = ?";
      params.push(userId);
    } else if (hospitalId) {
      query += " WHERE hospitalId = ?";
      params.push(hospitalId);
    }
    query += " ORDER BY createdAt DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notifications/mark-read", async (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids) && ids.length > 0) {
    try {
      const placeholders = ids.map(() => "?").join(",");
      await pool.query(`UPDATE notifications SET \`read\` = 1 WHERE id IN (${placeholders})`, ids);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json({ success: true });
});

app.get("/api/donors/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Donor not found" });
    const donor = rows[0];
    const eligibility = getEligibility(donor.lastDonationDate);
    let badges = [];
    try {
      badges = JSON.parse(donor.badges || "[]");
    } catch {
      badges = donor.badges ? [donor.badges] : [];
    }
    res.json({
      ...donor,
      badges,
      isAvailable: !!donor.isAvailable,
      eligibility,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/donors/:id/history", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM donationHistory WHERE donorId = ?", [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/requests", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM bloodRequests ORDER BY createdAt DESC");
    res.json(rows.map(r => ({
      ...r,
      unitsRequired: Number(r.unitsRequired),
      unitsMatched: Number(r.unitsMatched),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/donors/:id", async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length === 0) return res.status(400).json({ error: "No fields supplied to update" });

    const updateBody = { ...req.body };
    if (updateBody.badges !== undefined) {
      updateBody.badges = JSON.stringify(updateBody.badges);
    }

    const setClauses = Object.keys(updateBody).map(k => `\`${k}\` = ?`).join(", ");
    const values = Object.values(updateBody);
    values.push(req.params.id);

    await pool.query(`UPDATE users SET ${setClauses} WHERE id = ?`, values);
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    const donor = rows[0];
    let badges = [];
    try {
      badges = JSON.parse(donor.badges || "[]");
    } catch {
      badges = donor.badges ? [donor.badges] : [];
    }
    res.json({
      ...donor,
      badges,
      isAvailable: !!donor.isAvailable
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/donors/:id/accept/:requestId", async (req, res) => {
  const donorId = req.params.id;
  const requestId = req.params.requestId;

  try {
    const [donorRows] = await pool.query("SELECT * FROM users WHERE id = ?", [donorId]);
    const [requestRows] = await pool.query("SELECT * FROM bloodRequests WHERE id = ?", [requestId]);
    if (donorRows.length === 0 || requestRows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    const donor = donorRows[0];
    const request = requestRows[0];

    const acceptedByDonorEmail = donor.email;
    const acceptedByDonorAddress = `${donor.address}, ${donor.city}, ${donor.state}`;

    await pool.query(
      `UPDATE bloodRequests 
       SET status = 'accepted', acceptedByDonorId = ?, acceptedByDonorName = ?, acceptedByDonorPhone = ?, acceptedByDonorEmail = ?, acceptedByDonorAddress = ? 
       WHERE id = ?`,
      [donor.id, donor.fullName, donor.phoneNumber, acceptedByDonorEmail, acceptedByDonorAddress, request.id]
    );

    const [updatedRows] = await pool.query("SELECT * FROM bloodRequests WHERE id = ?", [requestId]);
    const updatedRequest = updatedRows[0];

    broadcastToAll("REQUEST_ACCEPTED", updatedRequest);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/email-sms-logs", async (req, res) => {
  try {
    const [emailRows] = await pool.query("SELECT * FROM emailLogs ORDER BY timestamp DESC LIMIT 100");
    const [smsRows] = await pool.query("SELECT * FROM smsLogs ORDER BY timestamp DESC LIMIT 100");
    res.json({ emailLogs: emailRows, smsLogs: smsRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/auth/settings", async (req, res) => {
  const { id, userType, theme, emailEnabled, smsEnabled } = req.body;
  try {
    if (userType === "donor") {
      await pool.query(
        "UPDATE users SET theme = ?, emailEnabled = ?, smsEnabled = ? WHERE id = ?",
        [theme, !!emailEnabled, !!smsEnabled, id]
      );
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      if (rows.length > 0) {
        const donor = rows[0];
        let badges = [];
        try {
          badges = JSON.parse(donor.badges || "[]");
        } catch {
          badges = donor.badges ? [donor.badges] : [];
        }
        return res.json({
          account: {
            ...donor,
            badges,
            isAvailable: !!donor.isAvailable
          }
        });
      }
    } else if (userType === "hospital") {
      await pool.query(
        "UPDATE hospitals SET theme = ?, emailEnabled = ?, smsEnabled = ? WHERE id = ?",
        [theme, !!emailEnabled, !!smsEnabled, id]
      );
      const [rows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [id]);
      if (rows.length > 0) {
        const hospital = rows[0];
        let bloodInventory = {};
        try {
          bloodInventory = JSON.parse(hospital.bloodInventory || "{}");
        } catch {
          bloodInventory = {};
        }
        return res.json({
          account: {
            ...hospital,
            bloodInventory,
            isApproved: !!hospital.isApproved
          }
        });
      }
    }
    res.json({ account: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/notifications/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notifications ORDER BY createdAt DESC");
    res.json(rows.map(r => ({ ...r, read: !!r.read })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/hospitals/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Hospital not found" });
    const hospital = rows[0];
    let bloodInventory = {};
    try {
      bloodInventory = JSON.parse(hospital.bloodInventory || "{}");
    } catch {
      bloodInventory = {};
    }
    res.json({
      ...hospital,
      bloodInventory,
      isApproved: !!hospital.isApproved
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/hospitals/:id/inventory", async (req, res) => {
  try {
    const inventoryStr = JSON.stringify(req.body.inventory);
    await pool.query("UPDATE hospitals SET bloodInventory = ? WHERE id = ?", [inventoryStr, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Hospital not found" });
    const hospital = rows[0];

    await logActivity(req.params.id, "hospital", "INVENTORY_UPDATED", `Adjusted blood stock inventory`);
    
    let bloodInventory = {};
    try {
      bloodInventory = JSON.parse(hospital.bloodInventory || "{}");
    } catch {
      bloodInventory = {};
    }
    res.json({
      ...hospital,
      bloodInventory,
      isApproved: !!hospital.isApproved
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/hospitals/:id/requests", async (req, res) => {
  try {
    const [hospitalRows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
    if (hospitalRows.length === 0) return res.status(404).json({ error: "Hospital not found" });
    const hospital = hospitalRows[0];

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
      createdAt: new Date(),
      acceptedByDonorId: null,
      acceptedByDonorName: null,
      acceptedByDonorPhone: null,
      acceptedByDonorEmail: null,
      acceptedByDonorAddress: null
    };

    await pool.query(
      `INSERT INTO bloodRequests (id, hospitalId, hospitalName, bloodGroup, unitsRequired, unitsMatched, urgency, patientReference, notes, city, status, createdAt, acceptedByDonorId, acceptedByDonorName, acceptedByDonorPhone, acceptedByDonorEmail, acceptedByDonorAddress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newRequest.id, newRequest.hospitalId, newRequest.hospitalName, newRequest.bloodGroup, newRequest.unitsRequired, newRequest.unitsMatched, newRequest.urgency, newRequest.patientReference, newRequest.notes, newRequest.city, newRequest.status, newRequest.createdAt, newRequest.acceptedByDonorId, newRequest.acceptedByDonorName, newRequest.acceptedByDonorPhone, newRequest.acceptedByDonorEmail, newRequest.acceptedByDonorAddress
      ]
    );

    await logActivity(hospital.id, "hospital", "BROADCASTED", `${hospital.hospitalName} broadcasted emergency matching alert for ${bloodGroup}`);

    const [matchingDonors] = await pool.query(
      "SELECT * FROM users WHERE UPPER(city) = ? AND bloodGroup = ? AND isAvailable = 1",
      [hospital.city.toUpperCase(), bloodGroup]
    );

    for (const donor of matchingDonors) {
      const notId = `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newNot = {
        id: notId,
        userId: donor.id,
        title: "Immediate Emergency Alert!",
        message: `${hospital.hospitalName} in ${hospital.city} requires ${bloodGroup}. Your profile is a perfect match!`,
        type: "emergency",
        read: false,
        requestId: newRequest.id,
        createdAt: new Date(),
      };

      await pool.query(
        "INSERT INTO notifications (id, userId, title, message, type, `read`, requestId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [newNot.id, newNot.userId, newNot.title, newNot.message, newNot.type, newNot.read, newNot.requestId, newNot.createdAt]
      );

      if (donor.emailEnabled !== false) {
        await sendSimulatedEmail(
          donor.email,
          `Emergency ${bloodGroup} Alert: ${hospital.hospitalName}`,
          `Dear ${donor.fullName},\n\nWe detected a critical need for ${bloodGroup} at ${hospital.hospitalName} in your city. Please access your dashboard to accept.\n\nRegards,\nLifeDrop Team`
        );
      }
      if (donor.smsEnabled !== false) {
        await sendSimulatedSMS(
          donor.phoneNumber,
          `LifeDrop URGENT: Emergency alert for ${bloodGroup} at ${hospital.hospitalName}. Check dashboard.`
        );
      }
    }

    broadcastToAll("EMERGENCY_BROADCAST", {
      request: {
        ...newRequest,
        createdAt: newRequest.createdAt.toISOString()
      },
      targetedDonorIds: matchingDonors.map((d) => d.id),
    });

    res.status(201).json({
      ...newRequest,
      createdAt: newRequest.createdAt.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/hospitals/:id/requests/:requestId/complete", async (req, res) => {
  const { requestId, id: hospitalId } = req.params;

  try {
    const [requestRows] = await pool.query(
      "SELECT * FROM bloodRequests WHERE id = ? AND hospitalId = ?",
      [requestId, hospitalId]
    );
    if (requestRows.length === 0) return res.status(404).json({ error: "Broadcast request not found" });
    const request = requestRows[0];

    await pool.query("UPDATE bloodRequests SET status = 'completed' WHERE id = ?", [requestId]);

    if (request.acceptedByDonorId) {
      const [donorRows] = await pool.query("SELECT * FROM users WHERE id = ?", [request.acceptedByDonorId]);
      if (donorRows.length > 0) {
        const donor = donorRows[0];
        const newTotalDonations = (donor.totalDonations || 0) + 1;
        const newLivesSaved = (donor.livesSaved || 0) + 3;
        const newLastDonationDate = new Date().toISOString().split("T")[0];

        let badges = [];
        try {
          badges = JSON.parse(donor.badges || "[]");
        } catch {
          badges = donor.badges ? [donor.badges] : [];
        }

        if (newTotalDonations >= 1 && !badges.includes("First Donation")) {
          badges.push("First Donation");
        }
        if (newTotalDonations >= 3 && !badges.includes("Life Saver")) {
          badges.push("Life Saver");
        }
        if (newTotalDonations >= 5 && !badges.includes("Hero Donor")) {
          badges.push("Hero Donor");
        }

        await pool.query(
          "UPDATE users SET totalDonations = ?, livesSaved = ?, lastDonationDate = ?, badges = ? WHERE id = ?",
          [newTotalDonations, newLivesSaved, newLastDonationDate, JSON.stringify(badges), donor.id]
        );

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

        await pool.query(
          `INSERT INTO donationHistory (id, donorId, donorName, hospitalId, hospitalName, bloodGroup, units, date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dhRecord.id, dhRecord.donorId, dhRecord.donorName, dhRecord.hospitalId, dhRecord.hospitalName, dhRecord.bloodGroup, dhRecord.units, dhRecord.date, dhRecord.status
          ]
        );

        await logActivity(
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
          createdAt: new Date(),
        };

        await pool.query(
          "INSERT INTO notifications (id, userId, title, message, type, `read`, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [verifiedNotification.id, verifiedNotification.userId, verifiedNotification.title, verifiedNotification.message, verifiedNotification.type, verifiedNotification.read, verifiedNotification.createdAt]
        );

        await sendSimulatedEmail(
          donor.email,
          "LifeSaver Donation Certificate Ready!",
          `Dear ${donor.fullName},\n\nYour voluntary blood donation at ${request.hospitalName} has been officially completed and verified in our health database.\n\nYou can claim and download your LifeSaver Certificate on your LifeDrop profile dashboard.\n\nRegards,\nLifeDrop Team`
        );
      }
    }

    broadcastToAll("REQUEST_COMPLETED", request);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/activity-logs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activityLogs ORDER BY timestamp DESC LIMIT 100");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/overview", async (req, res) => {
  try {
    const [userRows] = await pool.query("SELECT SUM(livesSaved) as totalLivesSaved, COUNT(*) as count FROM users");
    const [hospitalRows] = await pool.query("SELECT COUNT(*) as count FROM hospitals");
    const [requestRows] = await pool.query("SELECT COUNT(*) as count FROM bloodRequests");
    const [completedRows] = await pool.query("SELECT COUNT(*) as count FROM bloodRequests WHERE status = 'completed'");

    const livesSaved = Number(userRows[0].totalLivesSaved || 0) + 120;
    res.json({
      totalDonors: Number(userRows[0].count || 0),
      totalHospitals: Number(hospitalRows[0].count || 0),
      totalRequests: Number(requestRows[0].count || 0),
      completedRequests: Number(completedRows[0].count || 0),
      livesSaved,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/hospitals", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM hospitals ORDER BY createdAt DESC");
    res.json(rows.map(h => ({
      ...h,
      bloodInventory: JSON.parse(h.bloodInventory || "{}"),
      isApproved: !!h.isApproved
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/donors", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY createdAt DESC");
    res.json(rows.map(donor => ({
      ...donor,
      badges: JSON.parse(donor.badges || "[]"),
      isAvailable: !!donor.isAvailable
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/hospitals/approve/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Hospital not found" });
    const hospital = rows[0];

    await pool.query("UPDATE hospitals SET isApproved = 1 WHERE id = ?", [req.params.id]);

    await logActivity(
      hospital.id,
      "admin",
      "APPROVED",
      `Verified license credentials for ${hospital.hospitalName}`
    );
    broadcastToAll("HOSPITAL_APPROVED", { id: hospital.id, name: hospital.hospitalName });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/donors/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Donor not found" });
    const donor = rows[0];

    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);

    await logActivity(req.params.id, "admin", "DELETED", `Removed donor passport profile ${donor.fullName}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/hospitals/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM hospitals WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Hospital not found" });
    const hospital = rows[0];

    await pool.query("DELETE FROM hospitals WHERE id = ?", [req.params.id]);

    await logActivity(req.params.id, "admin", "DELETED", `Removed hospital license profile ${hospital.hospitalName}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const frontendDistCandidates = [
  path.resolve(process.cwd(), "frontend", "dist"),
  path.resolve(process.cwd(), "..", "frontend", "dist"),
];

const frontendDistPath = frontendDistCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html"))
);

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  console.warn("Frontend build output not found. Non-API routes will not be served.");
}

// Start server immediately and initialize database in background
app.listen(PORT, async () => {
  console.log(`LifeDrop backend server running on port ${PORT}`);
  await initDB();
});
