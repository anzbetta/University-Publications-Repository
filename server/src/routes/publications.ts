import { Router } from "express";
import { driver, database } from "../db";

const router = Router();

const toNumber = (value: any): number => {
  if (typeof value === "number") {
    return value;
  }

  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value || 0);
};

const mapPublication = (p: any, authors: string[], keywords: string[]) => {
  const publicationId = toNumber(p.publicationId);
  const year = toNumber(p.year);

  return {
    id: String(publicationId),
    authors: authors.join(", "),
    title: p.title || "",
    publicationType: p.publicationType || "",
    doi: p.doi || "",
    issn: "",
    isbn: "",
    keywords: keywords.join(", "),
    annotation: p.abstract || "",
    faculty: p.faculty || "",
    department: p.department || "",
    year: String(year || ""),
    fileName: `publication-${publicationId}.pdf`,
    status: "approved",
    submittedBy: authors[0] || "system",
    submittedDate: `${year || new Date().getFullYear()}-01-01`,
    reviewedBy: "admin@university.edu",
    reviewedDate: `${year || new Date().getFullYear()}-01-02`,
  };
};

router.get("/", async (_req, res) => {
  const session = driver.session({ database });

  try {
    const result = await session.run(`
      MATCH (p:Publication)
      OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
      OPTIONAL MATCH (p)-[:HAS_KEYWORD]->(k:Keyword)
      RETURN p,
             collect(DISTINCT a.fullName) AS authors,
             collect(DISTINCT k.name) AS keywords
      ORDER BY p.publicationId ASC
    `);

    const publications = result.records.map((record) => {
      const publication = record.get("p").properties;
      const authors = record.get("authors") as string[];
      const keywords = record.get("keywords") as string[];

      return mapPublication(publication, authors, keywords);
    });

    res.json(publications);
  } catch (error) {
    console.error("Failed to fetch publications:", error);
    res.status(500).json({ message: "Failed to fetch publications" });
  } finally {
    await session.close();
  }
});

router.get("/:id", async (req, res) => {
  const publicationId = Number(req.params.id);
  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (p:Publication {publicationId: $publicationId})
      OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
      OPTIONAL MATCH (p)-[:HAS_KEYWORD]->(k:Keyword)
      RETURN p,
             collect(DISTINCT a.fullName) AS authors,
             collect(DISTINCT k.name) AS keywords
      `,
      { publicationId },
    );

    if (!result.records.length) {
      res.status(404).json({ message: "Publication not found" });
      return;
    }

    const record = result.records[0];
    const publication = record.get("p").properties;
    const authors = record.get("authors") as string[];
    const keywords = record.get("keywords") as string[];

    res.json(mapPublication(publication, authors, keywords));
  } catch (error) {
    console.error("Failed to fetch publication:", error);
    res.status(500).json({ message: "Failed to fetch publication" });
  } finally {
    await session.close();
  }
});

export default router;
