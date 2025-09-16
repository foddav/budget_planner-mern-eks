const User = require("../models/User");

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  try {
    const existing = await User.findOne({ username });
    if (existing)
      return res
        .status(400)
        .json({ message: "Username already exists. Try another." });

    const newUser = new User({ username, password, expenses: [] });
    await newUser.save();
    res.json({ message: "Registration successful. You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during registration." });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  try {
    const user = await User.findOne({ username, password }).select("-__v");
    if (!user)
      return res.status(401).json({ message: "Invalid username or password." });

    const safeUser = {
      username: user.username,
      expenses: user.expenses || [],
    };

    res.json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during login." });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "expenses"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
};

exports.addExpense = async (req, res) => {
  const { amount, desc } = req.body;
  if (amount === undefined || isNaN(Number(amount))) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.expenses.push({ amount: Number(amount), desc });
    await user.save();

    res.json(user.expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding expense" });
  }
};

exports.clearExpenses = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.expenses = [];
    await user.save();
    res.json(user.expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error clearing expenses" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.expenses = user.expenses.filter(
      (e) => e._id.toString() !== req.params.expenseId
    );
    await user.save();
    res.json(user.expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting expense" });
  }
};
