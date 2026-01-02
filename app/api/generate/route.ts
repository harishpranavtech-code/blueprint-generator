import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { idea } = await req.json();

    if (!idea || idea.trim().length === 0) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    console.log("Generating blueprint for:", idea);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert software architect. Generate detailed project blueprints in JSON format only.",
        },
        {
          role: "user",
          content: `Generate a complete project blueprint for this idea: "${idea}"

Return ONLY valid JSON with this exact structure (no markdown, no explanations):
{
  "projectName": "Suggested project name",
  "features": {
    "mvp": ["Critical feature 1", "Critical feature 2", "Critical feature 3"],
    "phase2": ["Enhancement 1", "Enhancement 2"],
    "phase3": ["Advanced feature 1", "Advanced feature 2"]
  },
  "techStack": {
    "frontend": "Technology choice",
    "backend": "Technology choice",
    "database": "Database choice",
    "auth": "Auth solution",
    "hosting": "Hosting platform"
  },
  "database": {
    "tables": [
      {
        "name": "table_name",
        "fields": ["id", "field1", "field2"],
        "relations": "Description of relationships"
      }
    ]
  },
  "apiEndpoints": [
    "POST /api/endpoint1 - Description",
    "GET /api/endpoint2 - Description"
  ],
  "roadmap": {
    "month1": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"],
    "month2": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"],
    "month3": ["Week 1: Task", "Week 2: Task", "Week 3: Task", "Week 4: Task"]
  }
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;

    console.log("OpenAI Response:", content);

    // Clean and parse JSON
    let cleanContent = content?.trim() || "";
    cleanContent = cleanContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    const blueprint = JSON.parse(cleanContent);

    // Save to database
    const saved = await prisma.blueprint.create({
      data: {
        userId,
        projectName: blueprint.projectName,
        idea,
        features: blueprint.features,
        techStack: blueprint.techStack,
        database: blueprint.database,
        roadmap: blueprint.roadmap,
      },
    });

    console.log("Blueprint saved:", saved.id);

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Error generating blueprint:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
