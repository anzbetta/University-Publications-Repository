import { Router } from "express";
import { driver, database } from "../db";

const router = Router();

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }

  if (
    value &&
    typeof (value as { toNumber?: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return Number(value || 0);
};

const mapPublication = (
  publication: any,
  authors: string[],
  keywords: string[],
) => {
  const publicationId = toNumber(publication.publicationId);
  const year = toNumber(publication.year);

  return {
    id: String(publicationId),
    authors: authors.join(", "),
    title: publication.title || "",
    publicationType: publication.publicationType || "",
    doi: publication.doi || "",
    issn: "",
    isbn: "",
    keywords: keywords.join(", "),
    annotation: publication.abstract || "",
    faculty: publication.faculty || "",
    department: publication.department || "",
    year: String(year || ""),
    fileName: `publication-${publicationId}.pdf`,
    status: "approved" as const,
    submittedBy: authors[0] || "system",
    submittedDate: `${year || new Date().getFullYear()}-01-01`,
    reviewedBy: "admin@university.edu",
    reviewedDate: `${year || new Date().getFullYear()}-01-02`,
  };
};

router.get("/liked/:userId/:publicationId", async (req, res) => {
  const userId = Number(req.params.userId);
  const publicationId = Number(req.params.publicationId);

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !Number.isInteger(publicationId) ||
    publicationId <= 0
  ) {
    return res.status(400).json({ message: "Invalid userId or publicationId" });
  }

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[r:LIKED]->(p:Publication {publicationId: $publicationId})
      RETURN count(r) > 0 AS liked
      `,
      { userId, publicationId },
    );

    const liked = Boolean(result.records[0]?.get("liked"));
    return res.json({ liked });
  } catch (error) {
    console.error("Failed to check liked publication:", error);
    return res
      .status(500)
      .json({ message: "Failed to check liked publication" });
  } finally {
    await session.close();
  }
});

router.get("/liked/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  console.log("GET liked publications:", { userId });

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:LIKED]->(p:Publication)
      OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
      OPTIONAL MATCH (p)-[:HAS_KEYWORD]->(k:Keyword)
      WITH p AS publication,
           collect(DISTINCT a.fullName) AS authors,
           collect(DISTINCT k.name) AS keywords,
           max(r.likedAt) AS activityDate
      RETURN publication,
             authors,
             keywords,
             activityDate
      ORDER BY activityDate DESC
      `,
      { userId },
    );

    const publications = result.records.map((record) => {
      const publication = record.get("publication").properties;
      const authors = (
        record.get("authors") as Array<string | null | undefined>
      ).filter((author): author is string => Boolean(author));
      const keywords = (
        record.get("keywords") as Array<string | null | undefined>
      ).filter((keyword): keyword is string => Boolean(keyword));

      return mapPublication(publication, authors, keywords);
    });

    res.json(publications);
  } catch (error) {
    console.error("Failed to fetch liked publications:", error);
    res.status(500).json({ message: "Failed to fetch liked publications" });
  } finally {
    await session.close();
  }
});

router.delete("/like", async (req, res) => {
  const { userId, publicationId } = req.body;
  const parsedUserId = Number(userId);
  const parsedPublicationId = Number(publicationId);

  if (
    !Number.isInteger(parsedUserId) ||
    parsedUserId <= 0 ||
    !Number.isInteger(parsedPublicationId) ||
    parsedPublicationId <= 0
  ) {
    return res
      .status(400)
      .json({ message: "userId and publicationId required" });
  }

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:LIKED]->(p:Publication {publicationId: $publicationId})
      DELETE r
      RETURN count(*) AS deleted
      `,
      { userId: parsedUserId, publicationId: parsedPublicationId },
    );

    return res.json({ success: true, liked: false });
  } catch (error) {
    console.error("Failed to remove like:", error);
    return res.status(500).json({ message: "Failed to remove like" });
  } finally {
    await session.close();
  }
});

router.get("/viewed/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  console.log("GET viewed publications:", { userId });

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:VIEWED]->(p:Publication)
      OPTIONAL MATCH (a:Author)-[:WROTE]->(p)
      OPTIONAL MATCH (p)-[:HAS_KEYWORD]->(k:Keyword)
      WITH p AS publication,
           collect(DISTINCT a.fullName) AS authors,
           collect(DISTINCT k.name) AS keywords,
           max(r.viewedAt) AS activityDate,
           max(coalesce(r.viewsCount, 0)) AS viewsCount
      RETURN publication,
             authors,
             keywords,
             activityDate,
             viewsCount
      ORDER BY activityDate DESC
      `,
      { userId },
    );

    const publications = result.records.map((record) => {
      const publication = record.get("publication").properties;
      const authors = (
        record.get("authors") as Array<string | null | undefined>
      ).filter((author): author is string => Boolean(author));
      const keywords = (
        record.get("keywords") as Array<string | null | undefined>
      ).filter((keyword): keyword is string => Boolean(keyword));

      return mapPublication(publication, authors, keywords);
    });

    res.json(publications);
  } catch (error) {
    console.error("Failed to fetch viewed publications:", error);
    res.status(500).json({ message: "Failed to fetch viewed publications" });
  } finally {
    await session.close();
  }
});

router.post("/view", async (req, res) => {
  const { userId, publicationId } = req.body;

  console.log("VIEW activity:", { userId, publicationId });

  if (!userId || !publicationId) {
    return res
      .status(400)
      .json({ message: "userId and publicationId required" });
  }

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (p:Publication {publicationId: $publicationId})
      MERGE (u)-[r:VIEWED]->(p)
      SET r.viewedAt = datetime(),
          r.viewsCount = coalesce(r.viewsCount, 0) + 1
      RETURN u, r, p
      `,
      { userId: Number(userId), publicationId: Number(publicationId) },
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "User or publication not found" });
    }

    return res.json({ message: "Viewed recorded" });
  } catch (err) {
    console.error("Failed to save view:", err);
    return res.status(500).json({ message: "Failed to record view" });
  } finally {
    await session.close();
  }
});

router.post("/like", async (req, res) => {
  const { userId, publicationId } = req.body;

  console.log("LIKE activity:", { userId, publicationId });

  if (!userId || !publicationId) {
    return res
      .status(400)
      .json({ message: "userId and publicationId required" });
  }

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (p:Publication {publicationId: $publicationId})
      MERGE (u)-[r:LIKED]->(p)
      SET r.likedAt = datetime()
      RETURN u, r, p
      `,
      { userId: Number(userId), publicationId: Number(publicationId) },
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "User or publication not found" });
    }

    return res.json({ message: "Liked" });
  } catch (err) {
    console.error("Failed to save like:", err);
    return res.status(500).json({ message: "Failed to record like" });
  } finally {
    await session.close();
  }
});

export default router;
