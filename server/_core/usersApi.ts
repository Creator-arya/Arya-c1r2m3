import type { Express, Request, Response } from "express";
import * as db from "../db";

export function registerUsersApiRoutes(app: Express) {
  // Get all users (admin only)
  app.get("/api/users/list", async (req: Request, res: Response) => {
    try {
      const token = req.cookies["manus_session"];
      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const users = await db.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("[Users API] Error fetching users", error);
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  // Create user (admin only)
  app.post("/api/users/create", async (req: Request, res: Response) => {
    try {
      const token = req.cookies["manus_session"];
      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { username, password, name, email, role } = req.body;

      if (!username || !password || !name) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      await db.createUser(username, password, name, email || "", role || "user");

      res.json({ success: true, message: "User created successfully" });
    } catch (error) {
      console.error("[Users API] Error creating user", error);
      res.status(500).json({ error: "Error creating user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const token = req.cookies["manus_session"];
      if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      await db.deleteUser(parseInt(id));

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("[Users API] Error deleting user", error);
      res.status(500).json({ error: "Error deleting user" });
    }
  });
}
