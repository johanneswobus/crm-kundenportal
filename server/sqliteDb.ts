import fs from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type {
  AdminProfile,
  AuditLog,
  BotRule,
  CalendarAppointment,
  CRMData,
  Customer,
  DirectMessage,
  InventoryProduct,
  Invoice,
  RoadmapTemplate,
  StockMovement,
  Supplier,
  SupplierOrder,
  UnresolvedQuery,
  UploadedFile,
} from "../src/types";
import { INITIAL_MOCK_DATA } from "../src/mockData";

export interface SQLiteStats {
  dbPath: string;
  fileSizeBytes: number;
  journalMode: string;
  lastSavedAt: string | null;
  tableCounts: {
    adminProfile: number;
    customers: number;
    files: number;
    messages: number;
    appointments: number;
    botRules: number;
    unresolvedQueries: number;
    invoices: number;
    customTemplates: number;
    inventoryProducts: number;
    suppliers: number;
    stockMovements: number;
    supplierOrders: number;
    auditLogs: number;
  };
  totalRecords: number;
}

const dataDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "crm.db");
const legacyJsonFilePath = path.join(dataDir, "crm_data.json");

let dbInstance: DatabaseSync | null = null;

function ensureDataDirectory(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string" || raw.trim() === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeJsonStringify(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function createSchema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = OFF;

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      iban TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bic TEXT NOT NULL,
      tax_number TEXT NOT NULL,
      hrb TEXT,
      footnote TEXT,
      password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT NOT NULL,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      approved INTEGER,
      active_phase INTEGER,
      completed_tasks_json TEXT,
      contracts_json TEXT,
      roadmap_enabled INTEGER,
      roadmap_template_id TEXT,
      roadmap_phases_json TEXT,
      roadmap_tasks_json TEXT,
      landingpage_url TEXT,
      crm_title TEXT,
      onboarding_json TEXT,
      handover_protocol_json TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size INTEGER NOT NULL,
      category TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      data_url TEXT,
      admin_note TEXT,
      status TEXT NOT NULL,
      signature_json TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      encrypted_content TEXT,
      is_encrypted INTEGER,
      timestamp TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT,
      attachment_json TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      description TEXT NOT NULL,
      customer_id TEXT,
      status TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS bot_rules (
      id TEXT PRIMARY KEY,
      trigger_keywords_json TEXT NOT NULL,
      answer TEXT NOT NULL,
      usages_count INTEGER NOT NULL DEFAULT 0,
      last_edited_by TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS unresolved_queries (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      tax_amount REAL NOT NULL,
      net_amount REAL NOT NULL,
      tax_rate REAL NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      payment_method TEXT,
      paid_at TEXT,
      items_json TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS custom_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      phases_json TEXT NOT NULL,
      tasks_json TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inventory_products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL,
      min_stock INTEGER NOT NULL,
      purchase_price REAL NOT NULL,
      selling_price REAL NOT NULL,
      location TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      date TEXT NOT NULL,
      reason TEXT NOT NULL,
      operator TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS supplier_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL,
      order_date TEXT NOT NULL,
      delivery_date TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      user TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_files_customer_id ON files(customer_id);
    CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
  `);
}

function seedOrMigrateIfNeeded(db: DatabaseSync): void {
  const initializedRow = db
    .prepare("SELECT value FROM app_state WHERE key = 'initialized'")
    .get() as { value: string } | undefined;

  if (initializedRow?.value === "1") {
    return;
  }

  let initialData: CRMData = INITIAL_MOCK_DATA;

  if (fs.existsSync(legacyJsonFilePath)) {
    try {
      const rawJson = fs.readFileSync(legacyJsonFilePath, "utf-8");
      const parsed = JSON.parse(rawJson) as Partial<CRMData>;
      const hasLegacyContent =
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.customers) &&
        !parsed.customers.some(
          (c) =>
            c.name === "Max Mustermann" &&
            typeof c.notes === "string" &&
            c.notes.includes("KI-Consulting")
        );

      if (hasLegacyContent && parsed.adminProfile) {
        initialData = {
          customers: parsed.customers || [],
          files: parsed.files || [],
          messages: parsed.messages || [],
          appointments: parsed.appointments || [],
          botRules: parsed.botRules || INITIAL_MOCK_DATA.botRules || [],
          unresolvedQueries: parsed.unresolvedQueries || [],
          invoices: parsed.invoices || INITIAL_MOCK_DATA.invoices || [],
          customTemplates:
            parsed.customTemplates || INITIAL_MOCK_DATA.customTemplates || [],
          adminProfile: parsed.adminProfile || INITIAL_MOCK_DATA.adminProfile,
          inventoryProducts:
            parsed.inventoryProducts || INITIAL_MOCK_DATA.inventoryProducts || [],
          suppliers: parsed.suppliers || INITIAL_MOCK_DATA.suppliers || [],
          stockMovements:
            parsed.stockMovements || INITIAL_MOCK_DATA.stockMovements || [],
          supplierOrders:
            parsed.supplierOrders || INITIAL_MOCK_DATA.supplierOrders || [],
          auditLogs: parsed.auditLogs || [],
        };
        console.log("Migrated existing /data/crm_data.json into SQLite (/data/crm.db).");
      }
    } catch (err) {
      console.warn("Could not migrate legacy crm_data.json, seeding defaults:", err);
    }
  }

  writeCRMDataInTransaction(db, initialData);
}

function getDb(): DatabaseSync {
  if (!dbInstance) {
    ensureDataDirectory();
    dbInstance = new DatabaseSync(dbFilePath);
    createSchema(dbInstance);
    seedOrMigrateIfNeeded(dbInstance);
  }
  return dbInstance;
}

function writeCRMDataInTransaction(db: DatabaseSync, data: CRMData): void {
  const now = new Date().toISOString();

  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      DELETE FROM admin_profile;
      DELETE FROM customers;
      DELETE FROM files;
      DELETE FROM messages;
      DELETE FROM appointments;
      DELETE FROM bot_rules;
      DELETE FROM unresolved_queries;
      DELETE FROM invoices;
      DELETE FROM custom_templates;
      DELETE FROM inventory_products;
      DELETE FROM suppliers;
      DELETE FROM stock_movements;
      DELETE FROM supplier_orders;
      DELETE FROM audit_logs;
    `);

    if (data.adminProfile) {
      const p = data.adminProfile;
      db.prepare(
        `INSERT INTO admin_profile (
          id, name, company, email, phone, address, iban, bank_name, bic, tax_number, hrb, footnote, password_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        "default",
        p.name || "",
        p.company || "",
        p.email || "",
        p.phone || "",
        p.address || "",
        p.iban || "",
        p.bankName || "",
        p.bic || "",
        p.taxNumber || "",
        p.hrb ?? null,
        p.footnote ?? null,
        p.passwordHash ?? null
      );
    }

    const insertCustomer = db.prepare(
      `INSERT INTO customers (
        id, name, company, email, phone, address, status, username, password_hash, notes, created_at,
        approved, active_phase, completed_tasks_json, contracts_json, roadmap_enabled, roadmap_template_id,
        roadmap_phases_json, roadmap_tasks_json, landingpage_url, crm_title, onboarding_json, handover_protocol_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.customers || []).forEach((c, idx) => {
      insertCustomer.run(
        c.id,
        c.name || "",
        c.company || "",
        c.email || "",
        c.phone || "",
        c.address || "",
        c.status || "Neukunde",
        c.username || "",
        c.passwordHash || "",
        c.notes || "",
        c.createdAt || now,
        c.approved === undefined ? null : c.approved ? 1 : 0,
        c.activePhase ?? null,
        safeJsonStringify(c.completedTasks),
        safeJsonStringify(c.contracts),
        c.roadmapEnabled === undefined ? null : c.roadmapEnabled ? 1 : 0,
        c.roadmapTemplateId ?? null,
        safeJsonStringify(c.roadmapPhases),
        safeJsonStringify(c.roadmapTasks),
        c.landingpageUrl ?? null,
        c.crmTitle ?? null,
        safeJsonStringify(c.onboarding),
        safeJsonStringify(c.handoverProtocol),
        idx
      );
    });

    const insertFile = db.prepare(
      `INSERT INTO files (
        id, customer_id, customer_name, name, type, size, category, upload_date, data_url, admin_note, status, signature_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.files || []).forEach((f, idx) => {
      insertFile.run(
        f.id,
        f.customerId || "",
        f.customerName || "",
        f.name || "",
        f.type || "",
        Number(f.size) || 0,
        f.category || "Datei",
        f.uploadDate || now,
        f.dataUrl ?? null,
        f.adminNote ?? null,
        f.status || "Eingereicht",
        safeJsonStringify(f.signature),
        idx
      );
    });

    const insertMessage = db.prepare(
      `INSERT INTO messages (
        id, sender_id, receiver_id, content, encrypted_content, is_encrypted, timestamp, is_read, sync_status, attachment_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.messages || []).forEach((m, idx) => {
      insertMessage.run(
        m.id,
        m.senderId || "",
        m.receiverId || "",
        m.content || "",
        m.encryptedContent ?? null,
        m.isEncrypted === undefined ? null : m.isEncrypted ? 1 : 0,
        m.timestamp || now,
        m.isRead ? 1 : 0,
        m.syncStatus ?? null,
        safeJsonStringify(m.attachment),
        idx
      );
    });

    const insertAppointment = db.prepare(
      `INSERT INTO appointments (
        id, title, date, time, description, customer_id, status, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.appointments || []).forEach((a, idx) => {
      insertAppointment.run(
        a.id,
        a.title || "",
        a.date || "",
        a.time || "",
        a.description || "",
        a.customerId ?? null,
        a.status ?? null,
        idx
      );
    });

    const insertBotRule = db.prepare(
      `INSERT INTO bot_rules (
        id, trigger_keywords_json, answer, usages_count, last_edited_by, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?)`
    );
    (data.botRules || []).forEach((r, idx) => {
      insertBotRule.run(
        r.id,
        JSON.stringify(r.triggerKeywords || []),
        r.answer || "",
        Number(r.usagesCount) || 0,
        r.lastEditedBy ?? null,
        idx
      );
    });

    const insertUnresolved = db.prepare(
      `INSERT INTO unresolved_queries (
        id, query, timestamp, customer_name, customer_id, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?)`
    );
    (data.unresolvedQueries || []).forEach((q, idx) => {
      insertUnresolved.run(
        q.id,
        q.query || "",
        q.timestamp || now,
        q.customerName || "",
        q.customerId || "",
        idx
      );
    });

    const insertInvoice = db.prepare(
      `INSERT INTO invoices (
        id, invoice_number, customer_id, customer_name, amount, tax_amount, net_amount, tax_rate,
        issue_date, due_date, status, description, payment_method, paid_at, items_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.invoices || []).forEach((inv, idx) => {
      insertInvoice.run(
        inv.id,
        inv.invoiceNumber || "",
        inv.customerId || "",
        inv.customerName || "",
        Number(inv.amount) || 0,
        Number(inv.taxAmount) || 0,
        Number(inv.netAmount) || 0,
        Number(inv.taxRate) || 0,
        inv.issueDate || "",
        inv.dueDate || "",
        inv.status || "Offen",
        inv.description || "",
        inv.paymentMethod ?? null,
        inv.paidAt ?? null,
        JSON.stringify(inv.items || []),
        idx
      );
    });

    const insertTemplate = db.prepare(
      `INSERT INTO custom_templates (
        id, name, description, icon, category, phases_json, tasks_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.customTemplates || []).forEach((t, idx) => {
      insertTemplate.run(
        t.id,
        t.name || "",
        t.description || "",
        t.icon || "Layers",
        t.category || "Raumplanung",
        JSON.stringify(t.phases || []),
        JSON.stringify(t.tasks || []),
        idx
      );
    });

    const insertProduct = db.prepare(
      `INSERT INTO inventory_products (
        id, sku, name, category, stock, min_stock, purchase_price, selling_price, location, supplier_id, description, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.inventoryProducts || []).forEach((p, idx) => {
      insertProduct.run(
        p.id,
        p.sku || "",
        p.name || "",
        p.category || "",
        Number(p.stock) || 0,
        Number(p.minStock) || 0,
        Number(p.purchasePrice) || 0,
        Number(p.sellingPrice) || 0,
        p.location || "",
        p.supplierId || "",
        p.description ?? null,
        idx
      );
    });

    const insertSupplier = db.prepare(
      `INSERT INTO suppliers (
        id, name, contact_name, email, phone, address, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    (data.suppliers || []).forEach((s, idx) => {
      insertSupplier.run(
        s.id,
        s.name || "",
        s.contactName || "",
        s.email || "",
        s.phone || "",
        s.address || "",
        idx
      );
    });

    const insertStockMovement = db.prepare(
      `INSERT INTO stock_movements (
        id, product_id, product_name, type, quantity, date, reason, operator, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.stockMovements || []).forEach((sm, idx) => {
      insertStockMovement.run(
        sm.id,
        sm.productId || "",
        sm.productName || "",
        sm.type || "incoming",
        Number(sm.quantity) || 0,
        sm.date || now,
        sm.reason || "",
        sm.operator || "",
        idx
      );
    });

    const insertSupplierOrder = db.prepare(
      `INSERT INTO supplier_orders (
        id, order_number, supplier_id, supplier_name, items_json, total_amount, status, order_date, delivery_date, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.supplierOrders || []).forEach((o, idx) => {
      insertSupplierOrder.run(
        o.id,
        o.orderNumber || "",
        o.supplierId || "",
        o.supplierName || "",
        JSON.stringify(o.items || []),
        Number(o.totalAmount) || 0,
        o.status || "Ausstehend",
        o.orderDate || now,
        o.deliveryDate ?? null,
        idx
      );
    });

    const insertAuditLog = db.prepare(
      `INSERT INTO audit_logs (
        id, timestamp, action, user, details, status, ip_address, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    (data.auditLogs || []).forEach((log, idx) => {
      insertAuditLog.run(
        log.id,
        log.timestamp || now,
        log.action || "",
        log.user || "",
        log.details || "",
        log.status || "info",
        log.ipAddress || "",
        idx
      );
    });

    const upsertSetting = db.prepare(
      `INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );
    upsertSetting.run("initialized", "1", now);
    upsertSetting.run("last_saved_at", now, now);

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function loadCRMDataFromSQLite(): CRMData {
  const db = getDb();

  const profileRow = db
    .prepare("SELECT * FROM admin_profile WHERE id = 'default'")
    .get() as Record<string, any> | undefined;

  const adminProfile: AdminProfile | undefined = profileRow
    ? {
        name: profileRow.name,
        company: profileRow.company,
        email: profileRow.email,
        phone: profileRow.phone,
        address: profileRow.address,
        iban: profileRow.iban,
        bankName: profileRow.bank_name,
        bic: profileRow.bic,
        taxNumber: profileRow.tax_number,
        ...(profileRow.hrb ? { hrb: profileRow.hrb } : {}),
        ...(profileRow.footnote ? { footnote: profileRow.footnote } : {}),
        ...(profileRow.password_hash ? { passwordHash: profileRow.password_hash } : {}),
      }
    : undefined;

  const customers: Customer[] = (
    db.prepare("SELECT * FROM customers ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const c: Customer = {
      id: row.id,
      name: row.name,
      company: row.company,
      email: row.email,
      phone: row.phone,
      address: row.address,
      status: row.status,
      username: row.username,
      passwordHash: row.password_hash,
      notes: row.notes,
      createdAt: row.created_at,
    };
    if (row.approved !== null && row.approved !== undefined) c.approved = Boolean(row.approved);
    if (row.active_phase !== null && row.active_phase !== undefined) c.activePhase = row.active_phase;
    if (row.completed_tasks_json) c.completedTasks = safeJsonParse(row.completed_tasks_json, []);
    if (row.contracts_json) c.contracts = safeJsonParse(row.contracts_json, []);
    if (row.roadmap_enabled !== null && row.roadmap_enabled !== undefined) {
      c.roadmapEnabled = Boolean(row.roadmap_enabled);
    }
    if (row.roadmap_template_id) c.roadmapTemplateId = row.roadmap_template_id;
    if (row.roadmap_phases_json) c.roadmapPhases = safeJsonParse(row.roadmap_phases_json, []);
    if (row.roadmap_tasks_json) c.roadmapTasks = safeJsonParse(row.roadmap_tasks_json, []);
    if (row.landingpage_url) c.landingpageUrl = row.landingpage_url;
    if (row.crm_title) c.crmTitle = row.crm_title;
    if (row.onboarding_json) c.onboarding = safeJsonParse(row.onboarding_json, undefined);
    if (row.handover_protocol_json) c.handoverProtocol = safeJsonParse(row.handover_protocol_json, undefined);
    return c;
  });

  const files: UploadedFile[] = (
    db.prepare("SELECT * FROM files ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const f: UploadedFile = {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      name: row.name,
      type: row.type,
      size: Number(row.size) || 0,
      category: row.category,
      uploadDate: row.upload_date,
      status: row.status,
    };
    if (row.data_url) f.dataUrl = row.data_url;
    if (row.admin_note) f.adminNote = row.admin_note;
    if (row.signature_json) f.signature = safeJsonParse(row.signature_json, undefined);
    return f;
  });

  const messages: DirectMessage[] = (
    db.prepare("SELECT * FROM messages ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const m: DirectMessage = {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      timestamp: row.timestamp,
      isRead: Boolean(row.is_read),
    };
    if (row.encrypted_content) m.encryptedContent = row.encrypted_content;
    if (row.is_encrypted !== null && row.is_encrypted !== undefined) {
      m.isEncrypted = Boolean(row.is_encrypted);
    }
    if (row.sync_status) m.syncStatus = row.sync_status;
    if (row.attachment_json) m.attachment = safeJsonParse(row.attachment_json, undefined);
    return m;
  });

  const appointments: CalendarAppointment[] = (
    db.prepare("SELECT * FROM appointments ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const a: CalendarAppointment = {
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      description: row.description,
    };
    if (row.customer_id) a.customerId = row.customer_id;
    if (row.status) a.status = row.status;
    return a;
  });

  const botRules: BotRule[] = (
    db.prepare("SELECT * FROM bot_rules ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const r: BotRule = {
      id: row.id,
      triggerKeywords: safeJsonParse(row.trigger_keywords_json, []),
      answer: row.answer,
      usagesCount: Number(row.usages_count) || 0,
    };
    if (row.last_edited_by) r.lastEditedBy = row.last_edited_by;
    return r;
  });

  const unresolvedQueries: UnresolvedQuery[] = (
    db.prepare("SELECT * FROM unresolved_queries ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => ({
    id: row.id,
    query: row.query,
    timestamp: row.timestamp,
    customerName: row.customer_name,
    customerId: row.customer_id,
  }));

  const invoices: Invoice[] = (
    db.prepare("SELECT * FROM invoices ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const inv: Invoice = {
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerId: row.customer_id,
      customerName: row.customer_name,
      amount: Number(row.amount) || 0,
      taxAmount: Number(row.tax_amount) || 0,
      netAmount: Number(row.net_amount) || 0,
      taxRate: Number(row.tax_rate) || 0,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
      description: row.description,
      items: safeJsonParse(row.items_json, []),
    };
    if (row.payment_method) inv.paymentMethod = row.payment_method;
    if (row.paid_at) inv.paidAt = row.paid_at;
    return inv;
  });

  const customTemplates: RoadmapTemplate[] = (
    db.prepare("SELECT * FROM custom_templates ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    category: row.category,
    phases: safeJsonParse(row.phases_json, []),
    tasks: safeJsonParse(row.tasks_json, []),
  }));

  const inventoryProducts: InventoryProduct[] = (
    db.prepare("SELECT * FROM inventory_products ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const prod: InventoryProduct = {
      id: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      stock: Number(row.stock) || 0,
      minStock: Number(row.min_stock) || 0,
      purchasePrice: Number(row.purchase_price) || 0,
      sellingPrice: Number(row.selling_price) || 0,
      location: row.location,
      supplierId: row.supplier_id,
    };
    if (row.description) prod.description = row.description;
    return prod;
  });

  const suppliers: Supplier[] = (
    db.prepare("SELECT * FROM suppliers ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
  }));

  const stockMovements: StockMovement[] = (
    db.prepare("SELECT * FROM stock_movements ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    type: row.type,
    quantity: Number(row.quantity) || 0,
    date: row.date,
    reason: row.reason,
    operator: row.operator,
  }));

  const supplierOrders: SupplierOrder[] = (
    db.prepare("SELECT * FROM supplier_orders ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => {
    const o: SupplierOrder = {
      id: row.id,
      orderNumber: row.order_number,
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      items: safeJsonParse(row.items_json, []),
      totalAmount: Number(row.total_amount) || 0,
      status: row.status,
      orderDate: row.order_date,
    };
    if (row.delivery_date) o.deliveryDate = row.delivery_date;
    return o;
  });

  const auditLogs: AuditLog[] = (
    db.prepare("SELECT * FROM audit_logs ORDER BY sort_order ASC").all() as Record<string, any>[]
  ).map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    action: row.action,
    user: row.user,
    details: row.details,
    status: row.status,
    ipAddress: row.ip_address,
  }));

  return {
    customers,
    files,
    messages,
    appointments,
    botRules,
    unresolvedQueries,
    invoices,
    customTemplates,
    adminProfile,
    inventoryProducts,
    suppliers,
    stockMovements,
    supplierOrders,
    auditLogs,
  };
}

export function saveCRMDataToSQLite(data: CRMData): SQLiteStats {
  const db = getDb();
  writeCRMDataInTransaction(db, data);
  return getSQLiteStats();
}

export function getAppStateValue(key: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM app_state WHERE key = ?")
    .get(key) as { value: string | null } | undefined;
  return row ? row.value : null;
}

export function setAppStateValue(key: string, value: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value, now);
}

export function getSQLiteStats(): SQLiteStats {
  const db = getDb();

  const countTable = (tableName: string): number => {
    const row = db
      .prepare(`SELECT COUNT(*) AS cnt FROM ${tableName}`)
      .get() as { cnt: number } | undefined;
    return Number(row?.cnt ?? 0);
  };

  const journalRow = db.prepare("PRAGMA journal_mode").get() as
    | { journal_mode?: string }
    | undefined;
  const lastSavedAt = getAppStateValue("last_saved_at");

  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(dbFilePath)) {
      fileSizeBytes += fs.statSync(dbFilePath).size;
    }
    const walPath = `${dbFilePath}-wal`;
    if (fs.existsSync(walPath)) {
      fileSizeBytes += fs.statSync(walPath).size;
    }
  } catch {
    fileSizeBytes = 0;
  }

  const tableCounts = {
    adminProfile: countTable("admin_profile"),
    customers: countTable("customers"),
    files: countTable("files"),
    messages: countTable("messages"),
    appointments: countTable("appointments"),
    botRules: countTable("bot_rules"),
    unresolvedQueries: countTable("unresolved_queries"),
    invoices: countTable("invoices"),
    customTemplates: countTable("custom_templates"),
    inventoryProducts: countTable("inventory_products"),
    suppliers: countTable("suppliers"),
    stockMovements: countTable("stock_movements"),
    supplierOrders: countTable("supplier_orders"),
    auditLogs: countTable("audit_logs"),
  };

  const totalRecords = Object.values(tableCounts).reduce((sum, n) => sum + n, 0);

  return {
    dbPath: "/data/crm.db",
    fileSizeBytes,
    journalMode: (journalRow?.journal_mode || "wal").toUpperCase(),
    lastSavedAt,
    tableCounts,
    totalRecords,
  };
}

export function exportSQLiteDatabaseBuffer(): Buffer {
  const db = getDb();
  db.exec("PRAGMA wal_checkpoint(TRUNCATE);");
  return fs.readFileSync(dbFilePath);
}

export function importSQLiteDatabaseBuffer(buffer: Buffer): { data: CRMData; stats: SQLiteStats } {
  if (buffer.length < 16 || buffer.subarray(0, 16).toString("utf8") !== "SQLite format 3\0") {
    throw new Error("Ungültige SQLite-Datenbankdatei (Header stimmt nicht überein).");
  }

  ensureDataDirectory();
  const tempPath = path.join(dataDir, `crm_import_${Date.now()}.db`);
  fs.writeFileSync(tempPath, buffer);

  try {
    // Validate the uploaded SQLite database by opening it and ensuring schema/tables exist
    const probeDb = new DatabaseSync(tempPath);
    try {
      createSchema(probeDb);
      const countRow = probeDb
        .prepare("SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='customers'")
        .get() as { cnt: number } | undefined;
      if (!countRow || countRow.cnt === 0) {
        throw new Error("Erforderliche CRM-Tabellen fehlen in der Datenbankdatei.");
      }
      probeDb.exec("PRAGMA wal_checkpoint(TRUNCATE);");
    } finally {
      probeDb.close();
    }

    // Close active handle, swap files cleanly, and reopen
    if (dbInstance) {
      try {
        dbInstance.exec("PRAGMA wal_checkpoint(TRUNCATE);");
      } catch {
        // ignore checkpoint error before close
      }
      dbInstance.close();
      dbInstance = null;
    }

    const walPath = `${dbFilePath}-wal`;
    const shmPath = `${dbFilePath}-shm`;
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    fs.renameSync(tempPath, dbFilePath);

    // Reopen and ensure initialized flag is set
    const reopened = getDb();
    setAppStateValue("initialized", "1");
    setAppStateValue("last_saved_at", new Date().toISOString());
    void reopened;

    const data = loadCRMDataFromSQLite();
    const stats = getSQLiteStats();
    return { data, stats };
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup error
      }
    }
    throw err;
  }
}
