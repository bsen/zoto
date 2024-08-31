import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ServiceData {
  name: string;
  description: string;
  price: number;
  image: string;
  duration: number;
  rating: number;
  reviewCount: number;
  status: boolean;
}

const services: ServiceData[] = [
  {
    name: "Bathroom Cleaning",
    description:
      "Detailed cleaning and sanitization of all bathroom fixtures, tiles, and surfaces.",
    price: 1499,
    image: "/bathroom-cleaning.png",
    duration: 150,
    rating: 4.8,
    reviewCount: 1243,
    status: true,
  },
  {
    name: "Home Cleaning",
    description:
      "Comprehensive cleaning for your entire home, including dusting, vacuuming, and mopping.",
    price: 2499,
    image: "/home-cleaning.png",
    duration: 300,
    rating: 4.8,
    reviewCount: 1243,
    status: true,
  },
  {
    name: "Kitchen Deep Clean",
    description:
      "Thorough cleaning of all kitchen surfaces, appliances, and cabinets to ensure a hygienic cooking space.",
    price: 1999,
    image: "/kitchen-cleaning.png",
    duration: 210,
    rating: 4.8,
    reviewCount: 1243,
    status: true,
  },
  {
    name: "AC Service",
    description:
      "Professional AC maintenance and repair services to keep your cooling system in top condition.",
    price: 1999,
    image: "/ac-service.png",
    duration: 150,
    rating: 4.8,
    reviewCount: 1243,
    status: false,
  },
  {
    name: "Fridge Repair",
    description:
      "Professional repair and maintenance services for all types of refrigerators and freezers.",
    price: 999,
    image: "/fridge-repair.png",
    duration: 120,
    rating: 4.8,
    reviewCount: 1243,
    status: false,
  },
  {
    name: "Washing Machine Repair",
    description:
      "Expert repair and maintenance services for all types of washing machines and dryers.",
    price: 799,
    image: "/washing-machine-repair.png",
    duration: 90,
    rating: 4.8,
    reviewCount: 1243,
    status: false,
  },
];

async function addServices() {
  try {
    let category = await prisma.category.findFirst({
      where: { name: "Home Services" },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Home Services",
          icon: "🏠",
        },
      });
      console.log("Created Home Services category");
    }

    for (const serviceData of services) {
      const { rating, reviewCount, status, image, ...serviceDetails } =
        serviceData;
      const service = await prisma.service.create({
        data: {
          ...serviceDetails,
          images: [image],
          category: {
            connect: { id: category.id },
          },
        },
      });
      console.log(`Added service: ${service.name}`);
    }

    console.log("All services have been added successfully.");
  } catch (error) {
    console.error("Error adding services:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addServices();
