const express = require("express");
const Reminder = require("../models/Reminder");
const admin = require("firebase-admin");

const router = express.Router();

// Create Reminder
router.post("/", async (req, res) => {
  try {
    const { title, time, fcmToken } = req.body;
    const newReminder = new Reminder({ title, time, fcmToken });
    await newReminder.save();
    res.status(201).json({ message: "Reminder saved!", reminder: newReminder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Reminders
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
