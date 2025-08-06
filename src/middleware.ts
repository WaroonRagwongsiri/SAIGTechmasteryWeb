import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/regis-login", request.url));
	}

	try {
		const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
		const { payload } = await jwtVerify(token, secret);

		// Set user ID in headers (using 'id' field from your token)
		request.headers.set("x-user-id", payload.id as string);
		return NextResponse.next();
	} catch (err) {
		console.log("JWT verification failed:", err);
		return NextResponse.redirect(new URL("/regis-login", request.url));
	}
}

export const config = {
	matcher: ["/", "/bookings", "/bookings/:path*", "/mate", "/mate/:path*", "/profile"],
};
