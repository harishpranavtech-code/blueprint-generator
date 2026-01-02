import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params
    const { id } = await context.params;

    const { section } = await req.json();

    if (!section) {
      return NextResponse.json(
        { error: "Section is required" },
        { status: 400 }
      );
    }

    // Get existing blueprint
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

    console.log(`🔄 Regenerating ${section} for:`, blueprint.projectName);

    // Generate prompt based on section
    let prompt = "";
    let responseFormat = "";

    switch (section) {
      case "features":
        prompt = `Given this project idea: "${blueprint.idea}"
        
Generate ONLY a features roadmap in JSON format:
{
  "mvp": ["feature1", "feature2", "feature3"],
  "phase2": ["feature1", "feature2"],
  "phase3": ["feature1", "feature2"]
}`;
        responseFormat = "features object";
        break;

      case "techStack":
        prompt = `Given this project idea: "${blueprint.idea}"
        
Generate ONLY a tech stack recommendation in JSON format:
{
  "frontend": "technology",
  "backend": "technology",
  "database": "technology",
  "auth": "technology",
  "hosting": "technology"
}`;
        responseFormat = "techStack object";
        break;

      case "database":
        prompt = `Given this project idea: "${blueprint.idea}"
        
Generate ONLY a database schema in JSON format:
{
  "tables": [
    {
      "name": "table_name",
      "fields": ["id", "field1", "field2"],
      "relations": "description"
    }
  ]
}`;
        responseFormat = "database object";
        break;

      case "roadmap":
        prompt = `Given this project idea: "${blueprint.idea}"
        
Generate ONLY a 3-month development roadmap in JSON format:
{
  "month1": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"],
  "month2": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"],
  "month3": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"]
}`;
        responseFormat = "roadmap object";
        break;

      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert software architect. Generate only the requested ${responseFormat} in valid JSON format with no markdown or explanations.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = completion.choices[0].message.content;
    console.log("✅ OpenAI Response received");

    // Clean and parse JSON
    let cleanContent = content?.trim() || "";
    cleanContent = cleanContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    const newSectionData = JSON.parse(cleanContent);

    // Update blueprint with new section
    const updateData: Prisma.BlueprintUpdateInput = {
      [section]: newSectionData,
    };

    const updated = await prisma.blueprint.update({
      where: { id },
      data: updateData,
    });

    console.log(`💾 ${section} updated successfully`);

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("❌ Regeneration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to regenerate section";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
