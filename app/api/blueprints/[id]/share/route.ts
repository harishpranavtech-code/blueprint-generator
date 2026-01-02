import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Get blueprint
    const blueprint = await prisma.blueprint.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    // Generate share token if doesn't exist
    const shareToken = blueprint.shareToken || nanoid(12);

    // Update blueprint to be public
    const updated = await prisma.blueprint.update({
      where: { id },
      data: {
        isPublic: true,
        shareToken,
      },
    });

    console.log("✅ Blueprint shared:", updated.shareToken);

    return NextResponse.json({
      shareToken: updated.shareToken,
      shareUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/share/${updated.shareToken}`,
    });
  } catch (error: unknown) {
    console.error("❌ Share error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to share blueprint";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Get blueprint
    const blueprint = await prisma.blueprint.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    // Make blueprint private
    const updated = await prisma.blueprint.update({
      where: { id },
      data: {
        isPublic: false,
      },
    });

    console.log("✅ Blueprint made private");

    return NextResponse.json({
      message: "Blueprint is no longer shared",
      updated,
    });
  } catch (error: unknown) {
    console.error("❌ Unshare error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to unshare blueprint";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
