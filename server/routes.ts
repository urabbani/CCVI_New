import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Climate vulnerability data endpoints
  app.get("/api/indicators", async (req, res) => {
    try {
      const indicators = await storage.getAllIndicators();
      res.json(indicators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch indicators" });
    }
  });

  app.get("/api/vulnerability-data", async (req, res) => {
    try {
      const { state, indicator } = req.query;
      const data = await storage.getVulnerabilityData(
        state as string,
        indicator as string
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vulnerability data" });
    }
  });

  app.post("/api/export-data", async (req, res) => {
    try {
      const { format, filters } = req.body;
      
      // In a real implementation, this would generate the appropriate export format
      const exportData = await storage.generateExportData(filters);
      
      res.json({
        success: true,
        data: exportData,
        message: "Data exported successfully"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
