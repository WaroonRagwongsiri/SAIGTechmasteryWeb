// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { mateId, activity, date, startTime, endTime } = await req.json();

    // Validate required fields
    if (!mateId || !activity || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if mate exists and is available
    const mate = await prisma.mateProfile.findUnique({
      where: { userId: mateId },
      include: { user: true }
    });

    if (!mate) {
      return NextResponse.json(
        { error: "Mate not found" },
        { status: 404 }
      );
    }

    if (!mate.isAvailable) {
      return NextResponse.json(
        { error: "Mate is not available for booking" },
        { status: 400 }
      );
    }

    // Check for conflicts with existing bookings
    const bookingDate = new Date(date);
    const existingBooking = await prisma.booking.findFirst({
      where: {
        mateId,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalAmount = hours * mate.hourlyRate;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        renterId: userId,
        mateId,
        activity,
        date: bookingDate,
        startTime,
        endTime,
        totalAmount,
        status: 'PENDING'
      },
      include: {
        renter: true,
        mate: true
      }
    });

    return NextResponse.json({
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        renterId: userId
      },
      include: {
        mate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}