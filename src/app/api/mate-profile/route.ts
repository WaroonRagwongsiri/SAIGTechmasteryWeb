import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const getUserFromToken = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { id: string; role: "MATE" | "RENTER" };
  } catch {
    return null;
  }
};

// ✅ GET /api/mate-profile
export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "MATE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const profile = await prisma.mateProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: "Server Error", detail: String(err) }, { status: 500 });
  }
}

// ✅ POST /api/mate-profile
export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "MATE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { bio, hourlyRate, isAvailable } = await req.json();

    if (typeof hourlyRate !== "number") {
      return NextResponse.json({ error: "hourlyRate must be a number" }, { status: 400 });
    }

    const updatedProfile = await prisma.mateProfile.upsert({
      where: { userId: user.id },
      update: {
        bio,
        hourlyRate,
        isAvailable: isAvailable ?? true,
      },
      create: {
        userId: user.id,
        bio,
        hourlyRate,
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (err) {
    return NextResponse.json({ error: "Server Error", detail: String(err) }, { status: 500 });
  }
}
