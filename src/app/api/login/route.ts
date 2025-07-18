import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		// 1. ✅ Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		// 2. ✅ Compare passwords
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		// 3. ✅ Create JWT (only sign necessary data)
		const token = jwt.sign(
			{ id: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET!,
			{ expiresIn: "7d" }
		);

		// 4. ✅ Set HttpOnly cookie
		const response = NextResponse.json({ success: true });
		response.cookies.set({
			name: "token",
			value: token,
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
