import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import twilio from "twilio";
import { format } from "date-fns";
import bcryptjs from "bcryptjs";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

const prisma = new PrismaClient();

const clientRouter = express.Router();

const twilioClient = twilio(
  "AC9b3a91fd0d3d3587b836c14ee480d694",
  "a7dbb1ac73b38a8d58375855d66a782a"
);

async function sendWhatsAppNotification(to: string, body: string) {
  const formattedNumber = to.startsWith("+") ? to : `+91${to}`;
  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${formattedNumber}`,
    });
    await twilioClient.messages(message.sid).fetch();
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
  }
}

const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

const signupSchema = z.object({
  name: z.string(),
  phone: z.string(),
  password: z.string(),
  profilePicture: z.string().optional(),
});

clientRouter.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone: phone },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
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
          phone: user.phone,
          profilePicture: user.profilePicture,
          referralCode: user.referralCode,
          walletBalance: user.walletBalance,
          referralActive: user.referralActive,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

clientRouter.post("/auth/signup", async (req, res) => {
  try {
    const { name, phone, password, profilePicture } = signupSchema.parse(
      req.body
    );

    const existingUser = await prisma.user.findUnique({
      where: { phone: phone },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    const generateUniqueReferralCode = async (): Promise<string> => {
      while (true) {
        const code = nanoid();
        const existingUser = await prisma.user.findUnique({
          where: { referralCode: code },
        });
        if (!existingUser) {
          return code;
        }
      }
    };

    const newReferralCode = await generateUniqueReferralCode();

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        profilePicture: profilePicture || null,
        referralCode: newReferralCode,
        walletBalance: 0,
        referralActive: true,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    return res.json({
      status: 200,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          profilePicture: user.profilePicture,
          referralCode: user.referralCode,
          walletBalance: user.walletBalance,
          referralActive: user.referralActive,
        },
        token,
      },
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Invalid input data", errors: error.errors });
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

clientRouter.get(
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
        select: {
          profilePicture: true,
          name: true,
          walletBalance: true,
          referredWith: true,
          referralCode: true,
          referralActive: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        status: 200,
        profileUrl: user.profilePicture || null,
        name: user.name,
        walletBalance: user.walletBalance,
        referredWith: user.referredWith,
        referralCode: user.referralActive ? user.referralCode : null,
        message: "Profile URL retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching profile URL:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

clientRouter.get(
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

clientRouter.get(
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

clientRouter.post(
  "/create-booking",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const {
        serviceId,
        name,
        phone,
        address,
        notes,
        bookingDate,
        useWalletBalance,
      } = req.body;

      if (!bookingDate) {
        return res.status(400).json({ message: "Booking date is required" });
      }

      if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service || !service.status) {
        return res.status(400).json({ message: "Service not available" });
      }

      // Calculate wallet balance usage
      let finalAmount = service.price;
      let newWalletBalance = user.walletBalance;

      if (useWalletBalance && user.walletBalance > 0) {
        if (service.price <= user.walletBalance) {
          newWalletBalance = user.walletBalance - service.price;
          finalAmount = 0;
        } else {
          finalAmount = service.price - user.walletBalance;
          newWalletBalance = 0;
        }
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

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Use transaction to update both booking and user wallet
      const [booking, updatedUser] = await prisma.$transaction([
        prisma.booking.create({
          data: {
            userId,
            serviceId,
            addressId: userAddress.id,
            name,
            phone,
            datetime: new Date(bookingDate),
            status: "PENDING",
            totalAmount: finalAmount,
            paymentStatus: "PENDING",
            notes,
            otp,
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { walletBalance: newWalletBalance },
        }),
      ]);

      const formattedDateTime = format(
        new Date(booking.datetime),
        "MMMM d, yyyy 'at' h:mm a"
      );
      const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(booking.totalAmount);

      const walletMessage =
        useWalletBalance && user.walletBalance > 0
          ? ` (₹${
              user.walletBalance - newWalletBalance
            } used from wallet balance)`
          : "";

      const whatsappMessage = `Zoto Platforms: Your booking for ${service.name} has been confirmed for ${formattedDateTime}. Total amount: ${formattedAmount}${walletMessage}. Your OTP for order completion is: ${otp}. Please share this with the service provider when they complete the service. Thank you for choosing Zoto Platforms!`;
      await sendWhatsAppNotification(phone, whatsappMessage);

      return res.status(200).json({
        status: 200,
        data: booking,
        message: "Booking created successfully and WhatsApp notification sent",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

clientRouter.get(
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
          serviceAssigned: {
            include: {
              vendor: {
                select: {
                  name: true,
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

      const formattedOrders = orders.map((order) => ({
        ...order,
        otp: order.otp,
        vendorName: order.serviceAssigned?.vendor.name || "",
        vendorPhone: order.serviceAssigned?.vendor.phone || "",
      }));

      const totalOrders = await prisma.booking.count({ where: { userId } });
      const totalPages = Math.ceil(totalOrders / limit);

      return res.status(200).json({
        status: 200,
        data: {
          orders: formattedOrders,
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

clientRouter.post(
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

const referralRedemptionSchema = z.object({
  referralCode: z.string().length(8),
});

clientRouter.post(
  "/redeem-referral",
  verifyToken,
  async (req: AuthRequest, res: express.Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { referralCode } = referralRedemptionSchema.parse(req.body);

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          phone: true,
          referredWith: true,
          referrerId: true,
        },
      });

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (currentUser.referredWith || currentUser.referrerId) {
        return res
          .status(400)
          .json({ message: "You have already used a referral code" });
      }

      const referrerUser = await prisma.user.findUnique({
        where: { referralCode },
        select: {
          id: true,
          name: true,
          phone: true,
          referralActive: true,
        },
      });

      if (!referrerUser) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      if (!referrerUser.referralActive) {
        return res
          .status(400)
          .json({ message: "This referral code has already been used" });
      }

      if (referrerUser.id === userId) {
        return res
          .status(400)
          .json({ message: "You cannot use your own referral code" });
      }

      const [updatedReferrer, updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: referrerUser.id },
          data: {
            walletBalance: { increment: 500 },
            referralActive: false,
          },
          select: {
            name: true,
            walletBalance: true,
          },
        }),

        prisma.user.update({
          where: { id: userId },
          data: {
            referredWith: referralCode,
            referrerId: referrerUser.id,
            walletBalance: { increment: 500 },
          },
          select: {
            name: true,
            walletBalance: true,
          },
        }),
      ]);

      const referralMessage = `Congratulations! You've earned ₹500 in your Zoto wallet for referring ${currentUser.name}!`;
      await sendWhatsAppNotification(referrerUser.phone, referralMessage);

      const welcomeMessage = `Congratulations! You've earned ₹500 in your wallet for using ${referrerUser.name}'s referral code!`;
      await sendWhatsAppNotification(currentUser.phone, welcomeMessage);

      return res.json({
        status: 200,
        data: {
          message: "Referral code redeemed successfully",
          currentUser: {
            name: updatedUser.name,
            newBalance: updatedUser.walletBalance,
          },
          referrer: {
            name: updatedReferrer.name,
            newBalance: updatedReferrer.walletBalance,
          },
        },
      });
    } catch (error) {
      console.error("Error redeeming referral:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors,
        });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default clientRouter;
