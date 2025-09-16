const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  desc: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  expenses: { type: [expenseSchema], default: [] },
});

module.exports = mongoose.model("User", userSchema);
