import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import * as PrismaNamespace from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const adminRouter = express.Router();

interface AdminRequest extends Request {
  admin?: { id: string };
}

const verifyAdminToken = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });
  try {
    const verified = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET as string
    ) as { id: string };
    req.admin = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

adminRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign(
      { id: admin.id },
      process.env.ADMIN_JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  } finally {
    await prisma.$disconnect();
  }
});

adminRouter.get(
  "/new-orders",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const orders = await prisma.booking.findMany({
        where: {
          status: PrismaNamespace.BookingStatus.PENDING,
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true } },
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const totalOrders = await prisma.booking.count({
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
    } catch (error) {
      res.status(500).json({
        message: "Error fetching pending orders",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/processed-orders",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const orders = await prisma.booking.findMany({
        where: {
          status: {
            not: PrismaNamespace.BookingStatus.PENDING,
          },
        },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { name: true } },
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const totalOrders = await prisma.booking.count({
        where: {
          status: {
            not: PrismaNamespace.BookingStatus.PENDING,
          },
        },
      });

      const statusCounts = await prisma.booking.groupBy({
        by: ["status"],
        where: {
          status: {
            not: PrismaNamespace.BookingStatus.PENDING,
          },
        },
        _count: true,
      });

      const revenueResult = await prisma.booking.aggregate({
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
      }, {} as Record<string, number>);
      res.json({
        orders,
        currentPage: page,
        totalPages,
        totalOrders,
        statusSummary,
        totalRevenue,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching processed orders",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/users",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: { bookings: true, reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      const totalUsers = await prisma.user.count();
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        users,
        currentPage: page,
        totalPages,
        totalUsers,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching users",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/users/:id",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          bookings: {
            include: {
              service: { select: { name: true } },
              address: true,
            },
            orderBy: { createdAt: "desc" },
          },
          reviews: {
            include: {
              service: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching user details",
        error: (error as Error).message,
      });
    }
  }
);
adminRouter.put(
  "/orders/:id",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      if (
        !Object.values(PrismaNamespace.BookingStatus).includes(
          status as PrismaNamespace.BookingStatus
        )
      ) {
        return res.status(400).json({ message: "Invalid booking status" });
      }

      const updatedOrder = await prisma.booking.update({
        where: { id },
        data: {
          status: status as PrismaNamespace.BookingStatus,
          paymentStatus: "PAID" as PrismaNamespace.PaymentStatus,
        },
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({
        message: "Error updating order",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/dashboard-summary",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const totalOrders = await prisma.booking.count();
      const activeServices = await prisma.service.count({
        where: { status: true },
      });
      const totalCustomers = await prisma.user.count();
      const totalRevenue = await prisma.booking.aggregate({
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
    } catch (error) {
      res.status(500).json({
        message: "Error fetching dashboard summary",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/service-category-bookings",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const bookings = await prisma.booking.findMany({
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
      }, {} as Record<string, { count: number; name: string }>);

      const sortedCategoryBookings = Object.entries(categoryBookings)
        .map(([categoryId, data]) => ({
          categoryId,
          name: data.name,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Take top 5

      res.json(sortedCategoryBookings);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching service category bookings",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/recent-orders",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const recentOrders = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          service: { select: { name: true } },
        },
      });

      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching recent orders",
        error: (error as Error).message,
      });
    }
  }
);

adminRouter.get(
  "/customer-types",
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const totalCustomers = await prisma.user.count();
      const returningCustomers = await prisma.user.count({
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
      const newCustomers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      });
      const inactiveCustomers =
        totalCustomers - returningCustomers - newCustomers;

      res.json({ newCustomers, returningCustomers, inactiveCustomers });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching customer types",
        error: (error as Error).message,
      });
    }
  }
);

export default adminRouter;
