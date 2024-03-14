const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passwordHash: { type: String, required: true },
    randomString: String,
    activationToken: String,
    activated: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);
const User = mongoose.model("User", userSchema);

module.exports = User;