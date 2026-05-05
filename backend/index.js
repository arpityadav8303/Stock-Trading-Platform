require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const startPriceUpdater = require("./priceUpdater");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const marketRoutes = require("./routes/marketRoutes");
const orderRoutes = require("./routes/orderRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

app.use("/", healthRoutes);
app.use("/", authRoutes);
app.use("/", portfolioRoutes);
app.use("/", marketRoutes);
app.use("/", orderRoutes);
app.use("/", watchlistRoutes);

app.listen(PORT, () => {
  console.log(`App is started on port ${PORT}`);
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to DB");
      startPriceUpdater();
    })
    .catch((err) => console.error("DB connection error:", err));
});
