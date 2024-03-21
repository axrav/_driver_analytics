const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {
  saveDriverLocation,
  detectHotspots,
  getDistanceDriven,
} = require("./utils/utils");
const Driver = require("./database/models");

// load env
require("dotenv").config();

// Connect to database
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());

// get all drivers from the database
app.get("/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find();
    return res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// get driver distance for a given date 
app.post("/api/driver-distance", async (req, res) => {
  try {
    const { driverId, date } = req.body;
    const totalDistance = await getDistanceDriven(driverId, date);
    return res.status(200).json({ driverId, date, totalDistance });
  } catch (error) {
    console.error("Error calculating driver distance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// detect hotspots for a given date 
app.post("/api/hotspots", async (req, res) => {
  try {
    const { date } = req.body;
    const hotspots = await detectHotspots(date);
    return res.status(200).json({ date, hotspots });
  } catch (error) {
    console.error("Error finding hotspots:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// save driver location data to the database and emit the new location to all clients 
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  socket.on("driverLocation", async (data) => {
    try {
      const { driverId, lat, lng } = data;
      await saveDriverLocation(driverId, lat, lng);
      io.emit("newLocation", { driverId, lat, lng });

      // Check for hotspots every time a new location is received
      const currentDate = new Date();
      const hotspots = await detectHotspots(currentDate);
      io.emit("hotspots", hotspots);
    } catch (error) {
      console.error("Error saving location data:", error);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
