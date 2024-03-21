const mongoose = require("mongoose");
// Define the schema for the driver location
const driverSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  lat: Number,
  lng: Number,
});

module.exports = mongoose.model("Driver", driverSchema);
