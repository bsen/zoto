"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = __importDefault(require("./routes/client"));
const admin_1 = __importDefault(require("./routes/admin"));
const vendor_1 = __importDefault(require("./routes/vendor"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
dotenv_1.default.config();
app.get("/", (req, res) => {
    res.status(200).json({ message: "server is live" });
});
app.use("/api", client_1.default);
app.use("/vendor/api", vendor_1.default);
app.use("/api/admin/zotoplatforms/panel", admin_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
