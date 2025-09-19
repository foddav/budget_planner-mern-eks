const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// In development load environment variables from a local .env file.
// In production rely on platform-managed env vars (avoid reading local secret files).
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const PORT = process.env.PORT || 5000;

// If a full connection string is provided use it, otherwise build one from parts.
if (process.env.MONGO_URI) {
  connectAndListen(process.env.MONGO_URI);
} else {
  const host = process.env.MONGO_HOST || "localhost";
  const db = process.env.MONGO_DB || "test";
  const user = process.env.MONGO_USERNAME || "";
  const pass = process.env.MONGO_PASSWORD || "";

  let uri;
  if (user && pass) {
    // Ensure credentials are URL-encoded before embedding into the URI.
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(pass);
    uri = `mongodb://${u}:${p}@${host}:27017/${db}?retryWrites=true&w=majority`;
  } else {
    uri = `mongodb://${host}:27017/${db}`;
  }

  connectAndListen(uri);
}

function connectAndListen(mongoUri) {
    // Avoid printing secrets to logs; indicate only that a Mongo URI is provided.
  console.log("Connecting to Mongo:", mongoUri.startsWith("mongodb://") ? "[mongodb uri]" : "[hidden]");
  mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("DB connection error:", err);
    });
}
