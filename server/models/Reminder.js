const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: { type: String, required: true },
  fcmToken: { type: String, required: true }, // Store user's FCM token
});

module.exports = mongoose.model("Reminder", ReminderSchema);
