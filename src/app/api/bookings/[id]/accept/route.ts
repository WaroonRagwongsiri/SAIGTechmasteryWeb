import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "PAYMENT_PENDING" },
    });
    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to accept booking" }, { status: 500 });
  }
}
