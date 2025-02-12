const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true, match: /^\d{2}:\d{2}$/ }, // Ensures proper HH:MM format
  fcmToken: { type: String, required: true }, // Store user's FCM token
});

module.exports = mongoose.model("Reminder", ReminderSchema);
