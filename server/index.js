require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// const serviceAccount = require("./firebase-admin.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

const cron = require("node-cron");

const Reminder = require("./models/Reminder");

// Initialize Express App
const app = express();
app.use(cors());
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
  credential: admin.credential.cert(serviceAccount),
});

//to send notifications manually
app.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ error: "FCM token is required" });
  }

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
  };

  try {
    await admin.messaging().send(message);
    res.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Function to send FCM notification
const sendNotification = async (reminder) => {
  const message = {
    notification: {
      title: "Time to drink water!",
      body: reminder.title,
    },
    token: reminder.fcmToken,
  };

  admin
    .messaging()
    .send(message)
    .then(() => console.log("Notification sent to", reminder.fcmToken))
    .catch((err) => console.error("FCM Error:", err));
};

// Run every minute to check for reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Extracts HH:MM format

  console.log(`Checking reminders for time: ${currentTime}`); // Debugging log

  const reminders = await Reminder.find({ time: currentTime });

  reminders.forEach((reminder) => {
    sendNotification(reminder);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
