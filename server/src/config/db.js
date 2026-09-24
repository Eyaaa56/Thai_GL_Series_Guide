const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 })
      .then((connection) => {
        console.log("MongoDB connected");
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  return connectionPromise;
};

module.exports = connectDB;
