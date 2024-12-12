"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const PrismaNamespace = __importStar(require("@prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const adminRouter = express_1.default.Router();
const verifyAdminToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Access denied" });
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.ADMIN_JWT_SECRET);
        req.admin = verified;
        next();
    }
    catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};
adminRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password are required" });
        }
        const admin = yield prisma.admin.findUnique({ where: { username } });
        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const validPassword = yield bcrypt_1.default.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, process.env.ADMIN_JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, message: "Login successful" });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An internal server error occurred" });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
adminRouter.get("/new-orders", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const orders = yield prisma.booking.findMany({
            where: {
                status: PrismaNamespace.BookingStatus.PENDING,
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                service: true,
                address: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalOrders = yield prisma.booking.count({
            where: {
                status: PrismaNamespace.BookingStatus.PENDING,
            },
        });
        const totalPages = Math.ceil(totalOrders / limit);
        res.json({
            orders,
            currentPage: page,
            totalPages,
            totalOrders,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching pending orders",
            error: error.message,
        });
    }
}));
adminRouter.get("/processed-orders", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const orders = yield prisma.booking.findMany({
            where: {
                status: {
                    not: PrismaNamespace.BookingStatus.PENDING,
                },
            },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                service: true,
                address: true,
                serviceAssigned: {
                    include: {
                        vendor: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalOrders = yield prisma.booking.count({
            where: {
                status: {
                    not: PrismaNamespace.BookingStatus.PENDING,
                },
            },
        });
        const statusCounts = yield prisma.booking.groupBy({
            by: ["status"],
            where: {
                status: {
                    not: PrismaNamespace.BookingStatus.PENDING,
                },
            },
            _count: true,
        });
        const revenueResult = yield prisma.booking.aggregate({
            where: {
                status: {
                    not: PrismaNamespace.BookingStatus.PENDING,
                },
            },
            _sum: {
                totalAmount: true,
            },
        });
        const totalRevenue = revenueResult._sum.totalAmount || 0;
        const totalPages = Math.ceil(totalOrders / limit);
        const statusSummary = statusCounts.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {});
        // Reshape the orders to include vendor information directly
        const processedOrders = orders.map((order) => {
            var _a;
            return (Object.assign(Object.assign({}, order), { vendor: ((_a = order.serviceAssigned) === null || _a === void 0 ? void 0 : _a.vendor) || null, serviceAssigned: undefined }));
        });
        res.json({
            orders: processedOrders,
            currentPage: page,
            totalPages,
            totalOrders,
            statusSummary,
            totalRevenue,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching processed orders",
            error: error.message,
        });
    }
}));
adminRouter.get("/users", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePicture: true,
                createdAt: true,
                _count: {
                    select: { bookings: true, reviews: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalUsers = yield prisma.user.count();
        const totalPages = Math.ceil(totalUsers / limit);
        res.json({
            users,
            currentPage: page,
            totalPages,
            totalUsers,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
}));
adminRouter.get("/users/:id", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id },
            include: {
                addresses: true,
                _count: {
                    select: { bookings: true, reviews: true },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching user details",
            error: error.message,
        });
    }
}));
adminRouter.get("/users/:id/profile", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const user = yield prisma.user.findUnique({
            where: { id },
            include: {
                addresses: true,
                _count: {
                    select: { bookings: true, reviews: true },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const bookings = yield prisma.booking.findMany({
            where: { userId: id },
            include: {
                service: true,
                address: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalBookings = yield prisma.booking.count({
            where: { userId: id },
        });
        const totalPages = Math.ceil(totalBookings / limit);
        res.json({
            user,
            bookings,
            currentPage: page,
            totalPages,
            totalBookings,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching user profile",
            error: error.message,
        });
    }
}));
adminRouter.post("/search-users", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        if (query === undefined || query === null) {
            return res.status(400).json({ error: "Search query is required" });
        }
        const users = yield prisma.user.findMany({
            where: {
                email: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: { bookings: true, reviews: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        res.json({ users });
    }
    catch (error) {
        console.error("Error in user search endpoint:", error);
        res
            .status(500)
            .json({ error: "An unexpected error occurred during search" });
    }
}));
adminRouter.get("/orders/:id", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const order = yield prisma.booking.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true } },
                service: true,
                address: true,
            },
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const orderResponse = Object.assign(Object.assign({}, order), { name: order.name, phone: order.phone, user: {
                id: order.user.id,
                email: order.user.email,
            } });
        res.json(orderResponse);
    }
    catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({
            message: "Error fetching order details",
            error: error.message,
        });
    }
}));
adminRouter.put("/orders-update/:id", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        if (!Object.values(PrismaNamespace.BookingStatus).includes(status)) {
            return res.status(400).json({ message: "Invalid booking status" });
        }
        const updatedOrder = yield prisma.booking.update({
            where: { id },
            data: {
                status: status,
                paymentStatus: "PAID",
            },
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            message: "Error updating order",
            error: error.message,
        });
    }
}));
adminRouter.get("/dashboard-summary", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalOrders = yield prisma.booking.count();
        const activeServices = yield prisma.service.count({
            where: { status: true },
        });
        const totalCustomers = yield prisma.user.count();
        const totalRevenue = yield prisma.booking.aggregate({
            _sum: { totalAmount: true },
        });
        const orderChange = "+5.2%";
        const serviceChange = "+2.1%";
        const customerChange = "+3.7%";
        const revenueChange = "+7.8%";
        res.json({
            totalOrders,
            activeServices,
            totalCustomers,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            changes: { orderChange, serviceChange, customerChange, revenueChange },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard summary",
            error: error.message,
        });
    }
}));
adminRouter.get("/service-category-bookings", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield prisma.booking.findMany({
            include: {
                service: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        const categoryBookings = bookings.reduce((acc, booking) => {
            const categoryId = booking.service.category.id;
            const categoryName = booking.service.category.name;
            if (!acc[categoryId]) {
                acc[categoryId] = { count: 0, name: categoryName };
            }
            acc[categoryId].count++;
            return acc;
        }, {});
        const sortedCategoryBookings = Object.entries(categoryBookings)
            .map(([categoryId, data]) => ({
            categoryId,
            name: data.name,
            count: data.count,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Take top 5
        res.json(sortedCategoryBookings);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching service category bookings",
            error: error.message,
        });
    }
}));
adminRouter.get("/recent-orders", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentOrders = yield prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true } },
                service: { select: { name: true } },
            },
        });
        res.json(recentOrders);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching recent orders",
            error: error.message,
        });
    }
}));
adminRouter.get("/customer-types", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCustomers = yield prisma.user.count();
        const returningCustomers = yield prisma.user.count({
            where: {
                bookings: {
                    some: {},
                    every: {
                        createdAt: {
                            lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                        },
                    },
                },
            },
        });
        const newCustomers = yield prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
            },
        });
        const inactiveCustomers = totalCustomers - returningCustomers - newCustomers;
        res.json({ newCustomers, returningCustomers, inactiveCustomers });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching customer types",
            error: error.message,
        });
    }
}));
adminRouter.get("/vendors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const vendors = yield prisma.vendor.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isVerified: true,
                isAvailable: true,
                createdAt: true,
                _count: {
                    select: { serviceAssigned: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalVendors = yield prisma.vendor.count();
        const totalPages = Math.ceil(totalVendors / limit);
        res.json({
            vendors,
            currentPage: page,
            totalPages,
            totalVendors,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching vendors",
            error: error.message,
        });
    }
}));
// Get vendor profile
adminRouter.get("/vendors/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const vendor = yield prisma.vendor.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { serviceAssigned: true },
                },
            },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.json(vendor);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching vendor details",
            error: error.message,
        });
    }
}));
// Get vendor orders
adminRouter.get("/vendors/:id/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const orders = yield prisma.serviceAssigned.findMany({
            where: { vendorId: id },
            include: {
                booking: {
                    include: {
                        service: true,
                        address: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalOrders = yield prisma.serviceAssigned.count({
            where: { vendorId: id },
        });
        const totalPages = Math.ceil(totalOrders / limit);
        res.json({
            orders,
            currentPage: page,
            totalPages,
            totalOrders,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching vendor orders",
            error: error.message,
        });
    }
}));
// Search vendors
adminRouter.post("/search-vendors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        if (query === undefined || query === null) {
            return res.status(400).json({ error: "Search query is required" });
        }
        const vendors = yield prisma.vendor.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isVerified: true,
                isAvailable: true,
                createdAt: true,
                _count: {
                    select: { serviceAssigned: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        res.json({ vendors });
    }
    catch (error) {
        console.error("Error in vendor search endpoint:", error);
        res
            .status(500)
            .json({ error: "An unexpected error occurred during search" });
    }
}));
// Update this route in your adminRouter
adminRouter.get("/vendors/:vendorId/profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const vendor = yield prisma.vendor.findUnique({
            where: { id: vendorId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePicture: true,
                address: true,
                pincode: true,
                aadhaarNumber: true,
                panNumber: true,
                isVerified: true,
                isAvailable: true,
                createdAt: true,
            },
        });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const orders = yield prisma.serviceAssigned.findMany({
            where: { vendorId: vendorId },
            include: {
                booking: {
                    include: {
                        service: true,
                        address: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        const totalOrders = yield prisma.serviceAssigned.count({
            where: { vendorId: vendorId },
        });
        const totalPages = Math.ceil(totalOrders / limit);
        res.json({
            vendor,
            orders,
            currentPage: page,
            totalPages,
            totalOrders,
        });
    }
    catch (error) {
        console.error("Error fetching vendor profile:", error);
        res.status(500).json({
            message: "Error fetching vendor profile and orders",
            error: error.message,
        });
    }
}));
adminRouter.put("/vendors/:vendorId", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const { name, email, phone, address, pincode, aadhaarNumber, panNumber } = req.body;
    try {
        const updatedVendor = yield prisma.vendor.update({
            where: { id: vendorId },
            data: {
                name,
                email,
                phone,
                address,
                pincode,
                aadhaarNumber,
                panNumber,
            },
        });
        res.json(updatedVendor);
    }
    catch (error) {
        console.error("Error updating vendor profile:", error);
        res.status(500).json({ message: "Error updating vendor profile" });
    }
}));
// Toggle vendor verification status
adminRouter.put("/vendors/:vendorId/verify", verifyAdminToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorId } = req.params;
    const { isVerified } = req.body;
    try {
        const updatedVendor = yield prisma.vendor.update({
            where: { id: vendorId },
            data: { isVerified },
        });
        res.json(updatedVendor);
    }
    catch (error) {
        console.error("Error updating vendor verification status:", error);
        res
            .status(500)
            .json({ message: "Error updating vendor verification status" });
    }
}));
exports.default = adminRouter;
