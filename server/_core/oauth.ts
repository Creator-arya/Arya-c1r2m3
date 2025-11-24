import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface SessionPayload {
  userId: number;
  username: string;
  role: string;
}

export function registerAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password are required" });
        return;
      }

      const user = await db.getUserByUsername(username);

      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const passwordValid = await db.verifyPassword(password, user.passwordHash);

      if (!passwordValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const sessionPayload: SessionPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: "24h" });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

      await db.updateUser(user.id, {
        lastSignedIn: new Date(),
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // Check auth status
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];

      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
      const user = await db.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      console.error("[Auth] Me check failed", error);
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    return null;
  }
}
