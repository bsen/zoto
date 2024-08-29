import express from "express";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
const serviceAccount = require("../../admin.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const appRouter = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string(),
  idToken: z.string(),
  profilePicture: z.string().optional(),
});

appRouter.post("/auth", async (req, res) => {
  try {
    const { email, name, phone, idToken, profilePicture } = authSchema.parse(
      req.body
    );

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    let user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          profilePicture: profilePicture || null,
        },
      });

      if (!user) {
        return res.status(500).json({ message: "Account creation failed" });
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone,
          profilePicture: profilePicture || user.profilePicture,
        },
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    return res.json({
      status: 200,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
        token,
      },
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors });
    }

    if (error) {
      console.error(error);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

interface AuthRequest extends express.Request {
  userId?: string;
}

const verifyToken = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.userId = decoded.id;
      next();
    }
  );
};

appRouter.get(
  "/profileUrl",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "User ID not found in token" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true, name: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        status: 200,
        profileUrl: user.profilePicture || null,
        name: user.name,
        message: "Profile URL retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching profile URL:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

appRouter.get(
  "/services",
  async (req: express.Request, res: express.Response) => {
    try {
      const services = await prisma.service.findMany({
        include: {
          category: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
        orderBy: [{ status: "desc" }, { name: "asc" }],
      });

      return res.status(200).json({
        status: 200,
        data: services,
        message: "Services retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching services:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

interface AuthRequest extends express.Request {
  userId?: string;
}

appRouter.get(
  "/services/:id",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      return res.status(200).json({
        status: 200,
        data: {
          user,
          service,
        },
        message:
          "User authenticated and service details retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching authenticated service details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

appRouter.post(
  "/bookings",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { serviceId, address, totalAmount, notes, bookingDate } = req.body;

      if (!bookingDate) {
        return res.status(400).json({ message: "Booking date is required" });
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service || !service.status) {
        return res.status(400).json({ message: "Service not available" });
      }

      let userAddress = await prisma.address.findFirst({
        where: {
          userId,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipCode: address.zipCode,
        },
      });

      if (!userAddress) {
        userAddress = await prisma.address.create({
          data: {
            userId,
            street: address.street,
            city: address.city,
            state: address.state,
            country: address.country,
            zipCode: address.zipCode,
          },
        });
      }

      const booking = await prisma.booking.create({
        data: {
          userId,
          serviceId,
          addressId: userAddress.id,
          datetime: new Date(bookingDate),
          status: "PENDING",
          totalAmount,
          paymentStatus: "PENDING",
          notes,
        },
      });

      return res.status(200).json({
        status: 200,
        data: booking,
        message: "Booking created successfully",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

appRouter.get(
  "/orders",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const orders = await prisma.booking.findMany({
        where: { userId },
        include: {
          service: {
            select: {
              name: true,
              images: true,
            },
          },
          address: true,
        },
        orderBy: { datetime: "desc" },
        skip,
        take: limit,
      });

      const totalOrders = await prisma.booking.count({ where: { userId } });
      const totalPages = Math.ceil(totalOrders / limit);

      return res.status(200).json({
        status: 200,
        data: {
          orders,
          currentPage: page,
          totalPages,
          totalOrders,
        },
        message: "Order history retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching order history:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

appRouter.post(
  "/bookings/:id/cancel",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const booking = await prisma.booking.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!booking) {
        return res
          .status(404)
          .json({ message: "Booking not found or not authorized" });
      }

      if (booking.status !== "PENDING") {
        return res
          .status(400)
          .json({ message: "Cannot cancel a booking that is not pending" });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      });

      return res.status(200).json({
        status: 200,
        data: updatedBooking,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default appRouter;
