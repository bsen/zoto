import express from "express";
import clientRouter from "./routes/client";
import adminRouter from "./routes/admin";
import vendorRouter from "./routes/vendor";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.get("/", (req, res) => {
  res.status(200).json({ message: "server is live" });
});

app.use("/api", clientRouter);
app.use("/vendor/api", vendorRouter);
app.use("/api/admin/zotoplatforms/panel", adminRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
