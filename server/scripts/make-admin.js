require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");

const email = process.argv[2]?.toLowerCase();
if (!email) throw new Error("Usage: npm run make-admin -- person@example.com");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  if (!user) throw new Error("User not found");
  console.log(`Granted admin role to ${user.email}`);
}).finally(() => mongoose.disconnect());
