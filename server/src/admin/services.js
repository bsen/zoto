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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const services = [
    {
        name: "Bathroom Cleaning",
        description: "Detailed cleaning and sanitization of all bathroom fixtures, tiles, and surfaces.",
        price: 1499,
        image: "/bathroom-cleaning.png",
        duration: 150,
        rating: 4.8,
        reviewCount: 1243,
        status: true,
    },
    {
        name: "Home Cleaning",
        description: "Comprehensive cleaning for your entire home, including dusting, vacuuming, and mopping.",
        price: 2499,
        image: "/home-cleaning.png",
        duration: 300,
        rating: 4.8,
        reviewCount: 1243,
        status: true,
    },
    {
        name: "Kitchen Deep Clean",
        description: "Thorough cleaning of all kitchen surfaces, appliances, and cabinets to ensure a hygienic cooking space.",
        price: 1999,
        image: "/kitchen-cleaning.png",
        duration: 210,
        rating: 4.8,
        reviewCount: 1243,
        status: true,
    },
    {
        name: "AC Service",
        description: "Professional AC maintenance and repair services to keep your cooling system in top condition.",
        price: 1999,
        image: "/ac-service.png",
        duration: 150,
        rating: 4.8,
        reviewCount: 1243,
        status: false,
    },
    {
        name: "Fridge Repair",
        description: "Professional repair and maintenance services for all types of refrigerators and freezers.",
        price: 999,
        image: "/fridge-repair.png",
        duration: 120,
        rating: 4.8,
        reviewCount: 1243,
        status: false,
    },
    {
        name: "Washing Machine Repair",
        description: "Expert repair and maintenance services for all types of washing machines and dryers.",
        price: 799,
        image: "/washing-machine-repair.png",
        duration: 90,
        rating: 4.8,
        reviewCount: 1243,
        status: false,
    },
];
function addServices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let category = yield prisma.category.findFirst({
                where: { name: "Home Services" },
            });
            if (!category) {
                category = yield prisma.category.create({
                    data: {
                        name: "Home Services",
                        icon: "🏠",
                    },
                });
                console.log("Created Home Services category");
            }
            for (const serviceData of services) {
                const { rating, reviewCount, status, image } = serviceData, serviceDetails = __rest(serviceData, ["rating", "reviewCount", "status", "image"]);
                const service = yield prisma.service.create({
                    data: Object.assign(Object.assign({}, serviceDetails), { images: [image], category: {
                            connect: { id: category.id },
                        } }),
                });
                console.log(`Added service: ${service.name}`);
            }
            console.log("All services have been added successfully.");
        }
        catch (error) {
            console.error("Error adding services:", error);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
addServices();
