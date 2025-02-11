require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// const serviceAccount = require("./firebase-admin.json");
// const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

const cron = require("node-cron");

const Reminder = require("./models/Reminder");

// Initialize Express App
const app = express();
// app.use(cors());
app.use(
  cors({
    origin: [
      "https://waterremainderappclient.vercel.app",
      "http://localhost:5173/",
      "*",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Import Routes
const reminderRoutes = require("./routes/reminderRoutes");
app.use("/api/reminders", reminderRoutes);

// admin.initializeApp({
//   credential: admin.credential.cert(require("./firebase-admin.json")),
// });
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, "\n"), // Ensure newlines are handled
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain,
  }),
});

// Function to send FCM notification
const sendNotification = async (reminder) => {
  const message = {
    notification: {
      title: "Time to drink water!",
      body: reminder.title,
    },
    token: reminder.fcmToken,
    android: {
      priority: "high",
      notification: {
        sound: "default",
        click_action: "https://waterremainderappclient.vercel.app", // Ensure it opens on Android
      },
    },
    webpush: {
      notification: {
        icon: "https://your-domain.com/icon.png",
        click_action: "https://waterremainderappclient.vercel.app",
      },
      fcmOptions: {
        link: "https://waterremainderappclient.vercel.app",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log("✅ Notification sent to", reminder.fcmToken);
  } catch (err) {
    console.error("❌ FCM Error:", err);
  }
};

// Run every minute to check for reminders
// cron.schedule("* * * * *", async () => {
//   const now = new Date();
//   const currentTime = now.toTimeString().slice(0, 5); // Extracts HH:MM format

//   console.log(`Checking reminders for time: ${currentTime}`); // Debugging log

//   const reminders = await Reminder.find({ time: currentTime });

//   reminders.forEach((reminder) => {
//     sendNotification(reminder);
//   });
// });

app.get("/run-cron", async (req, res) => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  console.log(`⏳ (Manual Cron) Checking reminders for time: ${currentTime}`);

  try {
    const reminders = await Reminder.find({ time: currentTime });

    if (reminders.length === 0) {
      console.log("⚠️ No reminders found for this time.");
    } else {
      reminders.forEach((reminder) => {
        console.log("🔔 Sending notification to:", reminder.fcmToken);
        sendNotification(reminder);
      });
    }

    res.json({ message: "Cron executed successfully." });
  } catch (error) {
    console.error("❌ Error in manual cron job:", error);
    res.status(500).json({ error: "Cron job failed." });
  }
});

cron.schedule("* * * * *", async () => {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const currentTime = now.split(", ")[1].slice(0, 5); // Extracts HH:MM format in IST

  console.log(`⏳ Checking reminders for time: ${currentTime}`);

  try {
    const reminders = await Reminder.find({ time: currentTime });

    if (reminders.length === 0) {
      console.log(" No reminders found for this time.");
    } else {
      reminders.forEach((reminder) => {
        console.log(" Sending notification to:", reminder.fcmToken);
        sendNotification(reminder);
      });
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

app.get("/", async (req, res) => {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  res.json({ message: "server running successfully", time: now });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
