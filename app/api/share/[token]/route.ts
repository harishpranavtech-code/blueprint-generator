import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    const blueprint = await prisma.blueprint.findFirst({
      where: {
        shareToken: token,
        isPublic: true,
      },
      select: {
        id: true,
        projectName: true,
        idea: true,
        features: true,
        techStack: true,
        database: true,
        roadmap: true,
        createdAt: true,
        isPublic: true,
        shareToken: true,
        // userId is NOT selected
      },
    });

    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(blueprint);
  } catch (error: unknown) {
    console.error("❌ Fetch shared blueprint error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blueprint" },
      { status: 500 }
    );
  }
}
