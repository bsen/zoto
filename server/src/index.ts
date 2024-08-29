import express from "express";
import appRouter from "./routes/app";
import adminRouter from "./routes/admin";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.get("/", (req, res) => {
  res.status(200).json({ message: "server is live" });
});

app.use("/api", appRouter);
app.use("/api/admin/zotoplatforms/panel", adminRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
