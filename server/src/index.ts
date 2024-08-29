import express from "express";
import appRouter from "./routes/app";
import adminRouter from "./routes/admin";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "server is live" });
});

app.use("/api", appRouter);
app.use("/api/admin/zotoplatforms/panel", adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
