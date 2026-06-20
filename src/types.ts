export interface PortfolioContract {
  id: string;
  name: string;
  insurer: string; // Responsible Team / Verantwortlich (e.g. Tischler-Werkstatt)
  policyNumber: string; // Agreement No. (e.g. MOB-MUC-982-11)
  premium: number; // Budget
  paymentInterval: string; // billing cyclus (e.g., 'Monat', 'Einmalig', 'Projekt')
  status: string;
  startDate: string;
  deductible: string; // additional costs (e.g., 'Keine', 'Inkl. Montage')
  contactPerson: string; // Support channel / contact
  coverage: string; // duration
  scope: string; // scope of delivery
  mainDueDate: string; // next milestones / planned delivery
  billingMethod: string; // billing method (e.g., 'Rechnung', 'Lastschrift')
  details: string[]; // bullet points of services
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'Aktiv' | 'Stammkunde' | 'Neukunde' | 'Inaktiv';
  username: string;
  passwordHash: string; // SHA-256 or simple hashed value
  notes: string;
  createdAt: string;
  approved?: boolean;
  activePhase?: number; // 1 to 5 for corporate roadmap
  completedTasks?: string[]; // list of completed roadmap checklist task IDs
  contracts?: PortfolioContract[]; // custom agreements for furniture / custom project
  
  // Customizable Roadmap Config (Scharf schalten & Templates)
  roadmapEnabled?: boolean; 
  roadmapTemplateId?: string; // 'marketing' | 'vorsorge' | 'gewerbe' | 'finance'
  roadmapPhases?: {
    phase: number;
    title: string;
    desc: string;
  }[];
  roadmapTasks?: {
    id: string;
    phase: number;
    title: string;
    desc: string;
    role: 'Kunde' | 'Berater' | 'Beide';
    actionLabel?: string;
    actionType?: 'upload' | 'appointment' | 'chat';
  }[];
  
  // Custom Project deployment and onboarding details per multi-tenant requirements
  landingpageUrl?: string;
  crmTitle?: string;
  onboarding?: {
    companyName: string;
    industry: string;
    services: string;
    products: string;
    targetGroup: string;
    phone: string;
    email: string;
    address: string;
    description: string;
    specialFeatures: string;
    logoUrl?: string;
    imageUrl?: string;
    appointmentWishes?: string;
    individualRequirements?: string;
    createdAt?: string;
  };
  handoverProtocol?: {
    deployed: boolean;
    landingpageActive: boolean;
    crmSetupActive: boolean;
    userDbActive: boolean;
    documentStorageActive: boolean;
    appointmentsActive: boolean;
    adminUsername: string;
    adminPasswordPlain: string;
    clientUsername: string;
    clientPasswordPlain: string;
    handoverDate: string;
    confirmedByClient: boolean;
    confirmationSignature?: string;
    confirmationDate?: string;
  };
}

export interface UploadedFile {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  type: string; // e.g. "application/pdf", "video/mp4", "image/png"
  size: number; // in bytes
  category: 'Vertrag' | 'Video' | 'Datei';
  uploadDate: string;
  dataUrl?: string; // If actual file was uploaded
  adminNote?: string;
  status: 'Eingereicht' | 'In Bearbeitung' | 'Genehmigt' | 'Abgelehnt';
  signature?: {
    signedByName: string;
    signedAt: string;
    signatureHash: string;
    drawingDataUrl?: string;
  };
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Raumplanung' | 'Einzelanfertigung' | 'Restaurierung' | 'Gewerbe';
  phases: {
    phase: number;
    title: string;
    desc: string;
  }[];
  tasks: {
    id: string;
    phase: number;
    title: string;
    desc: string;
    role: 'Kunde' | 'Berater' | 'Beide';
    actionLabel?: string;
    actionType?: 'upload' | 'appointment' | 'chat';
  }[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number; // gross
  taxAmount: number; // VAT
  netAmount: number; // net
  taxRate: number; // e.g., 19
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'Offen' | 'Bezahlt' | 'Überfällig' | 'Storno';
  description: string;
  paymentMethod?: 'Überweisung' | 'Lastschrift' | 'PayPal' | 'Kreditkarte';
  paidAt?: string;
  items: InvoiceItem[];
}

export interface DirectMessage {
  id: string;
  senderId: string; // 'admin' or customerId
  receiverId: string; // 'admin' or customerId
  content: string; // Decrypted or backup content
  encryptedContent?: string; // Raw encrypted cipher string
  isEncrypted?: boolean;
  timestamp: string;
  isRead: boolean;
  syncStatus?: 'Synced' | 'PendingSync';
  attachment?: {
    name: string;
    type: string;
    size: number;
    dataUrl: string; // Base64 content
  };
}

export interface CalendarAppointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  customerId?: string; // empty if internal
  status?: 'Ausstehend' | 'Bestätigt' | 'Abgelehnt';
}

export interface BotRule {
  id: string;
  triggerKeywords: string[]; // list of lowercased keywords to match
  answer: string;
  usagesCount: number;
  lastEditedBy?: string;
}

export interface UnresolvedQuery {
  id: string;
  query: string;
  timestamp: string;
  customerName: string;
  customerId: string;
}

export interface AdminProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  iban: string;
  bankName: string;
  bic: string;
  taxNumber: string;
  hrb?: string;
  footnote?: string;
  passwordHash?: string;
}

export interface InventoryProduct {
  id: string;
  sku: string; // Artikelnr.
  name: string;
  category: string;
  stock: number;
  minStock: number;
  purchasePrice: number; // Einkaufspreis
  sellingPrice: number; // Verkaufspreis
  location: string; // Lagerplatz, e.g. "Regal A3"
  supplierId: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'incoming' | 'outgoing' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  operator: string;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  status: 'Ausstehend' | 'Bestellt' | 'Geliefert' | 'Storniert';
  orderDate: string;
  deliveryDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  ipAddress: string;
}

export interface CRMData {
  customers: Customer[];
  files: UploadedFile[];
  messages: DirectMessage[];
  appointments: CalendarAppointment[];
  botRules?: BotRule[];
  unresolvedQueries?: UnresolvedQuery[];
  invoices?: Invoice[];
  customTemplates?: RoadmapTemplate[];
  adminProfile?: AdminProfile;
  inventoryProducts?: InventoryProduct[];
  suppliers?: Supplier[];
  stockMovements?: StockMovement[];
  supplierOrders?: SupplierOrder[];
  auditLogs?: AuditLog[];
}
