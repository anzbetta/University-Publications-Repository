import { Router } from "express";
import { driver, database } from "../db";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const session = driver.session({ database });

  try {
    const result = await session.run(
      `MATCH (u:User {email: $email}) RETURN u LIMIT 1`,
      { email },
    );

    if (result.records.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userNode = result.records[0].get("u").properties;

    if (String(userNode.password) !== String(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = {
      userId: Number(userNode.userId),
      name: userNode.name || "",
      email: userNode.email,
      role: userNode.role || "user",
    };

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  } finally {
    await session.close();
  }
});

export default router;
