// api/bookings/[id]/rating/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const body = await req.json();
		const { rating } = body;

		if (typeof rating !== "number") {
			return new Response(JSON.stringify({ error: "Invalid rating" }), { status: 400 });
		}

		const updated = await prisma.$transaction(async (tx) => {
			const bookings = await tx.booking.findUnique({
				where: { id: params.id },
			});

			if (!bookings) throw new Error("Booking Not Found")

			const mateUser = await tx.user.findUnique({
				where: { id: bookings.mateId },
			})

			if (!mateUser) throw new Error("Mate Not Found")

			const mate = await tx.mateProfile.findUnique({
				where: { userId: mateUser?.id },
			})

			if (!mate) throw new Error("Mate Not Found");

			const newRating =
				(mate.rating! * mate.ratingCount + rating) / (mate.ratingCount + 1);

			return await tx.mateProfile.update({
				where: { id: mate.id },
				data: {
					rating: newRating,
					ratingCount: mate.ratingCount + 1,
				},
			});
		});
		if (!updated) {
			return new Response(JSON.stringify({ error: "Failed to update rating" }), { status: 404 });
		}
		await prisma.booking.delete({ where: { id: params.id } });
		return new Response(JSON.stringify(updated), { status: 200 });
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify({ error: "Failed to update rating" }), { status: 500 });
	}
}