const Driver = require("../database/models");
const clustering = require("density-clustering");
const dbscan = new clustering.DBSCAN();

async function saveDriverLocation(driverId, lat, lng) {
  // geocode can be used to get the address from the lat and lng
  const newLocation = new Driver({ driverId, lat, lng });
  await newLocation.save();
}

// DBSCAN algorithm to detect hotspots in the driver locations for a given date
async function detectHotspots(date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const driverLocations = await Driver.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay },
    });
    const coordinates = driverLocations.map((location) => [
      location.lat,
      location.lng,
    ]);

    return dbscan.run(coordinates, 0.01, 2); // epsilon = 0.01, minPoints = 2
  } catch (error) {
    console.error("Error detecting hotspots:", error);
    return [];
  }
}
// Calculate the distance driven by a driver for a given date using the Haversine formula 
async function getDistanceDriven(driverId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const driverLocations = await Driver.find({
    driverId,
    timestamp: { $gte: startOfDay, $lte: endOfDay },
  });

  let totalDistance = 0;
  for (let i = 1; i < driverLocations.length; i++) {
    const lat1 = driverLocations[i - 1].lat;
    const lon1 = driverLocations[i - 1].lng;
    const lat2 = driverLocations[i].lat;
    const lon2 = driverLocations[i].lng;
    totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
  }

  return totalDistance;
}
// Haversine formula to calculate the distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

module.exports = {
  saveDriverLocation,
  detectHotspots,
  getDistanceDriven,
};
