import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.txt");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const existing = fs.existsSync(SUBSCRIBERS_FILE)
      ? fs.readFileSync(SUBSCRIBERS_FILE, "utf8")
      : "";

    if (existing.split("\n").some((line) => line.trim() === email.trim())) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 409 });
    }

    fs.appendFileSync(SUBSCRIBERS_FILE, email.trim() + "\n", "utf8");

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (error) {
    console.log("[NEWSLETTER_POST]", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
