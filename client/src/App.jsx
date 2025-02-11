import React, { useState, useEffect } from "react";
import axios from "axios";
import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";

function App() {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [token, setToken] = useState("");
  const [reminders, setReminders] = useState([]);

  // Fetch all reminders from the backend
  const fetchReminders = async () => {
    try {
      const response = await axios.get(
        "https://waterremainderappserver.vercel.app/api/reminders"
      );
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Register Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }
  }, []);

  // Request Notification Permission and Get FCM Token
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const fcmToken = await getToken(messaging, {
          vapidKey:
            "BM8dLhIC7x0gX2Kfc2-u7WOYDGNjA9MfZOs1RcO6WrCRfok1h4U8I0F6ruGPAkEWunAz8sNN4574jn9ZuD_O2A0",
        });
        if (fcmToken) {
          console.log("✅ FCM Token:", fcmToken);
          setToken(fcmToken);
          // Send the token to the backend
        } else {
          console.warn("⚠️ No FCM token received.");
        }
      } else {
        console.warn("🚫 Notification permission denied.");
      }
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
    }
  };

  useEffect(() => {
    requestPermission();

    // Handle foreground notifications
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📲 Foreground notification received:", payload);
      alert(`📢 ${payload.notification.title}: ${payload.notification.body}`);
      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/favicon.ico",
        });
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Handle Reminder Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://waterremainderappserver.vercel.app/api/reminders",
        {
          title,
          time,
          fcmToken: token,
        }
      );
      alert("✅ Reminder Set!");
      fetchReminders();
    } catch (error) {
      console.error("❌ Error setting reminder:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Water Reminder App
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Set Reminder
          </button>
        </form>
      </div>
      <div className="mt-6 w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          All Reminders
        </h2>
        <ul className="divide-y divide-gray-200">
          {reminders.map((reminder, index) => (
            <li key={index} className="p-2 flex justify-between items-center">
              <span className="font-medium text-gray-800">
                {reminder.title}
              </span>
              <span className="text-gray-500">{reminder.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
