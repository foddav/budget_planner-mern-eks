const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO =
  process.env.MONGO_URI ||
  `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}` +
    `@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err));
