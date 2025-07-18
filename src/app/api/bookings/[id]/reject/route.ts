import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.booking.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
}
