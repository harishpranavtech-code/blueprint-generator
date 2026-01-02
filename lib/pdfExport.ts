import jsPDF from "jspdf";

interface Blueprint {
  projectName: string;
  idea: string;
  features: {
    mvp: string[];
    phase2: string[];
    phase3: string[];
  };
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  database: {
    tables: Array<{
      name: string;
      fields: string[];
      relations: string;
    }>;
  };
  roadmap: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  createdAt: string;
}

export function exportBlueprintToPDF(blueprint: Blueprint) {
  try {
    const doc = new jsPDF();

    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - 2 * margin;

    // Helper to check if we need a new page
    const checkNewPage = (spaceNeeded: number) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Helper to add text with word wrap
    const addText = (text: string, size: number, isBold: boolean = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        checkNewPage(7);
        doc.text(line, margin, y);
        y += 7;
      });
    };

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(blueprint.projectName, margin, y);
    y += 12;

    // Line separator
    doc.setDrawColor(0, 102, 204);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setTextColor(0, 0, 0);

    // Date
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Created: ${new Date(blueprint.createdAt).toLocaleDateString()}`,
      margin,
      y
    );
    y += 12;

    // Original Idea
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("Original Idea", margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    addText(blueprint.idea, 10);
    y += 8;

    // Features
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("Features", margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);

    // MVP
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("MVP (Phase 1)", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.features.mvp.forEach((feature) => {
      checkNewPage(6);
      addText(`• ${feature}`, 9);
    });
    y += 4;

    // Phase 2
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Phase 2", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.features.phase2.forEach((feature) => {
      checkNewPage(6);
      addText(`• ${feature}`, 9);
    });
    y += 4;

    // Phase 3
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Phase 3", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.features.phase3.forEach((feature) => {
      checkNewPage(6);
      addText(`• ${feature}`, 9);
    });
    y += 8;

    // Tech Stack
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("Tech Stack", margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    Object.entries(blueprint.techStack).forEach(([key, value]) => {
      checkNewPage(6);
      doc.setFont("helvetica", "bold");
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 35, y);
      y += 6;
    });
    y += 8;

    // Database Schema
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("Database Schema", margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    blueprint.database.tables.forEach((table) => {
      checkNewPage(20);

      doc.setFont("helvetica", "bold");
      doc.text(`Table: ${table.name}`, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      addText(`Fields: ${table.fields.join(", ")}`, 9);
      addText(`Relations: ${table.relations}`, 9);
      y += 4;
    });
    y += 8;

    // Roadmap
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text("Development Roadmap", margin, y);
    y += 8;

    doc.setTextColor(0, 0, 0);

    // Month 1
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Month 1", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.roadmap.month1.forEach((task) => {
      checkNewPage(6);
      addText(`• ${task}`, 9);
    });
    y += 4;

    // Month 2
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Month 2", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.roadmap.month2.forEach((task) => {
      checkNewPage(6);
      addText(`• ${task}`, 9);
    });
    y += 4;

    // Month 3
    checkNewPage(15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Month 3", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    blueprint.roadmap.month3.forEach((task) => {
      checkNewPage(6);
      addText(`• ${task}`, 9);
    });

    // Add page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages} | Generated by AI Blueprint Generator`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const fileName = `${blueprint.projectName.replace(
      /\s+/g,
      "-"
    )}-blueprint.pdf`;
    doc.save(fileName);

    console.log("✅ PDF downloaded:", fileName);
  } catch (error) {
    console.error("❌ PDF Export Error:", error);
    alert("Failed to generate PDF. Please try again or download as Markdown.");
  }
}
