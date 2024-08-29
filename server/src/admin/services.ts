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
  available: boolean;
}

const services: ServiceData[] = [
  {
    name: "Home Cleaning",
    description:
      "Comprehensive cleaning for your entire home, including dusting, vacuuming, and mopping.",
    price: 2499,
    image: "/home-cleaning.png",
    duration: 300,
    rating: 4.8,
    reviewCount: 1243,
    available: true,
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
      const { rating, reviewCount, available, image, ...serviceDetails } =
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
