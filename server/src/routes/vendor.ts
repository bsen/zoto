import express from "express";
import { AssignmentStatus, BookingStatus, PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

const vendorServiceAccount = require("../../vendor-key.json");
const vendorApp = admin.initializeApp(
  {
    credential: admin.credential.cert(vendorServiceAccount),
  },
  "VENDOR_APP"
);

const vendorAuth = vendorApp.auth();

const vendorRouter = express.Router();

const vendorSignupSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string(),
  idToken: z.string(),
  profilePicture: z.string().optional(),
  address: z.string(),
  pincode: z.string(),
  skills: z.array(z.string()),
  aadhaarNumber: z.string(),
  panNumber: z.string(),
});

const vendorLoginSchema = z.object({
  email: z.string().email(),
  idToken: z.string(),
});

vendorRouter.post("/signup", async (req, res) => {
  try {
    const {
      email,
      name,
      phone,
      idToken,
      profilePicture,
      address,
      pincode,
      skills,
      aadhaarNumber,
      panNumber,
    } = vendorSignupSchema.parse(req.body);

    const decodedToken = await vendorAuth.verifyIdToken(idToken);

    if (decodedToken.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    let vendor = await prisma.vendor.findUnique({
      where: { email: email },
    });

    if (vendor) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    vendor = await prisma.vendor.create({
      data: {
        email,
        name,
        phone,
        profilePicture: profilePicture || null,
        address,
        pincode,
        skills: skills as any,
        aadhaarNumber,
        panNumber,
        isVerified: false,
        isAvailable: true,
      },
    });

    if (!vendor) {
      return res.status(500).json({ message: "Vendor creation failed" });
    }

    const token = jwt.sign(
      { id: vendor.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      status: 200,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          profilePicture: vendor.profilePicture,
          isVerified: vendor.isVerified,
          isAvailable: vendor.isAvailable,
        },
        token,
      },
      message: "Vendor signup successful",
    });
  } catch (error) {
    console.error("Vendor signup error:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

vendorRouter.post("/login", async (req, res) => {
  try {
    const { email, idToken } = vendorLoginSchema.parse(req.body);
    const decodedToken = await vendorAuth.verifyIdToken(idToken);

    if (decodedToken.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { email: email },
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const token = jwt.sign(
      { id: vendor.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      status: 200,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          profilePicture: vendor.profilePicture,
          isVerified: vendor.isVerified,
          isAvailable: vendor.isAvailable,
        },
        token,
      },
      message: "Vendor login successful",
    });
  } catch (error) {
    console.error("Vendor login error:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

interface AuthRequest extends express.Request {
  vendorId?: string;
}

const verifyVendorToken = (
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
      req.vendorId = decoded.id;
      next();
    }
  );
};

vendorRouter.get(
  "/profile",
  verifyVendorToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const vendorId = req.vendorId;

      if (!vendorId) {
        return res
          .status(401)
          .json({ message: "Vendor ID not found in token" });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePicture: true,
          address: true,
          skills: true,
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
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

function generateZipCodeRange(zipCode: string, range: number): string[] {
  const zipCodeNum = parseInt(zipCode, 10);
  const zipCodes = [];
  for (let i = zipCodeNum - range; i <= zipCodeNum + range; i++) {
    zipCodes.push(i.toString().padStart(6, "0"));
  }
  return zipCodes;
}

vendorRouter.get(
  "/nearby-orders",
  verifyVendorToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const vendorId = req.vendorId;

      if (!vendorId) {
        return res
          .status(401)
          .json({ message: "Vendor ID not found in token" });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { pincode: true },
      });

      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const zipCodeRange = generateZipCodeRange(vendor.pincode, 10);

      const nearbyOrders = await prisma.booking.findMany({
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

      return res.status(200).json({
        status: 200,
        data: nearbyOrders,
        message: "Nearby orders retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching nearby orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

vendorRouter.post(
  "/accept-order/:orderId",
  verifyVendorToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { orderId } = req.params;
      const vendorId = req.vendorId;

      if (!vendorId) {
        return res
          .status(401)
          .json({ message: "Vendor ID not found in token" });
      }

      const order = await prisma.booking.findUnique({
        where: { id: orderId, status: "PENDING" },
        include: { address: true, service: true },
      });

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or already assigned" });
      }

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor || !vendor.isAvailable) {
        return res
          .status(400)
          .json({ message: "Vendor is not eligible to accept this order" });
      }

      const pendingOrdersCount = await prisma.serviceAssigned.count({
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
      const orderEndTime = new Date(
        orderStartTime.getTime() + (order.service.duration || 60) * 60000
      );

      const clashingOrders = await prisma.serviceAssigned.findMany({
        where: {
          vendorId: vendorId,
          booking: {
            datetime: {
              gte: orderStartTime,
              lt: orderEndTime,
            },
          },
          status: {
            in: ["ASSIGNED", "IN_PROGRESS"],
          },
        },
      });

      if (clashingOrders.length > 0) {
        return res
          .status(400)
          .json({ message: "This order clashes with your existing schedule" });
      }

      const serviceAssigned = await prisma.serviceAssigned.create({
        data: {
          bookingId: orderId,
          vendorId: vendorId,
          status: "ASSIGNED",
        },
      });

      console.log("service assigned to vendor:", serviceAssigned);

      await prisma.booking.update({
        where: { id: orderId },
        data: { status: "CONFIRMED" },
      });

      return res.status(200).json({
        status: 200,
        data: serviceAssigned,
        message: "Order accepted successfully",
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

vendorRouter.get(
  "/accepted-orders",
  verifyVendorToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const vendorId = req.vendorId;

      if (!vendorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const acceptedOrders = await prisma.serviceAssigned.findMany({
        where: {
          vendorId: vendorId,
          status: {
            in: [AssignmentStatus.ASSIGNED, AssignmentStatus.IN_PROGRESS],
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
        totalAmount: order.booking.totalAmount,
      }));

      return res.status(200).json({
        status: 200,
        data: formattedOrders,
        message: "Accepted orders retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      return res.status(500).json({
        status: 500,
        message: "An error occurred while fetching accepted orders",
      });
    }
  }
);

vendorRouter.post(
  "/complete-order/:orderId",
  verifyVendorToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const { orderId } = req.params;
      const { otp } = req.body;
      const vendorId = req.vendorId;

      if (!vendorId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: orderId },
        include: { serviceAssigned: true },
      });

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.serviceAssigned?.vendorId !== vendorId) {
        return res
          .status(403)
          .json({ message: "Not authorized to complete this order" });
      }

      if (booking.status === BookingStatus.COMPLETED) {
        return res.status(400).json({ message: "Order is already completed" });
      }

      const providedOtp = parseInt(otp, 10);
      if (booking.otp !== providedOtp.toString()) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: orderId },
        data: {
          status: BookingStatus.COMPLETED,
          serviceAssigned: {
            update: {
              status: AssignmentStatus.COMPLETED,
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
    } catch (error) {
      console.error("Error completing order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default vendorRouter;
