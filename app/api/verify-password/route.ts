import { NextResponse } from "next/server";
import { isEditPasswordValid } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!isEditPasswordValid(String(password ?? ""))) {
    return NextResponse.json({ valid: false, error: "Incorrect password." }, { status: 401 });
  }
  return NextResponse.json({ valid: true });
}
