const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  connectAndListen(process.env.MONGO_URI);
} else {
  const host = process.env.MONGO_HOST || "localhost";
  const db = process.env.MONGO_DB || "test";
  const user = process.env.MONGO_USERNAME || "";
  const pass = process.env.MONGO_PASSWORD || "";

  let uri;
  if (user && pass) {
    const u = encodeURIComponent(user);
    const p = encodeURIComponent(pass);
    uri = `mongodb://${u}:${p}@${host}:27017/${db}?retryWrites=true&w=majority`;
  } else {
    uri = `mongodb://${host}:27017/${db}`;
  }

  connectAndListen(uri);
}

function connectAndListen(mongoUri) {
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
