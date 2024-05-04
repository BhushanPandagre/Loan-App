import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import loanRouter from "./routes/loanRouter.js";

const app = express();
app.use(cors());
dotenv.config();
const Port = process.env.PORT || 5000;

app.use(express.json());

const CONNECTION_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/loan_App"

// Connect to MongoDB
mongoose
  .connect(CONNECTION_URL)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error(err));

// middlwares
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/loans", loanRouter);

app.listen(Port, () => {
  console.log(`App is listening to port ${Port}`);
});
