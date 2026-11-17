import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  loadCRMDataFromSQLite,
  saveCRMDataToSQLite,
  getSQLiteStats,
  exportSQLiteDatabaseBuffer,
  importSQLiteDatabaseBuffer,
  getAppStateValue,
  setAppStateValue,
} from "./server/sqliteDb";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with generous limits to support embedded high-fidelity assets (files, images, etc.)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.error("Error creating data directory:", e);
    }
  }

  // Ensure SQLite database is initialized on boot (migrates crm_data.json if present)
  try {
    const initialStats = getSQLiteStats();
    console.log(
      `SQLite database ready at ${initialStats.dbPath} (${initialStats.totalRecords} records, mode=${initialStats.journalMode})`
    );
  } catch (e) {
    console.error("Failed to initialize SQLite database:", e);
  }

  // API endpoints (SQLite-backed)
  app.get("/api/crm-data", (_req, res) => {
    try {
      const data = loadCRMDataFromSQLite();
      res.json(data);
    } catch (e) {
      console.error("Error loading CRM data from SQLite:", e);
      res.status(500).json({ error: "Fehler beim Laden aus der SQLite-Datenbank" });
    }
  });

  app.post("/api/crm-data", (req, res) => {
    try {
      const newData = req.body;
      if (!newData || typeof newData !== "object") {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const stats = saveCRMDataToSQLite(newData);
      res.json({ success: true, stats });
    } catch (e) {
      console.error("Error saving CRM data to SQLite:", e);
      res.status(500).json({ error: "Fehler beim Speichern in die SQLite-Datenbank" });
    }
  });

  app.get("/api/sqlite/status", (_req, res) => {
    try {
      const stats = getSQLiteStats();
      res.json(stats);
    } catch (e) {
      console.error("Error reading SQLite stats:", e);
      res.status(500).json({ error: "Fehler beim Abrufen des SQLite-Status" });
    }
  });

  app.get("/api/sqlite/download", (_req, res) => {
    try {
      const dbBuffer = exportSQLiteDatabaseBuffer();
      const dateStr = new Date().toISOString().split("T")[0];
      res.setHeader("Content-Type", "application/x-sqlite3");
      res.setHeader("Content-Disposition", `attachment; filename="crm_datenbank_${dateStr}.db"`);
      res.send(dbBuffer);
    } catch (e) {
      console.error("Error downloading SQLite file:", e);
      res.status(500).json({ error: "Fehler beim Export der SQLite-Datenbankdatei" });
    }
  });

  app.get("/api/sqlite/export-json", (_req, res) => {
    try {
      const data = loadCRMDataFromSQLite();
      const stats = getSQLiteStats();
      const dateStr = new Date().toISOString().split("T")[0];
      const jsonPayload = JSON.stringify(data, null, 2);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="crm_sqlite_backup_${dateStr}.json"`);
      res.setHeader("X-SQLite-Total-Records", String(stats.totalRecords));
      res.send(jsonPayload);
    } catch (e) {
      console.error("Error exporting SQLite database as JSON:", e);
      res.status(500).json({ error: "Fehler beim JSON-Export der SQLite-Datenbank" });
    }
  });

  app.post("/api/sqlite/import-db", (req, res) => {
    try {
      const { base64 } = req.body || {};
      if (typeof base64 !== "string" || !base64.trim()) {
        return res.status(400).json({ error: "Keine gültige SQLite-Datei übermittelt" });
      }
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const buffer = Buffer.from(cleanBase64, "base64");
      const result = importSQLiteDatabaseBuffer(buffer);
      res.json({ success: true, data: result.data, stats: result.stats });
    } catch (e: any) {
      console.error("Error importing SQLite file:", e);
      res.status(400).json({ error: e?.message || "Ungültige SQLite-Datenbankdatei" });
    }
  });

  app.get("/api/sqlite/settings/:key", (req, res) => {
    try {
      const val = getAppStateValue(req.params.key);
      res.json({ key: req.params.key, value: val });
    } catch (e) {
      console.error("Error reading SQLite setting:", e);
      res.status(500).json({ error: "Fehler beim Lesen der Einstellung" });
    }
  });

  app.post("/api/sqlite/settings/:key", (req, res) => {
    try {
      const value = req.body?.value !== undefined ? String(req.body.value) : "";
      setAppStateValue(req.params.key, value);
      res.json({ success: true, key: req.params.key, value });
    } catch (e) {
      console.error("Error writing SQLite setting:", e);
      res.status(500).json({ error: "Fehler beim Speichern der Einstellung" });
    }
  });

  app.post("/api/debug-log", (req, res) => {
    try {
      const logFilePath = path.join(process.cwd(), "data", "client_debug.json");
      let logs = [];
      if (fs.existsSync(logFilePath)) {
        try {
          logs = JSON.parse(fs.readFileSync(logFilePath, "utf-8"));
        } catch (e) {
          logs = [];
        }
      }
      logs.push({
        timestamp: new Date().toISOString(),
        ...req.body
      });
      fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), "utf-8");
      console.log("Recorded Client Error log in client_debug.json");
      res.json({ success: true });
    } catch (e) {
      console.error("Error saving debug log:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve the standalone HTML handbook in both dev and production
  app.get(["/handbuch.html", "/HANDBUCH.html"], (_req, res) => {
    const handbookPath = path.join(process.cwd(), "HANDBUCH.html");
    if (!fs.existsSync(handbookPath)) {
      return res.status(404).send("HANDBUCH.html nicht gefunden.");
    }
    res.sendFile(handbookPath);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
