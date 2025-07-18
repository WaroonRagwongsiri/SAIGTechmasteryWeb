import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  try {
    const mates = await prisma.mateProfile.findMany({
      where: {
        isAvailable: true,
        OR: [
          { bio: { contains: query, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ mates });
  } catch (error) {
    console.error("Error fetching mates:", error);
    return NextResponse.json({ mates: [] }, { status: 500 });
  }
}
