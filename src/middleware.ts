import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/regis-login", request.url));
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET!);
		request.headers.set("x-user-id", (payload as any).sub);
		return NextResponse.next();
	} catch (err) {
		return NextResponse.redirect(new URL("/regis-login", request.url));
	}
}

export const config = {
	matcher: ["/bookings/:path*", "/mate/:path*", "/profile", "/bookings", "/mate"],
};
