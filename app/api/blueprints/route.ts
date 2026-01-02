import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blueprints = await prisma.blueprint.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectName: true,
        idea: true,
        createdAt: true,
      },
    });

    return NextResponse.json(blueprints);
  } catch (error) {
    console.error("Error fetching blueprints:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
