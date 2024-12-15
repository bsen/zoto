"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const vendorRouter = express_1.default.Router();
const vendorSignupSchema = zod_1.z.object({
    name: zod_1.z.string(),
    phone: zod_1.z.string(),
    password: zod_1.z.string(),
    address: zod_1.z.string(),
    pincode: zod_1.z.string(),
    aadhaarNumber: zod_1.z.string(),
    panNumber: zod_1.z.string(),
    profilePicture: zod_1.z.string().optional(),
});
const vendorLoginSchema = zod_1.z.object({
    phone: zod_1.z.string(),
    password: zod_1.z.string(),
});
vendorRouter.post("/vendor-auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, password, address, pincode, aadhaarNumber, panNumber, profilePicture, } = vendorSignupSchema.parse(req.body);
        let vendor = yield prisma.vendor.findUnique({
            where: { phone },
        });
        if (vendor) {
            return res
                .status(400)
                .json({ message: "Phone number already registered" });
        }
        const existingVendor = yield prisma.vendor.findFirst({
            where: {
                OR: [{ aadhaarNumber }, { panNumber }],
            },
        });
        if (existingVendor) {
            return res.status(400).json({
                message: existingVendor.aadhaarNumber === aadhaarNumber
                    ? "Aadhaar number already registered"
                    : "PAN number already registered",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        vendor = yield prisma.vendor.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                address,
                pincode,
                aadhaarNumber,
                panNumber,
                skills: [],
                profilePicture: profilePicture || null,
                isVerified: false,
                isAvailable: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: vendor.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({
            status: 200,
            data: {
                vendor: {
                    id: vendor.id,
                    name: vendor.name,
                    phone: vendor.phone,
                    address: vendor.address,
                    pincode: vendor.pincode,
                    profilePicture: vendor.profilePicture,
                    isVerified: vendor.isVerified,
                    isAvailable: vendor.isAvailable,
                },
                token,
            },
            message: "Vendor signup successful",
        });
    }
    catch (error) {
        console.error("Vendor signup error:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ message: "Invalid input data", errors: error.errors });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}));
vendorRouter.post("/vendor-auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password } = vendorLoginSchema.parse(req.body);
        const vendor = yield prisma.vendor.findUnique({
            where: { phone },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: vendor.id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.json({
            status: 200,
            data: {
                vendor: {
                    id: vendor.id,
                    name: vendor.name,
                    phone: vendor.phone,
                    address: vendor.address,
                    pincode: vendor.pincode,
                    profilePicture: vendor.profilePicture,
                    isVerified: vendor.isVerified,
                    isAvailable: vendor.isAvailable,
                },
                token,
            },
            message: "Vendor login successful",
        });
    }
    catch (error) {
        console.error("Vendor login error:", error);
        if (error instanceof zod_1.z.ZodError) {
            return res
                .status(400)
                .json({ message: "Invalid input data", errors: error.errors });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}));
const verifyVendorToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.vendorId = decoded.id;
        next();
    });
};
vendorRouter.get("/profile", verifyVendorToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorId = req.vendorId;
        if (!vendorId) {
            return res
                .status(401)
                .json({ message: "Vendor ID not found in token" });
        }
        const vendor = yield prisma.vendor.findUnique({
            where: { id: vendorId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePicture: true,
                address: true,
                isVerified: true,
                isAvailable: true,
            },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        return res.status(200).json({
            status: 200,
            data: vendor,
            message: "Vendor profile retrieved successfully",
        });
    }
    catch (error) {
        console.error("Error fetching vendor profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
function generateZipCodeRange(zipCode, range) {
    const zipCodeNum = parseInt(zipCode, 10);
    const zipCodes = [];
    for (let i = zipCodeNum - range; i <= zipCodeNum + range; i++) {
        zipCodes.push(i.toString().padStart(6, "0"));
    }
    return zipCodes;
}
vendorRouter.get("/nearby-orders", verifyVendorToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorId = req.vendorId;
        if (!vendorId) {
            return res
                .status(401)
                .json({ message: "Vendor ID not found in token" });
        }
        const vendor = yield prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { pincode: true },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const zipCodeRange = generateZipCodeRange(vendor.pincode, 10);
        const nearbyOrders = yield prisma.booking.findMany({
            where: {
                address: {
                    zipCode: {
                        in: zipCodeRange,
                    },
                },
                status: "PENDING",
            },
            include: {
                address: true,
                service: true,
                user: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
        });
        const modifiedOrders = nearbyOrders.map((order) => (Object.assign(Object.assign({}, order), { totalAmount: Math.round(order.totalAmount * 0.75) })));
        return res.status(200).json({
            status: 200,
            data: modifiedOrders,
            message: "Nearby orders retrieved successfully",
        });
    }
    catch (error) {
        console.error("Error fetching nearby orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
vendorRouter.post("/accept-order/:orderId", verifyVendorToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const vendorId = req.vendorId;
        if (!vendorId) {
            return res
                .status(401)
                .json({ message: "Vendor ID not found in token" });
        }
        const order = yield prisma.booking.findUnique({
            where: { id: orderId, status: "PENDING" },
            include: { address: true, service: true },
        });
        if (!order) {
            return res
                .status(404)
                .json({ message: "Order not found or already assigned" });
        }
        const vendor = yield prisma.vendor.findUnique({
            where: { id: vendorId },
        });
        if (!vendor || !vendor.isAvailable) {
            return res
                .status(400)
                .json({ message: "Vendor is not eligible to accept this order" });
        }
        const pendingOrdersCount = yield prisma.serviceAssigned.count({
            where: {
                vendorId: vendorId,
                status: "ASSIGNED",
            },
        });
        if (pendingOrdersCount >= 5) {
            return res.status(400).json({
                message: "Vendor has reached the maximum number of pending orders",
            });
        }
        const orderStartTime = new Date(order.datetime);
        const orderEndTime = new Date(orderStartTime.getTime() + (order.service.duration || 60) * 60000);
        const clashingOrders = yield prisma.serviceAssigned.findMany({
            where: {
                vendorId: vendorId,
                booking: {
                    datetime: {
                        gte: orderStartTime,
                        lt: orderEndTime,
                    },
                },
                status: {
                    in: ["ASSIGNED"],
                },
            },
        });
        if (clashingOrders.length > 0) {
            return res
                .status(400)
                .json({ message: "This order clashes with your existing schedule" });
        }
        const serviceAssigned = yield prisma.serviceAssigned.create({
            data: {
                bookingId: orderId,
                vendorId: vendorId,
                status: "ASSIGNED",
            },
        });
        console.log("service assigned to vendor:", serviceAssigned);
        yield prisma.booking.update({
            where: { id: orderId },
            data: { status: "ACCEPTED" },
        });
        return res.status(200).json({
            status: 200,
            data: serviceAssigned,
            message: "Order accepted successfully",
        });
    }
    catch (error) {
        console.error("Error accepting order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
vendorRouter.get("/accepted-orders", verifyVendorToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorId = req.vendorId;
        if (!vendorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const acceptedOrders = yield prisma.serviceAssigned.findMany({
            where: {
                vendorId: vendorId,
                status: {
                    in: [client_1.AssignmentStatus.ASSIGNED],
                },
            },
            include: {
                booking: {
                    include: {
                        service: true,
                        address: true,
                        user: {
                            select: {
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const formattedOrders = acceptedOrders.map((order) => ({
            id: order.booking.id,
            serviceName: order.booking.service.name,
            customerName: order.booking.user.name,
            customerPhone: order.booking.user.phone,
            address: `${order.booking.address.street}, ${order.booking.address.city}, ${order.booking.address.state}, ${order.booking.address.zipCode}`,
            dateTime: order.booking.datetime,
            status: order.status,
            totalAmount: Math.round(order.booking.totalAmount * 0.75),
        }));
        return res.status(200).json({
            status: 200,
            data: formattedOrders,
            message: "Accepted orders retrieved successfully",
        });
    }
    catch (error) {
        console.error("Error fetching accepted orders:", error);
        return res.status(500).json({
            status: 500,
            message: "An error occurred while fetching accepted orders",
        });
    }
}));
vendorRouter.post("/complete-order/:orderId", verifyVendorToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { orderId } = req.params;
        console.log(orderId);
        const { otp } = req.body;
        console.log(otp);
        const vendorId = req.vendorId;
        console.log(vendorId);
        if (!vendorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }
        const booking = yield prisma.booking.findUnique({
            where: { id: orderId },
            include: { serviceAssigned: true },
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (((_a = booking.serviceAssigned) === null || _a === void 0 ? void 0 : _a.vendorId) !== vendorId) {
            return res
                .status(403)
                .json({ message: "Not authorized to complete this order" });
        }
        if (booking.status === client_1.BookingStatus.COMPLETED) {
            return res.status(400).json({ message: "Order is already completed" });
        }
        const providedOtp = parseInt(otp, 10);
        if (booking.otp !== providedOtp.toString()) {
            return res.status(409).json({ message: "Invalid OTP" });
        }
        const updatedBooking = yield prisma.booking.update({
            where: { id: orderId },
            data: {
                status: client_1.BookingStatus.COMPLETED,
                paymentStatus: client_1.PaymentStatus.PAID,
                serviceAssigned: {
                    update: {
                        status: client_1.AssignmentStatus.COMPLETED,
                    },
                },
            },
            include: {
                service: true,
                user: true,
                serviceAssigned: true,
            },
        });
        return res.status(200).json({
            status: 200,
            data: {
                bookingId: updatedBooking.id,
                serviceName: updatedBooking.service.name,
                customerName: updatedBooking.user.name,
                completionTime: new Date(),
                totalAmount: updatedBooking.totalAmount,
            },
            message: "Order completed successfully",
        });
    }
    catch (error) {
        console.error("Error completing order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = vendorRouter;
