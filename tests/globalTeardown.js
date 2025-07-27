const mongoose = require('mongoose');

module.exports = async () => {
  // Close mongoose connection
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB server
  if (global.__MONGOSERVER__) {
    await global.__MONGOSERVER__.stop();
  }
};
