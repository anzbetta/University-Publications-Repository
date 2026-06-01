import { Router } from "express";
import { driver, database } from "../db";

const router = Router();

const mapRecommendation = (
  p: any,
  authors: string[] | undefined,
  keywords: string[] | undefined,
  score: number,
  commonKeywords: number,
  commonAuthors: number,
  likesCount: number,
  viewsCount: number,
) => ({
  id: String(p.publicationId),
  authors: (Array.isArray(authors) ? authors : []).join(", "),
  title: p.title || "",
  publicationType: p.publicationType || "",
  doi: p.doi || "",
  issn: "",
  isbn: "",
  keywords: (Array.isArray(keywords) ? keywords : []).join(", "),
  annotation: p.abstract || "",
  faculty: p.faculty || "",
  department: p.department || "",
  year: String(p.year || ""),
  fileName: `publication-${p.publicationId}.pdf`,
  status: "approved",
  submittedBy: (Array.isArray(authors) ? authors : [])[0] || "system",
  submittedDate: `${p.year || new Date().getFullYear()}-01-01`,
  score,
  commonKeywords,
  commonAuthors,
  likesCount,
  viewsCount,
  reasons: [] as string[],
});

// User-specific recommendations
router.get("/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const session = driver.session({ database });
  const currentYear = new Date().getFullYear();
  const recentCutoff = currentYear - 2;

  try {
    const userQuery = `
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[:VIEWED|LIKED]->(seen:Publication)
      OPTIONAL MATCH (seen)-[:HAS_KEYWORD]->(uk:Keyword)
      OPTIONAL MATCH (a:Author)-[:WROTE]->(seen)

      WITH u, collect(DISTINCT seen.publicationId) AS seenIds, collect(DISTINCT uk.name) AS userKeywords, collect(DISTINCT a.fullName) AS userAuthors

      MATCH (rec:Publication)
      WHERE NOT rec.publicationId IN seenIds

      OPTIONAL MATCH (rec)-[:HAS_KEYWORD]->(kw:Keyword)
      OPTIONAL MATCH (auth:Author)-[:WROTE]->(rec)

      OPTIONAL MATCH (other:User)-[:VIEWED|LIKED]->(common:Publication)
      WHERE common.publicationId IN seenIds AND other.userId <> $userId
      OPTIONAL MATCH (other)-[:LIKED]->(rec)
      OPTIONAL MATCH (other)-[:VIEWED]->(rec)

      WITH rec,
           count(DISTINCT CASE WHEN kw.name IN userKeywords THEN kw END) AS commonKeywords,
           count(DISTINCT CASE WHEN auth.fullName IN userAuthors THEN auth END) AS commonAuthors,
           count(DISTINCT CASE WHEN (other)-[:LIKED]->(rec) THEN other END) AS likedBySimilarUsers,
           count(DISTINCT CASE WHEN (other)-[:VIEWED]->(rec) THEN other END) AS viewedBySimilarUsers,
           count { MATCH (:User)-[:LIKED]->(rec) } AS likesCount,
           count { MATCH (:User)-[:VIEWED]->(rec) } AS viewsCount

      OPTIONAL MATCH (a2:Author)-[:WROTE]->(rec)
      OPTIONAL MATCH (rec)-[:HAS_KEYWORD]->(k2:Keyword)

      WITH rec,
           commonKeywords,
           commonAuthors,
           likedBySimilarUsers,
           viewedBySimilarUsers,
           likesCount,
           viewsCount,
           CASE WHEN toInteger(coalesce(rec.year, $currentYear)) >= $recentCutoff THEN 2 ELSE 0 END AS recentBonus,
           collect(DISTINCT a2.fullName) AS authors,
           collect(DISTINCT k2.name) AS keywords

      WITH rec,
           commonKeywords,
           commonAuthors,
           likedBySimilarUsers,
           viewedBySimilarUsers,
           likesCount,
           viewsCount,
           recentBonus,
           (commonKeywords * 3 + commonAuthors * 5 + likedBySimilarUsers * 7 + viewedBySimilarUsers * 3 + likesCount * 2 + viewsCount + recentBonus) AS score,
           authors,
           keywords

      RETURN rec AS publication, score AS score, commonKeywords AS commonKeywords, commonAuthors AS commonAuthors, likesCount AS likesCount, viewsCount AS viewsCount, likedBySimilarUsers AS likedBySimilarUsers, viewedBySimilarUsers AS viewedBySimilarUsers, authors AS authors, keywords AS keywords
      ORDER BY score DESC
      LIMIT 12
    `;

    const result = await session.run(userQuery, {
      userId,
      currentYear,
      recentCutoff,
    });

    const withReasons = result.records.map((record) => {
      const p = record.get("publication").properties;
      const reasons: string[] = [];
      if (Number(record.get("commonKeywords")) > 0)
        reasons.push("Схожі ключові слова");
      if (Number(record.get("commonAuthors")) > 0) reasons.push("Ті ж автори");
      if (Number(record.get("likedBySimilarUsers")) > 0)
        reasons.push("Популярна серед користувачів зі схожими інтересами");
      if (Number(record.get("viewedBySimilarUsers")) > 0)
        reasons.push("Переглядають користувачі зі схожими інтересами");

      const base = mapRecommendation(
        p,
        record.get("authors") as string[],
        record.get("keywords") as string[],
        Number(record.get("score")),
        Number(record.get("commonKeywords")),
        Number(record.get("commonAuthors")),
        Number(record.get("likesCount")),
        Number(record.get("viewsCount")),
      );

      return { ...base, reasons };
    });

    res.json(withReasons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user recommendations" });
  } finally {
    await session.close();
  }
});

// Generic publication-based recommendations
router.get("/:id", async (req, res) => {
  const publicationId = Number(req.params.id);
  const session = driver.session({ database });

  try {
    const result = await session.run(
      `
      MATCH (base:Publication {publicationId: $publicationId})
      MATCH (base)-[:HAS_KEYWORD]->(k:Keyword)<-[:HAS_KEYWORD]-(rec:Publication)
      WHERE rec.publicationId <> base.publicationId

      OPTIONAL MATCH (baseAuthor:Author)-[:WROTE]->(base)
      OPTIONAL MATCH (baseAuthor)-[:WROTE]->(rec)

      WITH rec,
           count(DISTINCT k) AS commonKeywords,
           count(DISTINCT baseAuthor) AS commonAuthors

      WITH rec,
           commonKeywords,
           commonAuthors,
           count { MATCH (:User)-[:LIKED]->(rec) } AS likesCount,
           count { MATCH (:User)-[:VIEWED]->(rec) } AS viewsCount

      WITH rec,
           commonKeywords,
           commonAuthors,
           likesCount,
           viewsCount,
           commonKeywords * 3 + commonAuthors * 5 + likesCount * 2 + viewsCount AS score

      OPTIONAL MATCH (a:Author)-[:WROTE]->(rec)
      OPTIONAL MATCH (rec)-[:HAS_KEYWORD]->(kw:Keyword)

            RETURN rec AS publication,
              score AS score,
              commonKeywords AS commonKeywords,
              commonAuthors AS commonAuthors,
              likesCount AS likesCount,
              viewsCount AS viewsCount,
              collect(DISTINCT a.fullName) AS authors,
              collect(DISTINCT kw.name) AS keywords
      ORDER BY score DESC
      LIMIT 6
      `,
      { publicationId },
    );

    const recommendations = result.records.map((record) => {
      const publication = record.get("publication").properties;

      return mapRecommendation(
        publication,
        record.get("authors") as string[],
        record.get("keywords") as string[],
        Number(record.get("score")),
        Number(record.get("commonKeywords")),
        Number(record.get("commonAuthors")),
        Number(record.get("likesCount")),
        Number(record.get("viewsCount")),
      );
    });

    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  } finally {
    await session.close();
  }
});

export default router;
