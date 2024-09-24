import express from "express";
import { PrismaClient } from "@prisma/client";
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

export default vendorRouter;
