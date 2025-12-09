import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check availability
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            if (!existingUser.passwordHash) {
                return NextResponse.json(
                    { error: "This email is linked to a magic-link account. Please reset your password." },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: "An account with this email already exists. Please sign in." },
                { status: 409 }
            );
        }

        // Create user
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: name || null,
                passwordHash,
                role: "user",
                plan: "free",
                onboarded: false,
            },
        });

        console.log("AUTH DEBUG: created account", newUser.id, normalizedEmail);

        return NextResponse.json({
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });

    } catch (error) {
        console.error("REGISTRATION ERROR:", error);
        return NextResponse.json(
            { error: "Something went wrong while creating your account." },
            { status: 500 }
        );
    }
}
