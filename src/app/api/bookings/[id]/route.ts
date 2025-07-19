// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  let userRole: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id: string, role: string };
    userId = decoded.id;
    userRole = decoded.role;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const bookingId = params.id;
    
    // Build where clause based on user role
    const whereClause: any = { id: bookingId };
    
    if (userRole === "RENTER") {
      whereClause.renterId = userId;
    } else if (userRole === "MATE") {
      whereClause.mateId = userId;
    }

    const booking = await prisma.booking.findFirst({
      where: whereClause,
      include: {
        renter: {
          select: { firstName: true, lastName: true }
        },
        mate: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}