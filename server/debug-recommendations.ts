import { driver, database } from "./src/db";

async function run() {
  const session = driver.session({ database });
  const userId = 2;
  const currentYear = new Date().getFullYear();
  const recentCutoff = currentYear - 2;

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

  try {
    console.log("Running debug query for user", userId);
    const result = await session.run(userQuery, {
      userId,
      currentYear,
      recentCutoff,
    });
    console.log("Got", result.records.length, "records");
    function mapRecommendation(
      p: any,
      authors: string[],
      keywords: string[],
      score: number,
      commonKeywords: number,
      commonAuthors: number,
      likesCount: number,
      viewsCount: number,
    ) {
      return {
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
      };
    }

    const withReasons = result.records.map((record: any) => {
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

    console.log("Mapped recommendations count:", withReasons.length);
    console.log(JSON.stringify(withReasons[0] || {}, null, 2));
  } catch (err) {
    console.error("Debug query failed:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

run().catch((e) => console.error(e));
