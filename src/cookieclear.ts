import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const response = NextResponse.json({ message: "All cookies reset" });

  // Suppose you know the cookie names in advance:
  const cookiesToClear = ["token", "sessionId", "userPref"];

  cookiesToClear.forEach((cookieName) => {
    response.cookies.set({
      name: cookieName,
      value: "",
      path: "/",
      expires: new Date(0),
    });
  });

  return response;
}
