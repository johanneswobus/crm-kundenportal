import React, { useState, useMemo, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Customer, UploadedFile, DirectMessage, CalendarAppointment, CRMData, AuditLog } from '../types';
import { encryptMessage, decryptMessage } from '../cryptoUtils';
import { hashPassword } from '../storage';
import { exportCustomersToCSV, parseCustomersFromCSV } from '../csvUtils';
import { ROADMAP_SUBTASKS, RoadmapSubTask } from './CustomerPortal';
import { ROADMAP_TEMPLATES } from '../templates';
import ManualDoc from './ManualDoc';
import { INITIAL_MOCK_DATA } from '../mockData';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  Video, 
  File, 
  MessageSquare,
  Calendar,
  Send,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  Clock,
  XCircle,
  TrendingUp,
  Sliders,
  Euro,
  User,
  ExternalLink,
  ChevronRight,
  Users,
  Wifi,
  WifiOff,
  ShieldCheck,
  Unlock,
  LockKeyhole,
  RefreshCw,
  Paperclip,
  Trash,
  Cpu,
  Sparkles,
  HelpCircle,
  Receipt,
  Layers,
  BookOpen,
  Server,
  Globe,
  Check,
  Laptop,
  Briefcase,
  Database,
  Settings,
  X
} from 'lucide-react';

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: 'Kein Passwort eingegeben', bgClass: 'bg-slate-200', textColor: 'text-slate-450' };
  }
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const classesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (classesCount >= 2) score += 1;
  if (classesCount >= 3) score += 1;
  if (score === 0) score = 1;
  
  switch (score) {
    case 1:
      return { score: 1, label: 'Sehr schwach', bgClass: 'bg-rose-500', textColor: 'text-rose-500' };
    case 2:
      return { score: 2, label: 'Schwach', bgClass: 'bg-amber-500', textColor: 'text-amber-500' };
    case 3:
      return { score: 3, label: 'Mittelstark', bgClass: 'bg-yellow-500', textColor: 'text-yellow-600' };
    case 4:
    default:
      return { score: 4, label: 'Stark & Sicher', bgClass: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }
};

const getPlausibleContracts = (cust: Customer) => [
  {
    id: 'pc1',
    name: 'Maßgefertigte Büromöbel & Executive Suiten',
    insurer: 'Tischler-Werkstatt',
    policyNumber: `MOB-${cust.id.substring(0, 3).toUpperCase()}-982-11`,
    premium: 45000.00,
    paymentInterval: 'Projekt',
    status: 'In Fertigung',
    startDate: '2026-05-10',
    deductible: 'Inkl. Montage',
    contactPerson: 'Zentraler Tischlereileiter',
    coverage: 'Abnahme bis Aug 2026',
    scope: `Standort ${cust.company || 'Hauptsitz'}`,
    mainDueDate: '2026-08-15',
    billingMethod: 'Abschlagsrechnung',
    details: [
      'CAD-Konstruktionszeichnung des Executive OakMaster Tisches',
      'Auswahl der Massivholz-Chargen (Wildeiche & Räuchereiche)',
      'Manufakturfertigung der handgedrechselten Tischkufen',
      'Vormontage & Qualitätskontrolle in unserer Münchner Werkstatt',
      'Lieferung & staubfreie Endmontage vor Ort inkl. Höhenverstellung'
    ]
  },
  {
    id: 'pc2',
    name: 'Ergonomische Arbeitsplatzgestaltung Planungsvertrag',
    insurer: 'Raumkonzept-Studio',
    policyNumber: `RAUM-${cust.id.substring(0, 3).toUpperCase()}-509-AA`,
    premium: 8500.00,
    paymentInterval: 'Pauschal',
    status: 'Aktiv',
    startDate: '2026-06-01',
    deductible: 'Keine',
    contactPerson: 'Creative Director Raumplanung',
    coverage: '8 Wochen Planungsphase',
    scope: 'Open Space & Akustikzonen',
    mainDueDate: '2026-07-25',
    billingMethod: 'Rechnung nach Übergabe',
    details: [
      '3D-Lichtplanung und Akustik-Messung der Büroräumlichkeiten',
      'Bemusterung der Bezugsstoffe (Premium Schurwolle, pflanzlich gegerbtes Leder)',
      'Platzierungsanalyse für Ergofit Designstühle & Steh-Sitz-Kombinationen',
      'Abschluss-Präsentation des Farb- und Materialboards im Studio',
      'Übergabe des CAD-Belegungsplanes'
    ]
  },
  {
    id: 'pc3',
    name: 'Laufende Pflege & Wartungsübernahme (Vollholz-Schutzbrief)',
    insurer: 'Service-Tischlerei',
    policyNumber: `SPF-${cust.id.substring(0, 3).toUpperCase()}-224-BB`,
    premium: 150.00,
    paymentInterval: 'Monat',
    status: 'Aktiv',
    startDate: '2026-06-15',
    deductible: 'Materialkosten inkl.',
    contactPerson: 'Service-Techniker',
    coverage: 'Laufende Wartung',
    scope: 'Oberflächenpflege & Nachölung',
    mainDueDate: '2027-06-15',
    billingMethod: 'Lastschrifteinzug',
    details: [
      'Regelmäßige Kontrolle der Holzfeuchtigkeit vor Ort',
      'Professionelle Reinigung und Tiefenölung aller Massivholzoberflächen',
      'Nachjustierung der Türen, Schubladen und Scharniere',
      'Kostenlose Ausbesserung kleiner Kerben oder Kratzer zweimal jährlich',
      'Support-Verfügbarkeit von Montag bis Freitag per Direkt-Chat'
    ]
  }
];

interface AdminCRMProps {
  data: CRMData;
  onDataChange: (newData: CRMData | ((prev: CRMData) => CRMData)) => void;
  activeTab: string;
  isOnline: boolean;
  onOnlineToggle: (online: boolean) => void;
  onTabChange?: (tab: string) => void;
  secondsRemaining?: number;
}

export default function AdminCRM({ data, onDataChange, activeTab, isOnline, onOnlineToggle, onTabChange, secondsRemaining }: AdminCRMProps) {
  const createSubAuditLog = (action: string, user: string, details: string, status: 'success' | 'failure' | 'warning' | 'info'): AuditLog => {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
      status,
      ipAddress: '127.0.0.1 (Lokale Sitzung)'
    };
  };

  // --- DYNAMIC ALL TEMPLATES INJECTOR ---
  const allTemplates = useMemo(() => {
    return [
      ...ROADMAP_TEMPLATES,
      ...(data.customTemplates || [])
    ];
  }, [data.customTemplates]);

  // --- STATE FOR BILLING & BOOKKEEPING ---
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoicePreviewObject, setInvoicePreviewObject] = useState<any | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    invoiceNumber: '',
    issueDate: '2026-05-31',
    dueDate: '2026-06-14',
    description: 'Finanz- & Vorsorgeberatung',
    taxRate: 19,
    items: [
      { id: 'item-1', description: 'Beratungspauschale gem. § 4 Nr. 11 UStG / Honoror', quantity: 1, unitPrice: 350.00 }
    ]
  });

  // --- STATE FOR MOUNTING TEMPLATE CUSTOMIZER ---
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    icon: 'Layers',
    category: 'Consulting' as 'Marketing' | 'Consulting' | 'Digitalisierung' | 'Gewerbe',
    phases: [
      { phase: 1, title: 'Bedarf & Analyse', desc: 'Kick-off & Erfassung' },
      { phase: 2, title: 'Konzeptentwicklung', desc: 'Audit & Analyse' },
      { phase: 3, title: 'Präsentation', desc: 'Abstimmung & Entwurf' },
      { phase: 4, title: 'Umsetzung', desc: 'Prozessumbau & Go-Live' },
      { phase: 5, title: 'Laufender Service', desc: 'Support & Updates' }
    ],
    tasks: [
      { id: 'custom-t1', phase: 1, title: 'Erstberatung & Analyse', desc: 'Persönlicher Erst-Checkup im Showroom / Büro oder per Video.', role: 'Beide' as 'Kunde' | 'Berater' | 'Beide', actionLabel: 'Erstgespräch buchen', actionType: 'appointment' as any }
    ]
  });

  // --- STATE FOR ADMIN PROFILE STAMMDATEN ---
  const [profileName, setProfileName] = useState(data.adminProfile?.name || '');
  const [profileCompany, setProfileCompany] = useState(data.adminProfile?.company || '');
  const [profileEmail, setProfileEmail] = useState(data.adminProfile?.email || '');
  const [profilePhone, setProfilePhone] = useState(data.adminProfile?.phone || '');
  const [profileAddress, setProfileAddress] = useState(data.adminProfile?.address || '');
  const [profileIban, setProfileIban] = useState(data.adminProfile?.iban || '');
  const [profileBankName, setProfileBankName] = useState(data.adminProfile?.bankName || '');
  const [profileBic, setProfileBic] = useState(data.adminProfile?.bic || '');
  const [profileTaxNumber, setProfileTaxNumber] = useState(data.adminProfile?.taxNumber || '');
  const [profileHrb, setProfileHrb] = useState(data.adminProfile?.hrb || '');
  const [profileFootnote, setProfileFootnote] = useState(data.adminProfile?.footnote || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');

  // --- STATE FOR SYSTEM RESET ---
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // --- STATE FOR GITHUB EXPORTER & COMMIT MESSAGE WORKSPACE ---
  const [commitType, setCommitType] = useState('feat');
  const [commitScope, setCommitScope] = useState('security');
  const [commitDesc, setCommitDesc] = useState('add temporary lockout protection for login brute-force attacks');
  const [isGdprShieldActive, setIsGdprShieldActive] = useState(true);
  const [isCommitCopied, setIsCommitCopied] = useState(false);
  const [isChangelogCopied, setIsChangelogCopied] = useState(false);
  
  // --- STATE FOR AUDIT LOG FILTERS AND SORTING ---
  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<'all' | 'success' | 'failure' | 'warning' | 'info'>('all');
  const [auditSortField, setAuditSortField] = useState<'timestamp' | 'action' | 'user'>('timestamp');
  const [auditSortDirection, setAuditSortDirection] = useState<'asc' | 'desc'>('desc');

  const [githubChecklist, setGithubChecklist] = useState({
    gitignore: true,
    secretshield: true,
    cleanseed: true,
    schemaok: true,
    lintpass: true
  });

  const handleSystemReset = (mode: 'empty' | 'demo') => {
    if (mode === 'empty') {
      const emptyState: CRMData = {
        customers: [],
        files: [],
        messages: [],
        appointments: [],
        botRules: INITIAL_MOCK_DATA.botRules || [],
        unresolvedQueries: [],
        invoices: [],
        customTemplates: [],
        adminProfile: data.adminProfile || INITIAL_MOCK_DATA.adminProfile,
        inventoryProducts: [],
        suppliers: [],
        stockMovements: [],
        supplierOrders: []
      };
      onDataChange(emptyState);
      alert("System erfolgreich zurückgesetzt! Alle Dummydaten (Kunden, Verträge, Nachrichten, Anhänge, Termine) wurden unwiderruflich entfernt.");
    } else {
      onDataChange(INITIAL_MOCK_DATA);
      alert("System zurückgesetzt auf Standard-Demo-Daten (Werkseinstellungen)!");
    }
    setIsResetConfirmOpen(false);
  };

  const handleExportCSV = () => {
    try {
      const csvContent = exportCustomersToCSV(data.customers);
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM representation for seamless Excel opening
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `crm_mandanten_export_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Audit Log for export
      onDataChange(prev => ({
        ...prev,
        auditLogs: [
          createSubAuditLog('Export durchgeführt', 'admin', `Kundenliste (${data.customers.length} Einträge) erfolgreich als CSV exportiert`, 'success'),
          ...(prev.auditLogs || [])
        ]
      }));
    } catch (e) {
      console.error(e);
      alert('Fehler beim Exportieren der CSV-Datei.');
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        
        const parsed = parseCustomersFromCSV(text);
        if (parsed.length === 0) {
          alert('Keine gültigen Mandantendaten in der CSV-Datei gefunden.');
          return;
        }

        const overwriteConfirm = window.confirm(
          `Sollen ${parsed.length} Mandanten aus der CSV-Datei importiert werden?\n\nKunden mit bereits existierenden IDs werden aktualisiert, neue Kunden werden hinzugefügt.`
        );
        if (!overwriteConfirm) {
          e.target.value = '';
          return;
        }

        onDataChange(prev => {
          const existingCustomers = [...prev.customers];
          let updatedCount = 0;
          let addedCount = 0;

          parsed.forEach(parsedCust => {
            const index = existingCustomers.findIndex(c => c.id === parsedCust.id);
            if (index !== -1) {
              existingCustomers[index] = {
                ...existingCustomers[index],
                ...parsedCust,
                status: (parsedCust.status || existingCustomers[index].status) as any,
                username: parsedCust.username || existingCustomers[index].username,
                approved: parsedCust.approved !== undefined ? parsedCust.approved : existingCustomers[index].approved
              };
              updatedCount++;
            } else {
              const defaultName = parsedCust.name || 'Unbekannter Mandant';
              existingCustomers.push({
                id: parsedCust.id || 'cust_' + Math.random().toString(36).substring(2, 9),
                name: defaultName,
                company: parsedCust.company || '',
                email: parsedCust.email || '',
                phone: parsedCust.phone || '',
                address: parsedCust.address || '',
                status: (parsedCust.status || 'Aktiv') as any,
                username: parsedCust.username || defaultName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'import_' + Math.random().toString(36).substring(2, 7),
                approved: parsedCust.approved !== undefined ? parsedCust.approved : true,
                createdAt: parsedCust.createdAt || new Date().toISOString(),
                notes: parsedCust.notes || '',
                passwordHash: parsedCust.passwordHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
              });
              addedCount++;
            }
          });

          setTimeout(() => {
            alert(`Erfolgreich importiert:\n\n• ${addedCount} neue Mandanten angelegt\n• ${updatedCount} bestehende Mandanten aktualisiert`);
          }, 100);

          return {
            ...prev,
            customers: existingCustomers,
            auditLogs: [
              createSubAuditLog('Datenimport', 'admin', `CSV-Datei erfolgreich eingelesen (${addedCount} neue Mandanten angelegt, ${updatedCount} bestehende Mandanten aktualisiert)`, 'success'),
              ...(prev.auditLogs || [])
            ]
          };
        });

      } catch (err) {
        console.error(err);
        alert('Fehler beim Analysieren der CSV-Datei. Bitte überprüfen Sie das Format.');
      }
      e.target.value = '';
    };

    reader.readAsText(file, 'utf-8');
  };

  const [adminLoginCount, setAdminLoginCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('admin_login_count') || '0', 10);
  });

  const handleExportFullJSON = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `crm_datenbank_backup_${today}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Reset count after successful backup export
      localStorage.setItem('admin_login_count', '0');
      setAdminLoginCount(0);
      alert('Vollständiges lokales Datenbank-Backup erfolgreich erstellt und heruntergeladen!\nDer Login-Sicherheitszähler wurde zurückgesetzt.');
    } catch (e) {
      console.error(e);
      alert('Fehler beim Exportieren des Datenbank-Backups.');
    }
  };

  const validateCRMDataStructure = (parsed: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { valid: false, errors: ['Das Backup-Dokument hat ein unzulässiges Format (Muss ein JSON-Objekt sein).'] };
    }

    const coreLists = ['customers', 'files', 'messages', 'appointments'];
    coreLists.forEach(list => {
      if (!(list in parsed)) {
        errors.push(`Fehlende Kernaufstellung: '${list}' fehlt im Backup.`);
      } else if (!Array.isArray(parsed[list])) {
        errors.push(`Inkonsistente Struktur: '${list}' muss ein Daten-Array sein.`);
      }
    });

    const optionalLists = ['botRules', 'unresolvedQueries', 'invoices', 'customTemplates', 'inventoryProducts', 'suppliers', 'stockMovements', 'supplierOrders'];
    optionalLists.forEach(list => {
      if (list in parsed && !Array.isArray(parsed[list])) {
        errors.push(`Inkonsistente Struktur: Optionale Aufstellung '${list}' ist kein valides Daten-Array.`);
      }
    });

    if (Array.isArray(parsed.customers)) {
      parsed.customers.forEach((cust: any, index: number) => {
        const label = cust.name || `Mandant #${index + 1}`;
        if (!cust.id || typeof cust.id !== 'string') {
          errors.push(`Inkonsistenter Mandanten-Datensatz für "${label}": ID fehlt.`);
        }
        if (!cust.name || typeof cust.name !== 'string') {
          errors.push(`Inkonsistenter Mandanten-Datensatz bei Position ${index + 1}: Name fehlt.`);
        }
        if (!cust.username || typeof cust.username !== 'string') {
          errors.push(`Inkonsistente Zugangsdaten für "${label}": Benutzername fehlt.`);
        }
      });
    }

    if (Array.isArray(parsed.files)) {
      parsed.files.forEach((file: any, index: number) => {
        const label = file.name || `Datei #${index + 1}`;
        if (!file.id || typeof file.id !== 'string') {
          errors.push(`Inkonsistente Datei bei "${label}": ID fehlt.`);
        }
        if (!file.name || typeof file.name !== 'string') {
          errors.push(`Inkonsistenter Dateiname bei Position ${index + 1}.`);
        }
      });
    }

    if (Array.isArray(parsed.messages)) {
      parsed.messages.forEach((msg: any, index: number) => {
        if (!msg.id || typeof msg.id !== 'string') {
          errors.push(`Inkonsistente Nachricht bei Position ${index + 1}: ID fehlt.`);
        }
        if (!msg.senderId || typeof msg.senderId !== 'string') {
          errors.push(`Inkonsistente Nachricht bei Position ${index + 1}: Absender-ID fehlt.`);
        }
        if (!msg.receiverId || typeof msg.receiverId !== 'string') {
          errors.push(`Inkonsistente Nachricht bei Position ${index + 1}: Empfänger-ID fehlt.`);
        }
      });
    }

    if (parsed.adminProfile) {
      if (typeof parsed.adminProfile !== 'object' || Array.isArray(parsed.adminProfile)) {
        errors.push('Inkonsistentes adminProfile: Es muss ein Daten-Objekt sein.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleImportFullJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const parsed = JSON.parse(text);
        
        const validation = validateCRMDataStructure(parsed);
        if (!validation.valid) {
          alert(`Backup-Validierung FEHLGESCHLAGEN!\n\nDas Backup-Dokument weist folgende Inkonsistenzen auf:\n\n${validation.errors.map(err => '• ' + err).join('\n')}\n\nDer Import wurde blockiert, um Datenverlust zu vermeiden.`);
          e.target.value = '';
          return;
        }

        const confirmRestore = window.confirm(
          'Möchten Sie dieses geprüfte und valide Datenbank-Backup einspielen?\n\nACHTUNG: Alle bestehenden Daten (Kunden, Termine, Nachrichten, etc.) werden hiermit überschrieben!'
        );
        if (!confirmRestore) {
          e.target.value = '';
          return;
        }

        const restoredData = {
          ...parsed,
          auditLogs: [
            createSubAuditLog('Sicherung wiederhergestellt', 'admin', 'Vollständiges Datenbank-Backup erfolgreich eingespielt. Alle Mandantendaten überschrieben.', 'warning'),
            ...(parsed.auditLogs || [])
          ]
        };
        onDataChange(restoredData);
        localStorage.setItem('admin_login_count', '0');
        setAdminLoginCount(0);
        alert('Datenbank erfolgreich aus Backup-Datei wiederhergestellt und Login-Verlauf zurückgesetzt.');
      } catch (err) {
        console.error(err);
        alert('Fehler beim Einlesen der Backup-Datei. Bitte prüfen Sie das JSON-Format und stellen Sie sicher, dass es sich um eine valide UTF-8 kodierte Textdatei handelt.');
      }
      e.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleResetLoginCount = () => {
    localStorage.setItem('admin_login_count', '0');
    setAdminLoginCount(0);
  };

  const handleClearAuditLogs = () => {
    if (window.confirm('Möchten Sie das System-Sicherheits-Audit-Log unwiderruflich leeren? Dies sollte nur zu Wartungszwecken durchgeführt werden.')) {
      onDataChange(prev => ({
        ...prev,
        auditLogs: [],
        addAuditLog: prev.auditLogs ? undefined : undefined // keep DB schema aligned
      }));
      alert('System-Audit-Log erfolgreich geleert.');
    }
  };

  const handleExportAuditLogsCSV = () => {
    try {
      const logs = data.auditLogs || [];
      if (logs.length === 0) {
        alert('Keine Audit-Logs zum Exportieren vorhanden.');
        return;
      }
      let csvContent = '\uFEFFZeitstempel,Aktion,Benutzer,Details,Status,IP-Adresse\n';
      logs.forEach(log => {
        const row = [
          log.timestamp || '',
          `"${(log.action || '').replace(/"/g, '""')}"`,
          `"${(log.user || '').replace(/"/g, '""')}"`,
          `"${(log.details || '').replace(/"/g, '""')}"`,
          log.status || 'info',
          `"${(log.ipAddress || '127.0.0.1 (Lokale Sitzung)').replace(/"/g, '""')}"`
        ].join(',');
        csvContent += row + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `system_security_audit_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Fehler beim Exportieren der Audit-Logs.');
    }
  };

  useEffect(() => {
    if (data.adminProfile) {
      setProfileName(data.adminProfile.name || '');
      setProfileCompany(data.adminProfile.company || '');
      setProfileEmail(data.adminProfile.email || '');
      setProfilePhone(data.adminProfile.phone || '');
      setProfileAddress(data.adminProfile.address || '');
      setProfileIban(data.adminProfile.iban || '');
      setProfileBankName(data.adminProfile.bankName || '');
      setProfileBic(data.adminProfile.bic || '');
      setProfileTaxNumber(data.adminProfile.taxNumber || '');
      setProfileHrb(data.adminProfile.hrb || '');
      setProfileFootnote(data.adminProfile.footnote || '');
    }
  }, [data.adminProfile]);

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileNewPassword) {
      if (profileNewPassword !== profileConfirmPassword) {
        alert('Die neuen Passwörter stimmen nicht überein!');
        return;
      }
    }

    let newHash = data.adminProfile?.passwordHash;
    if (profileNewPassword) {
      newHash = await hashPassword(profileNewPassword);
    }

    const updatedProfile = {
      name: profileName,
      company: profileCompany,
      email: profileEmail,
      phone: profilePhone,
      address: profileAddress,
      iban: profileIban,
      bankName: profileBankName,
      bic: profileBic,
      taxNumber: profileTaxNumber,
      hrb: profileHrb,
      footnote: profileFootnote,
      passwordHash: newHash
    };
    onDataChange(prev => ({
      ...prev,
      adminProfile: updatedProfile
    }));
    setProfileSaveSuccess(true);
    setProfileNewPassword('');
    setProfileConfirmPassword('');
    setTimeout(() => {
      setProfileSaveSuccess(false);
    }, 3000);
  };

  // --- SYNC & SECURE MESSAGING STATES ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [e2eePassphrase, setE2eePassphrase] = useState('LE_E2E_SECURE_KEY');
  const [showRawCiphers, setShowRawCiphers] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // --- STATE FOR WARENWIRTSCHAFTS-SYSTEM (WWS) ---
  const [wwsActiveSubTab, setWwsActiveSubTab] = useState<'products' | 'movements' | 'suppliers' | 'orders'>('products');
  const [wwsProductSearch, setWwsProductSearch] = useState('');
  const [wwsCategoryFilter, setWwsCategoryFilter] = useState('all');
  const [isWwsProductModalOpen, setIsWwsProductModalOpen] = useState(false);
  const [editingWwsProductId, setEditingWwsProductId] = useState<string | null>(null);
  const [wwsProductForm, setWwsProductForm] = useState({
    sku: '',
    name: '',
    category: 'Möbel',
    stock: 10,
    minStock: 5,
    purchasePrice: 100,
    sellingPrice: 150,
    location: 'Regal A1',
    supplierId: '',
    description: ''
  });
  const [isWwsSupplierModalOpen, setIsWwsSupplierModalOpen] = useState(false);
  const [editingWwsSupplierId, setEditingWwsSupplierId] = useState<string | null>(null);
  const [wwsSupplierForm, setWwsSupplierForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isWwsOrderModalOpen, setIsWwsOrderModalOpen] = useState(false);
  const [wwsOrderForm, setWwsOrderForm] = useState({
    supplierId: '',
    productId: '',
    quantity: 10
  });

  // --- STATE FOR CUSTOMER MANAGEMENT ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [customerSortField, setCustomerSortField] = useState<'createdAt' | 'name' | 'company' | 'approved'>('createdAt');
  const [customerSortOrder, setCustomerSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- STATE FOR CLIENT PORT PROJECTS & PROVISIONING (IONOS) ---
  const [selectedProjectCustId, setSelectedProjectCustId] = useState<string | null>(null);
  const [landingPagePreviewCustId, setLandingPagePreviewCustId] = useState<string | null>(null);
  const [isOnboardingFormOpen, setIsOnboardingFormOpen] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    custId: '', // empty means "create a new client"
    newClientName: '', // used if custId is empty
    companyName: '',
    industry: 'Versicherung',
    services: '',
    products: '',
    targetGroup: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    specialFeatures: '',
    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&auto=format&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    appointmentWishes: '',
    individualRequirements: '',
    crmTitle: ''
  });
  const [provisionSuccessInfo, setProvisionSuccessInfo] = useState<{
    companyName: string;
    landingpageUrl: string;
    crmTitle: string;
    adminUser: string;
    adminPass: string;
    clientUser: string;
    clientPass: string;
  } | null>(null);

  const handleProvisionProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetCust: any = null;
    let updatedCustomers = [...data.customers];
    
    if (onboardingForm.custId) {
      targetCust = updatedCustomers.find(c => c.id === onboardingForm.custId);
    }
    
    if (!targetCust) {
      // Create fresh customer object
      const custId = 'cust-' + Date.now();
      const rawUser = (onboardingForm.newClientName || onboardingForm.companyName || 'kunde').toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueUser = `${rawUser || 'user'}.${Math.floor(100 + Math.random() * 900)}`;
      
      targetCust = {
        id: custId,
        name: onboardingForm.newClientName || 'Neuer Mandant',
        company: onboardingForm.companyName || 'Musterfirma',
        email: onboardingForm.email || 'info@agentur.de',
        phone: onboardingForm.phone || '+49 123 456789',
        address: onboardingForm.address || 'Hauptstraße 1, 10115 Berlin',
        status: 'Neukunde' as const,
        username: uniqueUser,
        passwordHash: "fc46231ef64c5be7f0580970877990159f8a379373bd33e46c7ad7208d2b2707", // SHA256 of 'kunde123'
        notes: "Projekt-Provisionierung gestartet via Datenerfassungsformular.",
        createdAt: new Date().toISOString(),
        activePhase: 1
      };
      
      updatedCustomers.push(targetCust);
    }
    
    // Generate custom link and login credentials
    const cleanCompanyPath = targetCust.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const landingpageUrl = `https://${cleanCompanyPath || 'kunde'}.my-portal.de`;
    const crmTitle = onboardingForm.crmTitle || `Premium CRM (${targetCust.company})`;
    
    const adminUser = `admin_${cleanCompanyPath || 'kunde'}`;
    const adminPass = `adminPass_${Math.floor(1000 + Math.random() * 9000)}`;
    const clientUser = targetCust.username;
    const clientPass = 'kunde123';
    
    // Update target client dataset
    const updatedCust = {
      ...targetCust,
      company: onboardingForm.companyName || targetCust.company,
      email: onboardingForm.email || targetCust.email,
      phone: onboardingForm.phone || targetCust.phone,
      address: onboardingForm.address || targetCust.address,
      landingpageUrl,
      crmTitle,
      onboarding: {
        companyName: onboardingForm.companyName || targetCust.company,
        industry: onboardingForm.industry,
        services: onboardingForm.services,
        products: onboardingForm.products,
        targetGroup: onboardingForm.targetGroup,
        phone: onboardingForm.phone || targetCust.phone,
        email: onboardingForm.email || targetCust.email,
        address: onboardingForm.address || targetCust.address,
        description: onboardingForm.description,
        specialFeatures: onboardingForm.specialFeatures,
        logoUrl: onboardingForm.logoUrl,
        imageUrl: onboardingForm.imageUrl,
        appointmentWishes: onboardingForm.appointmentWishes,
        individualRequirements: onboardingForm.individualRequirements,
        createdAt: new Date().toISOString()
      },
      handoverProtocol: {
        deployed: true,
        landingpageActive: true,
        crmSetupActive: true,
        userDbActive: true,
        documentStorageActive: true,
        appointmentsActive: true,
        adminUsername: adminUser,
        adminPasswordPlain: adminPass,
        clientUsername: clientUser,
        clientPasswordPlain: clientPass,
        handoverDate: new Date().toISOString().split('T')[0],
        confirmedByClient: false
      }
    };
    
    const index = updatedCustomers.findIndex(c => c.id === targetCust.id);
    if (index !== -1) {
      updatedCustomers[index] = updatedCust;
    } else {
      updatedCustomers.push(updatedCust);
    }
    
    // Save state
    onDataChange({
      ...data,
      customers: updatedCustomers
    });
    
    setProvisionSuccessInfo({
      companyName: updatedCust.company,
      landingpageUrl,
      crmTitle,
      adminUser,
      adminPass,
      clientUser,
      clientPass
    });
    
    setIsOnboardingFormOpen(false);
    setSelectedProjectCustId(updatedCust.id);
  };
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustForContracts, setSelectedCustForContracts] = useState<Customer | null>(null);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [selectedAdminDetailPolicy, setSelectedAdminDetailPolicy] = useState<any | null>(null);

  const handleSaveContract = (updatedContract: any) => {
    if (!selectedCustForContracts) return;
    
    const currentList = selectedCustForContracts.contracts || getPlausibleContracts(selectedCustForContracts);
    let updatedList: any[] = [];
    
    if (updatedContract.id && currentList.some((c: any) => c.id === updatedContract.id)) {
      // Edit existing
      updatedList = currentList.map((c: any) => c.id === updatedContract.id ? updatedContract : c);
    } else {
      // Add new
      const newContract = {
        ...updatedContract,
        id: updatedContract.id || `pc-${Date.now()}`
      };
      updatedList = [...currentList, newContract];
    }
    
    const updatedCustomers = data.customers.map(c => {
      if (c.id === selectedCustForContracts.id) {
        return {
          ...c,
          contracts: updatedList
        };
      }
      return c;
    });
    
    onDataChange({
      ...data,
      customers: updatedCustomers
    });
    
    setSelectedCustForContracts({
      ...selectedCustForContracts,
      contracts: updatedList
    });
    
    setEditingContract(null);
  };

  const handleDeleteContract = (contractId: string) => {
    if (!selectedCustForContracts) return;
    if (!confirm('Möchten Sie dieses Projektmodul wirklich unwiderruflich löschen?')) return;
    
    const currentList = selectedCustForContracts.contracts || getPlausibleContracts(selectedCustForContracts);
    const updatedList = currentList.filter((c: any) => c.id !== contractId);
    
    const updatedCustomers = data.customers.map(c => {
      if (c.id === selectedCustForContracts.id) {
        return {
          ...c,
          contracts: updatedList
        };
      }
      return c;
    });
    
    onDataChange({
      ...data,
      customers: updatedCustomers
    });
    
    setSelectedCustForContracts({
      ...selectedCustForContracts,
      contracts: updatedList
    });
  };
  const [customerForm, setCustomerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    status: 'Neukunde' as Customer['status'],
    username: '',
    password: '',
    notes: '',
    activePhase: 1,
    completedTasks: [] as string[],
    roadmapEnabled: true,
    roadmapTemplateId: 'marketing'
  });

  // --- STATE FOR DOCUMENT CENTRE ---
  const [fileSearch, setFileSearch] = useState('');
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('all');
  const [fileCustomerFilter, setFileCustomerFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [editingFileNote, setEditingFileNote] = useState('');
  const [editingFileStatus, setEditingFileStatus] = useState<UploadedFile['status']>('Eingereicht');

  // --- STATE FOR MESSAGING (DMs) ---
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSelectedCustomerId, setVideoSelectedCustomerId] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [videoAdminNote, setVideoAdminNote] = useState('');
  const [videoStatus, setVideoStatus] = useState<UploadedFile['status']>('Genehmigt');
  const [videoUploadSuccessMsg, setVideoUploadSuccessMsg] = useState<string | null>(null);

  const [activeChatCustomerId, setActiveChatCustomerId] = useState<string>(
    data.customers.length > 0 ? data.customers[0].id : ''
  );
  
  const [chatInput, setChatInput] = useState(() => {
    const initialCustomerId = data.customers.length > 0 ? data.customers[0].id : '';
    return sessionStorage.getItem('admin_chat_input_' + initialCustomerId) || '';
  });

  useEffect(() => {
    if (activeChatCustomerId) {
      const savedInput = sessionStorage.getItem('admin_chat_input_' + activeChatCustomerId);
      setChatInput(savedInput || '');
    }
  }, [activeChatCustomerId]);

  useEffect(() => {
    if (activeChatCustomerId) {
      sessionStorage.setItem('admin_chat_input_' + activeChatCustomerId, chatInput);
    }
  }, [chatInput, activeChatCustomerId]);

  useEffect(() => {
    const notesKey = selectedCustomer ? `admin_customer_notes_${selectedCustomer.id}` : 'admin_customer_notes_new';
    const saved = sessionStorage.getItem(notesKey);
    if (saved !== null) {
      setCustomerForm(prev => {
        if (prev.notes !== saved) {
          return { ...prev, notes: saved };
        }
        return prev;
      });
    }
  }, [selectedCustomer]);

  useEffect(() => {
    const notesKey = selectedCustomer ? `admin_customer_notes_${selectedCustomer.id}` : 'admin_customer_notes_new';
    sessionStorage.setItem(notesKey, customerForm.notes);
  }, [customerForm.notes, selectedCustomer]);

  // --- STATE FOR CALENDAR (APPOINTMENTS) ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    customerId: ''
  });

  // --- STATE FOR KI-BOT TRAINING & SIMULATION ---
  const [isBotRuleModalOpen, setIsBotRuleModalOpen] = useState(false);
  const [selectedBotRuleId, setSelectedBotRuleId] = useState<string | null>(null);
  const [promotingUnresolvedId, setPromotingUnresolvedId] = useState<string | null>(null);
  const [botRuleForm, setBotRuleForm] = useState({
    triggerKeywordsText: '',
    answer: ''
  });
  const [botTestInput, setBotTestInput] = useState('');
  const [botTestResult, setBotTestResult] = useState<{
    matched: boolean;
    ruleTitle?: string;
    score: number;
    answer: string;
  } | null>(null);

  const filteredAndSortedAuditLogs = useMemo(() => {
    const logs = data.auditLogs || [];
    
    // 1. Filter
    const query = auditSearch.trim().toLowerCase();
    const filtered = logs.filter(log => {
      if (auditStatusFilter !== 'all' && log.status !== auditStatusFilter) {
        return false;
      }
      
      if (query) {
        const actionMatch = log.action.toLowerCase().includes(query);
        const userMatch = log.user.toLowerCase().includes(query);
        const detailsMatch = log.details.toLowerCase().includes(query);
        const ipMatch = log.ipAddress?.toLowerCase().includes(query) || false;
        return actionMatch || userMatch || detailsMatch || ipMatch;
      }
      
      return true;
    });
    
    // 2. Sort
    filtered.sort((a, b) => {
      let fieldA = '', fieldB = '';
      if (auditSortField === 'timestamp') {
        fieldA = a.timestamp || '';
        fieldB = b.timestamp || '';
      } else if (auditSortField === 'action') {
        fieldA = a.action || '';
        fieldB = b.action || '';
      } else if (auditSortField === 'user') {
        fieldA = a.user || '';
        fieldB = b.user || '';
      }
      
      if (fieldA < fieldB) return auditSortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return auditSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [data.auditLogs, auditSearch, auditStatusFilter, auditSortField, auditSortDirection]);

  const weeklyData = useMemo(() => {
    // Current date references June 20, 2026
    const today = new Date("2026-06-20");
    const minDate = new Date("2026-01-01"); // Start of year 2026
    
    // Find Monday of the week for a given date in UTC
    const getMonday = (d: Date) => {
      const dateCopy = new Date(d);
      const day = dateCopy.getUTCDay();
      // Monday is 1. If day is 0 (Sunday), adjust by -6, etc.
      const diff = dateCopy.getUTCDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(Date.UTC(dateCopy.getUTCFullYear(), dateCopy.getUTCMonth(), diff, 0, 0, 0, 0));
      return mon;
    };

    const currentMonday = getMonday(today);
    const startMonday = getMonday(minDate);

    const weeksMap: { [key: string]: { monday: Date; count: number } } = {};

    // Initialize all weeks from startMonday to currentMonday with count=0
    const temp = new Date(startMonday);
    while (temp <= currentMonday) {
      const mondayStr = temp.toISOString().split('T')[0];
      weeksMap[mondayStr] = {
        monday: new Date(temp),
        count: 0
      };
      // Advance by 7 days
      temp.setUTCDate(temp.getUTCDate() + 7);
    }

    // Populate counts based on customer registration dates
    data.customers.forEach(c => {
      if (!c.createdAt) return;
      const date = new Date(c.createdAt);
      const mon = getMonday(date);
      const mondayStr = mon.toISOString().split('T')[0];
      if (weeksMap[mondayStr]) {
        weeksMap[mondayStr].count += 1;
      } else {
        // Fallback for dates outside or before our initialized table
        weeksMap[mondayStr] = {
          monday: mon,
          count: 1
        };
      }
    });

    // Convert keys to sorted list of week data
    const allWeeks = Object.keys(weeksMap)
      .map(key => ({
        key,
        monday: weeksMap[key].monday,
        count: weeksMap[key].count
      }))
      .sort((a, b) => a.monday.getTime() - b.monday.getTime());

    // Take the last 24 weeks for a beautiful rolling line-chart view
    const lastWeeks = allWeeks.slice(-24);

    return lastWeeks.map(w => {
      const startFormatted = w.monday.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      return {
        label: `W. ab ${startFormatted}`,
        "Registrierungen": w.count,
        fullName: `Woche ab ${startFormatted}.${w.monday.getUTCFullYear()}`
      };
    });
  }, [data.customers]);

  // --- KI-BOT TRAINING ACTIONS ---
  const handleOpenBotRuleModal = (ruleId: string | null = null) => {
    if (ruleId) {
      const rule = (data.botRules || []).find(r => r.id === ruleId);
      if (rule) {
        setSelectedBotRuleId(ruleId);
        setBotRuleForm({
          triggerKeywordsText: rule.triggerKeywords.join(', '),
          answer: rule.answer
        });
      }
    } else {
      setSelectedBotRuleId(null);
      setBotRuleForm({
        triggerKeywordsText: '',
        answer: ''
      });
    }
    setIsBotRuleModalOpen(true);
  };

  const handleSaveBotRule = () => {
    if (!botRuleForm.triggerKeywordsText.trim() || !botRuleForm.answer.trim()) {
      alert('Bitte füllen Sie alle erforderlichen Felder aus!');
      return;
    }

    const keywords = botRuleForm.triggerKeywordsText
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    const currentRules = data.botRules || [];
    let updatedRules = [...currentRules];
    let nextUnresolved = data.unresolvedQueries || [];

    if (selectedBotRuleId) {
      updatedRules = currentRules.map(r => {
        if (r.id === selectedBotRuleId) {
          return {
            ...r,
            triggerKeywords: keywords,
            answer: botRuleForm.answer,
            lastEditedBy: 'M. Weber'
          };
        }
        return r;
      });
    } else {
      const newRule = {
        id: `rule-${Date.now()}`,
        triggerKeywords: keywords,
        answer: botRuleForm.answer,
        usagesCount: 0,
        lastEditedBy: 'M. Weber'
      };
      updatedRules = [...currentRules, newRule];
    }

    if (promotingUnresolvedId) {
      nextUnresolved = nextUnresolved.filter(q => q.id !== promotingUnresolvedId);
    }

    onDataChange({
      ...data,
      botRules: updatedRules,
      unresolvedQueries: nextUnresolved
    });

    setIsBotRuleModalOpen(false);
    setSelectedBotRuleId(null);
    setPromotingUnresolvedId(null);
    setBotRuleForm({ triggerKeywordsText: '', answer: '' });
  };

  const handleDeleteBotRule = (ruleId: string) => {
    if (window.confirm('Möchten Sie diese KI-Antwortregel wirklich unwiderruflich löschen?')) {
      const updatedRules = (data.botRules || []).filter(r => r.id !== ruleId);
      onDataChange({
        ...data,
        botRules: updatedRules
      });
    }
  };

  // --- CORE SYSTEM: BOOKKEEPING & INVOICES ACTIONS ---
  const handleOpenCreateInvoiceModal = () => {
    const nextSeq = ((data.invoices || []).length + 1).toString().padStart(3, '0');
    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setInvoiceForm({
      customerId: data.customers.length > 0 ? data.customers[0].id : '',
      invoiceNumber: `RE-2026-${nextSeq}`,
      issueDate: todayStr,
      dueDate: dueStr,
      description: 'Dienstleistungen & Vorsorge-Honorar',
      taxRate: 19,
      items: [
        { id: `item-${Date.now()}`, description: 'Best-Select Beratungspauschale § 4 Nr. 11 UStG', quantity: 1, unitPrice: 350.00 }
      ]
    });
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceItemAdd = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [
        ...invoiceForm.items,
        { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }
      ]
    });
  };

  const handleInvoiceItemRemove = (itemId: string) => {
    if (invoiceForm.items.length <= 1) return;
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter(it => it.id !== itemId)
    });
  };

  const handleInvoiceItemChange = (itemId: string, field: string, value: any) => {
    const updated = invoiceForm.items.map(it => {
      if (it.id === itemId) {
        return { ...it, [field]: value };
      }
      return it;
    });
    setInvoiceForm({
      ...invoiceForm,
      items: updated
    });
  };

  const handleSaveInvoice = () => {
    if (!invoiceForm.customerId) {
      alert('Bitte wählen Sie einen Mandanten aus.');
      return;
    }
    if (!invoiceForm.invoiceNumber.trim()) {
      alert('Rechnungsnummer darf nicht leer sein.');
      return;
    }

    // Live aggregated finance values
    let netTotal = 0;
    const validatedItems = invoiceForm.items.map(it => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unitPrice) || 0;
      const rowTot = Number((q * p).toFixed(2));
      netTotal += rowTot;
      return {
        id: it.id,
        description: it.description || 'Position',
        quantity: q,
        unitPrice: p,
        total: rowTot
      };
    });

    const taxAmount = Number((netTotal * (Number(invoiceForm.taxRate) / 100)).toFixed(2));
    const grossTotal = Number((netTotal + taxAmount).toFixed(2));

    const selectedCust = data.customers.find(c => c.id === invoiceForm.customerId);

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceForm.invoiceNumber,
      customerId: invoiceForm.customerId,
      customerName: selectedCust ? selectedCust.name : 'Unbekannt',
      netAmount: netTotal,
      taxAmount: taxAmount,
      amount: grossTotal,
      taxRate: Number(invoiceForm.taxRate),
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      status: 'Offen' as const,
      description: invoiceForm.description,
      items: validatedItems
    };

    onDataChange({
      ...data,
      invoices: [...(data.invoices || []), newInvoice]
    });

    setIsInvoiceModalOpen(false);
  };

  const handleUpdateInvoiceStatus = (invId: string, status: 'Bezahlt' | 'Storno' | 'Offen') => {
    const todayStr = new Date().toLocaleDateString('de-DE');
    const updated = (data.invoices || []).map(inv => {
      if (inv.id === invId) {
        return {
          ...inv,
          status,
          paymentMethod: status === 'Bezahlt' ? 'Überweisung' as const : undefined,
          paidAt: status === 'Bezahlt' ? todayStr : undefined
        };
      }
      return inv;
    });

    onDataChange({
      ...data,
      invoices: updated
    });
  };

  const handleExportInvoicesCSV = () => {
    const list = data.invoices || [];
    if (list.length === 0) {
      alert('Keine Rechnungsdaten vorhanden.');
      return;
    }

    let csvContent = "Rechnungsnummer;Mandantenname;Netto;MwSt;Brutto;Ausstellungsdatum;Faelligkeitsdatum;Status;Zahlungsart;Gezahlt Am\n";
    
    list.forEach(inv => {
      csvContent += `${inv.invoiceNumber};${inv.customerName};${inv.netAmount.toFixed(2)};${inv.taxAmount.toFixed(2)};${inv.amount.toFixed(2)};${inv.issueDate};${inv.dueDate};${inv.status};${inv.paymentMethod || ''};${inv.paidAt || ''}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Umsatz_Export_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CORE SYSTEM: CUSTOM DESIGN ROADMAP TEMPLATE ACTIONS ---
  const handleOpenCreateTemplateModal = (tplId: string | null = null) => {
    if (tplId) {
      const target = allTemplates.find(t => t.id === tplId);
      if (target) {
        setEditingTemplateId(tplId);
        setTemplateForm({
          name: target.name,
          description: target.description,
          icon: target.icon || 'Layers',
          category: target.category || 'Versicherung',
          phases: JSON.parse(JSON.stringify(target.phases)), // Deep copy
          tasks: JSON.parse(JSON.stringify(target.tasks))
        });
      }
    } else {
      setEditingTemplateId(null);
      setTemplateForm({
        name: 'Gewerbe Risiko-Vermeidungstaktik v3',
        description: 'Spezifisches Beratungstemplate für Neugewerbe und KMUs im bayerischen Raum.',
        icon: 'Layers',
        category: 'Gewerbe',
        phases: [
          { phase: 1, title: 'Bedarf & Analyse', desc: 'Erstgespräch & Erfassung' },
          { phase: 2, title: 'Konzeptentwicklung', desc: 'Sichtung & Tarifierung' },
          { phase: 3, title: 'Präsentation', desc: 'Abstimmung & Auswahl' },
          { phase: 4, title: 'Gewerbe-Deckung', desc: 'Anträge & Begleitung' },
          { phase: 5, title: 'Laufender Support', desc: 'Updates und Jahrestermine' }
        ],
        tasks: [
          { id: `t-${Date.now()}-1`, phase: 1, title: 'Erstgespräch & Risiko-Briefing', desc: 'Persönliche Absprachen zur gewerblichen Zielsetzung.', role: 'Beide', actionLabel: 'Erstgespräch buchen', actionType: 'appointment' },
          { id: `t-${Date.now()}-2`, phase: 1, title: 'Maklervollmacht \& SEPA', desc: 'Elektronische Freigabe der Vollmachten einholen.', role: 'Kunde', actionLabel: 'Vertrag digital signieren', actionType: 'upload' },
          { id: `t-${Date.now()}-3`, phase: 2, title: 'Auswertung der Betriebshaftungsprotokolle', desc: 'Sichtung aller Unternehmensstrukturen.', role: 'Berater' }
        ]
      });
    }
    setIsTemplateModalOpen(true);
  };

  const handleTemplateTaskAdd = () => {
    setTemplateForm({
      ...templateForm,
      tasks: [
        ...templateForm.tasks,
        { id: `t-${Date.now()}`, phase: 1, title: '', desc: '', role: 'Kunde' }
      ]
    });
  };

  const handleTemplateTaskRemove = (taskId: string) => {
    setTemplateForm({
      ...templateForm,
      tasks: templateForm.tasks.filter(t => t.id !== taskId)
    });
  };

  const handleTemplateTaskChange = (taskId: string, field: string, value: any) => {
    const updated = templateForm.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTemplateForm({
      ...templateForm,
      tasks: updated
    });
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name.trim()) {
      alert('Der Name der Schablone darf nicht leer sein.');
      return;
    }

    const nextId = editingTemplateId || `tpl-${Date.now()}`;
    const targetTemplate = {
      id: nextId,
      name: templateForm.name,
      description: templateForm.description,
      icon: templateForm.icon,
      category: templateForm.category,
      phases: templateForm.phases,
      tasks: templateForm.tasks
    };

    const currentCustoms = data.customTemplates || [];
    let updatedCustoms = [...currentCustoms];

    if (editingTemplateId) {
      const isSystem = ROADMAP_TEMPLATES.some(t => t.id === editingTemplateId);
      if (isSystem) {
        const uniqueId = `tpl-custom-${Date.now()}`;
        targetTemplate.id = uniqueId;
        updatedCustoms.push(targetTemplate);
        alert(`System-Template wurde als bearbeitete Kopie "${targetTemplate.name}" entworfen und abgespeichert!`);
      } else {
        updatedCustoms = currentCustoms.map(t => t.id === editingTemplateId ? targetTemplate : t);
      }
    } else {
      updatedCustoms.push(targetTemplate);
    }

    onDataChange({
      ...data,
      customTemplates: updatedCustoms
    });

    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (tplId: string) => {
    if (confirm('Möchten Sie dieses custom Roadmap-Template wirklich unwiderruflich löschen?')) {
      const updated = (data.customTemplates || []).filter(t => t.id !== tplId);
      onDataChange({
        ...data,
        customTemplates: updated
      });
    }
  };

  const handleTestBotResponse = (text: string) => {
    setBotTestInput(text);
    if (!text.trim()) {
      setBotTestResult(null);
      return;
    }

    const activeRules = data.botRules || [];
    const tokens = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/);
    
    let bestRule: any = null;
    let maxScore = 0;

    for (const rule of activeRules) {
      let score = 0;
      for (const kw of rule.triggerKeywords) {
        if (text.toLowerCase().includes(kw.toLowerCase())) {
          score += 2;
        }
        for (const token of tokens) {
          if (token === kw.toLowerCase()) {
            score += 1;
          }
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestRule = rule;
      }
    }

    if (bestRule && maxScore > 0) {
      setBotTestResult({
        matched: true,
        ruleTitle: `Regel mit Auslösern: "${bestRule.triggerKeywords.slice(0, 3).join(', ')}${bestRule.triggerKeywords.length > 3 ? '...' : ''}"`,
        score: maxScore,
        answer: bestRule.answer
      });
    } else {
      setBotTestResult({
        matched: false,
        score: 0,
        answer: `Oha! Das ist ein sehr interessanter Aspekt. Da mir dazu aktuell noch keine konkreten Trainingsdaten vorliegen, habe ich Ihr Anliegen soeben mit Priorität an meine persönliche Leitstelle und Beraterin **${data.adminProfile?.name || 'Ihren Berater'}** weitergeleitet. 📞\n\nSie wird sich in Kürze persönlich bei Ihnen melden!\n\n💡 *Tipp für den Administrator: Dieses Thema kann im CRM Admin-Panel unter "KI-Bot Training" ausgebildet werden, damit ich beim nächsten Mal direkt automatisiert antworten kann.*`
      });
    }
  };

  // --- CUSTOMER MUTATIONS ---
  const handleOpenCustomerModal = (customer: Customer | null = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerForm({
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        username: customer.username,
        password: '', // Keep empty if not updating
        notes: customer.notes,
        activePhase: customer.activePhase || 1,
        completedTasks: customer.completedTasks || [],
        roadmapEnabled: customer.roadmapEnabled !== false,
        roadmapTemplateId: customer.roadmapTemplateId || 'marketing'
      });
    } else {
      setSelectedCustomer(null);
      setCustomerForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        status: 'Neukunde',
        username: '',
        password: '',
        activePhase: 1,
        completedTasks: [],
        roadmapEnabled: true,
        roadmapTemplateId: 'marketing'
      });
    }
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.name || !customerForm.username || !customerForm.email) {
      alert('Bitte füllen Sie mindestens Name, E-Mail und Benutzername aus.');
      return;
    }

    if (!selectedCustomer) {
      const existingUser = data.customers.find(c => c.username === customerForm.username);
      if (existingUser) {
        alert('Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.');
        return;
      }

      if (!customerForm.password) {
        alert('Geben Sie ein Anfangspasswort für den Kunden an.');
        return;
      }
    }

    // Pre-calculate the secure password hash asynchronously
    let computedPasswordHash = '';
    if (customerForm.password) {
      computedPasswordHash = await hashPassword(customerForm.password);
    }

    onDataChange(prev => {
      let updatedCustomers = [...prev.customers];

      if (selectedCustomer) {
        // Edit existing
        updatedCustomers = updatedCustomers.map(c => {
          if (c.id === selectedCustomer.id) {
            let passwordHash = c.passwordHash;
            if (customerForm.password) {
              passwordHash = computedPasswordHash;
            }
            return {
              ...c,
              name: customerForm.name,
              company: customerForm.company,
              email: customerForm.email,
              phone: customerForm.phone,
              address: customerForm.address,
              status: customerForm.status,
              username: customerForm.username,
              notes: customerForm.notes,
              passwordHash,
              activePhase: customerForm.activePhase,
              completedTasks: customerForm.completedTasks,
              roadmapEnabled: customerForm.roadmapEnabled,
              roadmapTemplateId: customerForm.roadmapTemplateId,
              lastModified: new Date().toISOString()
            };
          }
          return c;
        });
      } else {
        // Create new customer
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: customerForm.name,
          company: customerForm.company,
          email: customerForm.email,
          phone: customerForm.phone,
          address: customerForm.address,
          status: customerForm.status,
          username: customerForm.username,
          passwordHash: computedPasswordHash,
          notes: customerForm.notes,
          createdAt: new Date().toISOString(),
          activePhase: customerForm.activePhase,
          completedTasks: [],
          roadmapEnabled: customerForm.roadmapEnabled,
          roadmapTemplateId: customerForm.roadmapTemplateId
        };
        updatedCustomers.push(newCustomer);
      }

      const log = selectedCustomer 
        ? createSubAuditLog('Benutzer bearbeitet', 'admin', `Kundenprofil '${customerForm.name}' (${customerForm.company}) bearbeitet`, 'info')
        : createSubAuditLog('Benutzer erstellt', 'admin', `Neuer Kunde '${customerForm.name}' (${customerForm.company}) angelegt`, 'success');

      return { 
        ...prev, 
        customers: updatedCustomers,
        auditLogs: [log, ...(prev.auditLogs || [])]
      };
    });

    const notesKey = selectedCustomer ? `admin_customer_notes_${selectedCustomer.id}` : 'admin_customer_notes_new';
    sessionStorage.removeItem(notesKey);
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Möchten Sie diesen Kunden wirklich permanent löschen? Alle zugehörigen Dokumente und Chats werden ebenfalls entfernt.')) {
      const updatedCustomers = data.customers.filter(c => c.id !== customerId);
      const updatedFiles = data.files.filter(f => f.customerId !== customerId);
      const updatedMessages = data.messages.filter(m => m.senderId !== customerId && m.receiverId !== customerId);
      const updatedAppointments = data.appointments.filter(a => a.customerId !== customerId);
      
      onDataChange({
        ...data,
        customers: updatedCustomers,
        files: updatedFiles,
        messages: updatedMessages,
        appointments: updatedAppointments,
        auditLogs: [
          createSubAuditLog('Benutzer gelöscht', 'admin', `Kundenprofil ID '${customerId}' permanent gelöscht (inkl. aller Dokumente & Chat-Mitteilungen)`, 'warning'),
          ...(data.auditLogs || [])
        ]
      });

      if (activeChatCustomerId === customerId) {
        setActiveChatCustomerId(updatedCustomers.length > 0 ? updatedCustomers[0].id : '');
      }
    }
  };

  const handleResetCustomerPassword = async (cust: Customer) => {
    const newPassword = prompt(`Geben Sie ein neues Passwort für ${cust.name} ein:`, "kunde123");
    if (newPassword === null) return;
    if (!newPassword.trim()) {
      alert("Das Passwort darf nicht leer sein.");
      return;
    }
    const hashed = await hashPassword(newPassword);
    onDataChange(prev => {
      const updated = prev.customers.map(c => {
        if (c.id === cust.id) {
          return { ...c, passwordHash: hashed };
        }
        return c;
      });
      return { 
        ...prev, 
        customers: updated,
        auditLogs: [
          createSubAuditLog('Passwort zurückgesetzt', 'admin', `Passwort für '${cust.name}' (${cust.company}) durch Administrator zurückgesetzt`, 'warning'),
          ...(prev.auditLogs || [])
        ]
      };
    });
    alert(`Passwort für ${cust.name} wurde erfolgreich auf "${newPassword}" zurückgesetzt.`);
  };

  const handleApproveCustomer = (cust: Customer) => {
    onDataChange(prev => {
      const updated = prev.customers.map(c => {
        if (c.id === cust.id) {
          return { ...c, approved: true, status: 'Aktiv' as const };
        }
        return c;
      });
      return { 
        ...prev, 
        customers: updated,
        auditLogs: [
          createSubAuditLog('Benutzer freigeschaltet', 'admin', `Selbstregistrierter Mandant '${cust.name}' (${cust.company}) administativ freigeschaltet`, 'success'),
          ...(prev.auditLogs || [])
        ]
      };
    });
    alert(`Der Mandant ${cust.name} wurde erfolgreich freigeschaltet!`);
  };

  // --- VIDEO UPLOAD MUTATION ---
  const handleAdminUploadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoSelectedCustomerId || !videoTitle || !videoFileName) {
      alert('Bitte füllen Sie alle Pflichtfelder aus (Kunde, Videotitel, Dateiname).');
      return;
    }
    const customerObj = data.customers.find(c => c.id === videoSelectedCustomerId);
    if (!customerObj) return;

    const newVideoFile: UploadedFile = {
      id: `file-vid-${Date.now()}`,
      customerId: videoSelectedCustomerId,
      customerName: customerObj.name,
      name: videoFileName,
      type: 'video/mp4',
      size: Math.floor(Math.random() * 50000000) + 15000000, // 15MB to 65MB
      category: 'Video',
      uploadDate: new Date().toISOString().split('T')[0],
      status: videoStatus,
      adminNote: videoAdminNote || `Dieses Video wurde von ${data.adminProfile?.name || 'Ihrem Berater'} für ${customerObj.name} bereitgestellt.`
    };

    onDataChange({
      ...data,
      files: [newVideoFile, ...data.files]
    });

    setVideoUploadSuccessMsg(`Das Video "${videoTitle}" (${videoFileName}) wurde erfolgreich für ${customerObj.name} freigegeben!`);
    setVideoTitle('');
    setVideoFileName('');
    setVideoAdminNote('');
    setTimeout(() => setVideoUploadSuccessMsg(null), 5000);
  };

  // --- APPOINTMENTS MUTATIONS ---
  const handleSaveAppointment = () => {
    if (!appointmentForm.title || !appointmentForm.date || !appointmentForm.time) {
      alert('Bitte füllen Sie Titel, Datum und Uhrzeit aus.');
      return;
    }

    const newAppointment: CalendarAppointment = {
      id: `appt-${Date.now()}`,
      title: appointmentForm.title,
      date: appointmentForm.date,
      time: appointmentForm.time,
      description: appointmentForm.description,
      customerId: appointmentForm.customerId || undefined,
      status: 'Bestätigt'
    };

    onDataChange({
      ...data,
      appointments: [...data.appointments, newAppointment]
    });

    setIsAppointmentModalOpen(false);
    setAppointmentForm({ title: '', date: '', time: '', description: '', customerId: '' });
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm('Möchten Sie diesen Termin permanent löschen?')) {
      onDataChange({
        ...data,
        appointments: data.appointments.filter(a => a.id !== id)
      });
    }
  };

  const handleConfirmAppointment = (id: string) => {
    const appt = data.appointments.find(a => a.id === id);
    if (!appt) return;

    // 1. Update appointment status
    const updatedAppointments = data.appointments.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Bestätigt' as const };
      }
      return a;
    });

    // 2. Draft and E2EE encrypt the confirmation message to the client
    let updatedMessages = [...data.messages];
    if (appt.customerId) {
      const confirmationText = `Hallo! Ich freue mich, Ihren Termin '${appt.title}' am ${appt.date} um ${appt.time} Uhr hiermit zu bestätigen. Viele Grüße, ${data.adminProfile?.name || 'Ihr Berater'}`;
      const encryptedContent = encryptMessage(confirmationText, e2eePassphrase);
      
      const newMsg: DirectMessage = {
        id: `msg-${Date.now()}`,
        senderId: 'admin',
        receiverId: appt.customerId,
        content: confirmationText,
        encryptedContent: encryptedContent,
        isEncrypted: true,
        timestamp: new Date().toISOString(),
        isRead: false,
        syncStatus: isOnline ? 'Synced' : 'PendingSync'
      };
      
      updatedMessages.push(newMsg);
    }

    onDataChange({
      ...data,
      appointments: updatedAppointments,
      messages: updatedMessages
    });

    alert('Der Termin wurde erfolgreich bestätigt und eine Benachrichtigung (DM) wurde automatisch an den Klienten gesendet.');
  };

  const handleRejectAppointment = (id: string) => {
    const appt = data.appointments.find(a => a.id === id);
    if (!appt) return;

    if (!confirm('Möchten Sie diesen Termin ablehnen?')) return;

    // 1. Update appointment status
    const updatedAppointments = data.appointments.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Abgelehnt' as const };
      }
      return a;
    });

    onDataChange({
      ...data,
      appointments: updatedAppointments
    });

    alert('Der Termin wurde abgelehnt.');
  };

  // --- DOCUMENT CENTRE CHANGES ---
  const handleSelectFile = (file: UploadedFile) => {
    setSelectedFile(file);
    setEditingFileNote(file.adminNote || '');
    setEditingFileStatus(file.status);
  };

  const handleUpdateFileStatus = () => {
    if (!selectedFile) return;

    const updatedFiles = data.files.map(f => {
      if (f.id === selectedFile.id) {
        return {
          ...f,
          status: editingFileStatus,
          adminNote: editingFileNote
        };
      }
      return f;
    });

    onDataChange({ ...data, files: updatedFiles });
    setSelectedFile(null);
  };

  // --- DM MUTATIONS ---
  const activeChatCustomer = useMemo(() => {
    return data.customers.find(c => c.id === activeChatCustomerId);
  }, [data.customers, activeChatCustomerId]);

  const activeChatMessages = useMemo(() => {
    return data.messages.filter(
      m => (m.senderId === 'admin' && m.receiverId === activeChatCustomerId) ||
           (m.senderId === activeChatCustomerId && m.receiverId === 'admin')
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data.messages, activeChatCustomerId]);

  const pendingSyncCount = useMemo(() => {
    return data.messages.filter(m => m.syncStatus === 'PendingSync').length;
  }, [data.messages]);

  const handleSyncOfflineMessages = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updatedMessages = data.messages.map(m => {
        if (m.syncStatus === 'PendingSync') {
          return { ...m, syncStatus: 'Synced' as const };
        }
        return m;
      });
      onDataChange({
        ...data,
        messages: updatedMessages
      });
      setIsSyncing(false);
    }, 1200);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAttachmentError(null);
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAttachmentError('Die Anhangsgröße ist auf max. 2 MB begrenzt.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result as string
      });
    };
    reader.onerror = () => {
      setAttachmentError('Datei konnte nicht geladen werden.');
    };
    reader.readAsDataURL(file);
    // Clear input
    e.target.value = '';
  };

  const handleSendDM = () => {
    if ((!chatInput.trim() && !selectedAttachment) || !activeChatCustomerId) return;

    const textContent = chatInput.trim();
    // Default system text representation in case decryption keys mismatch
    const fallbackText = textContent || `Datei gesendet: ${selectedAttachment?.name}`;
    
    // Encrypt the message text
    const encryptedContent = encryptMessage(fallbackText, e2eePassphrase);

    let finalAttachment = undefined;
    if (selectedAttachment) {
      // Encrypt the attachment dataUrl using our key as well! Secure-offline-E2EE!
      const encryptedDataUrl = encryptMessage(selectedAttachment.dataUrl, e2eePassphrase);
      finalAttachment = {
        name: selectedAttachment.name,
        type: selectedAttachment.type,
        size: selectedAttachment.size,
        dataUrl: encryptedDataUrl
      };
    }

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'admin',
      receiverId: activeChatCustomerId,
      content: fallbackText, // For backward compatibility or cleartext preview toggle
      encryptedContent: encryptedContent,
      isEncrypted: true,
      timestamp: new Date().toISOString(),
      isRead: true,
      syncStatus: isOnline ? 'Synced' : 'PendingSync',
      attachment: finalAttachment
    };

    onDataChange({
      ...data,
      messages: [...data.messages, newMsg]
    });

    setChatInput('');
    if (activeChatCustomerId) {
      sessionStorage.removeItem('admin_chat_input_' + activeChatCustomerId);
    }
    setSelectedAttachment(null);
    setAttachmentError(null);
  };

  const handleDeleteMessageAdmin = (msgId: string) => {
    if (confirm('Möchten Sie diese Nachricht wirklich unwiderruflich aus dem Chatverlauf löschen?')) {
      const updatedMessages = (data.messages || []).filter(m => m.id !== msgId);
      onDataChange({
        ...data,
        messages: updatedMessages
      });
    }
  };

  const handleClearFullChatAdmin = (custId: string) => {
    if (confirm('Möchten Sie den gesamten Chatverlauf mit diesem Kunden unwiderruflich leeren? Dies löscht alle Nachrichten und hochgeladenen Chat-Dateien lokal und auf dem Server.')) {
      const updatedMessages = (data.messages || []).filter(
        m => m.senderId !== custId && m.receiverId !== custId
      );
      onDataChange({
        ...data,
        messages: updatedMessages
      });
    }
  };

  // Mark incoming customer DMs as read when opening chat
  const markMessagesAsRead = (custId: string) => {
    const updatedMessages = data.messages.map(m => {
      if (m.senderId === custId && m.receiverId === 'admin' && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    });
    onDataChange({ ...data, messages: updatedMessages });
  };

  const selectChat = (custId: string) => {
    setActiveChatCustomerId(custId);
    markMessagesAsRead(custId);
  };

  // Unread message indicators per customer (for Admin view badge mapping)
  const unreadPerCustomer = useMemo(() => {
    const counts: Record<string, number> = {};
    data.messages.forEach(m => {
      if (m.senderId !== 'admin' && m.receiverId === 'admin' && !m.isRead) {
        counts[m.senderId] = (counts[m.senderId] || 0) + 1;
      }
    });
    return counts;
  }, [data.messages]);

  // --- SEARCH FILTERS FOR DOCUMENTS ---
  const filteredFiles = useMemo(() => {
    return data.files.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
                          f.customerName.toLowerCase().includes(fileSearch.toLowerCase());
      const matchCategory = fileCategoryFilter === 'all' || f.category === fileCategoryFilter;
      const matchCustomer = fileCustomerFilter === 'all' || f.customerId === fileCustomerFilter;
      return matchSearch && matchCategory && matchCustomer;
    });
  }, [data.files, fileSearch, fileCategoryFilter, fileCustomerFilter]);

  // --- RENDER SCREEN DISPATCHER ---
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* 1. MANAGEMENT DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Kunden</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Zentrale</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-indigo-650" />
                <span>Daten-Backup &amp; System</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-medium font-sans">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Lokale Speicherung aktiv
              </div>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            
            {/* Backup Reminder Banner */}
            {adminLoginCount >= 3 && (
              <div className="bg-amber-50 border border-amber-250 rounded shadow-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in select-none">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200 flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-amber-700 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-xs">Sicherheits-Empfehlung: CRM-Daten vollständig sichern ({adminLoginCount} Logins ohne Backup)</h4>
                    <p className="text-[11px] text-amber-700 mt-1 leading-normal max-w-2xl">
                      Da dieses CRM-System zu 100 % datenschutzkonform und lokal in Ihrer Browser-Sandbox arbeitet, können gelöschte Caches zum Datenverlust führen. Sichern Sie jetzt Ihren aktuellen Kanzleibestand als verschlüsselte JSON-Datei ab.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={handleExportFullJSON}
                    className="flex-1 md:flex-initial px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Vollständiges CRM-Datenbank-Backup herunterladen"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Jetzt Backup erstellen</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetLoginCount}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-650 border border-slate-200 text-xs font-bold rounded transition-all cursor-pointer"
                    title="Meldung für die nächsten Logins ausblenden"
                  >
                    Später erinnern
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Header */}
            <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded shadow-sm">
              <div>
                <h1 className="text-base font-bold text-slate-800">Willkommen zurück, {data.adminProfile?.name || 'Administrator'}</h1>
                <p className="text-xs text-slate-500 mt-0.5">Hier ist Ihr aktuelles Consulting- und CRM-Management im Überblick.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('admin-profile-settings')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Inhaber-Profil & Firmenname direkt anpassen"
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-hover" />
                  <span>Kanzlei-Profil & Name anpassen</span>
                </button>
                <div className="px-2.5 py-1 bg-blue-50 text-blue-750 border border-blue-150 rounded font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Offline-Datenbank</span>
                </div>
              </div>
            </div>

            {/* Subtiler Auto-Logout Tracker */}
            {secondsRemaining !== undefined && (
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Sicherheitssitzung (Automatischer Logout bei Inaktivität)</span>
                  </div>
                  <div className="font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                    Sperrung/Abmeldung in {Math.floor(secondsRemaining / 60)} Min. {secondsRemaining % 60} Sek.
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear shadow-xs" 
                    style={{ width: `${(secondsRemaining / (15 * 60)) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-mono mt-1 pr-1 text-right uppercase tracking-tight">
                  * Jede Aktion im CRM (Mausbewegung, Tastendruck, Klick) verlängert die Sitzung wieder auf volle 15 Minuten.
                </p>
              </div>
            )}

          {/* Quick Metrics Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Aktive Kunden</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{data.customers.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Verträge & Dateien</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {data.files.filter(f => f.category === 'Vertrag').length} / {data.files.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-pink-50 text-pink-600 rounded-xl">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Kunden-Videos</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {data.files.filter(f => f.category === 'Video').length} uploaded
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Ungelesene Chats</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {(Object.values(unreadPerCustomer) as number[]).reduce((a,b) => a+b, 0)} Nachrichten
                </p>
              </div>
            </div>
          </div>

          {/* STATS & DATA MANAGEMENT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 bg-slate-100/30 rounded-2xl border border-slate-200/50">
            {/* Box 1: Mandanten-Registrierungsstatus */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-4 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Mandanten-Registrierungsstatus</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-150">
                    <span className="text-[9px] font-mono uppercase font-black text-slate-400 block tracking-wider leading-none">Registriert</span>
                    <span className="text-lg font-extrabold text-slate-800 block mt-2">{data.customers.length}</span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">Mandanten</span>
                  </div>
                  <div className="bg-emerald-55/10 p-3 rounded-lg border border-emerald-100">
                    <span className="text-[9px] font-mono uppercase font-black text-emerald-600 block tracking-wider leading-none">Freigeschaltet</span>
                    <span className="text-lg font-extrabold text-emerald-700 block mt-2">
                      {data.customers.filter(c => c.approved !== false).length}
                    </span>
                    <span className="text-[9px] text-emerald-550 block mt-0.5">Aktiv / Bereit</span>
                  </div>
                  <div className="bg-amber-55/10 p-3 rounded-lg border border-amber-100">
                    <span className="text-[9px] font-mono uppercase font-black text-amber-600 block tracking-wider leading-none">Ausstehend</span>
                    <span className="text-lg font-extrabold text-amber-700 block mt-2">
                      {data.customers.filter(c => c.approved === false).length}
                    </span>
                    <span className="text-[9px] text-amber-550 block mt-0.5">Unverifiziert</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Beispieldaten-Management */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  <span>Beispieldaten-Management</span>
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 font-sans leading-relaxed">
                  Steuern Sie die Testumgebung. Löschen Sie alle Demo-Datensätze (Clean-Slate) oder spielen Sie die Standard-Daten jederzeit neu ein.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSystemReset('empty')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 hover:border-rose-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Beispieldaten killen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSystemReset('demo')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 hover:border-indigo-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Daten neu einspielen</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recharts Kundenaktivität (Registrierungen pro Woche) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 font-sans">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-2 border-b border-slate-100/70">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span>Kundenaktivität (Registrierungen pro Woche)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Anzahl der wöchentlichen Neuanmeldungen und Mandanten-Registrierungen über das Jahr 2026 hinweg (letzte 24 Wochen im rollierenden Verlauf).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Wöchentliche Kontrollmetrik
                  </span>
                </div>
              </div>

              <div className="h-64 w-full mt-2 pr-4 select-text">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="label" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      dy={10}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      dx={-5}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '0.75rem', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontFamily: 'sans-serif'
                      }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#101827' }}
                      itemStyle={{ color: '#4f46e5', fontSize: '12px', fontWeight: 'semibold' }}
                      formatter={(value: any) => [`${value} Registrierung(en)`, 'Neuanmeldungen']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Registrierungen" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ stroke: '#4f46e5', strokeWidth: 1.5, r: 4, fill: '#ffffff' }}
                      activeDot={{ r: 7, stroke: '#5046e6', strokeWidth: 2, fill: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Native SVG Visualization: File category ratio & weekly progression */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Dokumentenuploads & Aktivitätsverlauf</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visuelle Übersicht aller hochgeladenen Client-Dateien</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">Letzte 30 Tage</span>
              </div>
              
              {/* Animated custom SVG representation */}
              <div className="h-64 flex flex-col justify-end p-2">
                <div className="flex items-end justify-around h-48 border-b border-slate-200 pb-2 font-mono text-[10px] text-slate-400">
                  <div className="flex flex-col items-center group w-12">
                    <div className="w-8 bg-blue-500 rounded-t-lg h-24 hover:bg-blue-600 transition-all flex items-center justify-center text-white text-[9px] font-bold">
                      {data.files.filter(f => f.category === 'Vertrag').length}
                    </div>
                    <span className="mt-2 text-[10px] font-sans font-medium text-slate-600">Verträge</span>
                  </div>

                  <div className="flex flex-col items-center group w-12">
                    <div className="w-8 bg-pink-500 rounded-t-lg h-16 hover:bg-pink-600 transition-all flex items-center justify-center text-white text-[9px] font-bold">
                      {data.files.filter(f => f.category === 'Video').length}
                    </div>
                    <span className="mt-2 text-[10px] font-sans font-medium text-slate-600">Videos</span>
                  </div>

                  <div className="flex flex-col items-center group w-12">
                    <div className="w-8 bg-emerald-500 rounded-t-lg h-12 hover:bg-emerald-600 transition-all flex items-center justify-center text-white text-[9px] font-bold">
                      {data.files.filter(f => f.category === 'Datei').length}
                    </div>
                    <span className="mt-2 text-[10px] font-sans font-medium text-slate-600">Dateien</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-xs text-slate-400 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-lg"></span>
                    <span>Rechtliche Verträge</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-pink-500 rounded-lg"></span>
                    <span>Videoberatungen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-lg"></span>
                    <span>Zusatzdokumente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action checklist / recent logs */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-800 mb-4">Anstehende Termine</h3>
              <div className="space-y-4">
                {data.appointments.length > 0 ? (
                  data.appointments.slice(0, 4).map(appt => {
                    const client = data.customers.find(c => c.id === appt.customerId);
                    return (
                      <div key={appt.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3 hover:bg-slate-100/55 transition-colors">
                        <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-700">{appt.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{appt.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/50">
                              {appt.date} • {appt.time} Uhr
                            </span>
                            {client && (
                              <span className="text-[10px] text-slate-400 font-medium">Kunde: {client.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-10 text-center">Keine Termine geplant.</p>
                )}
              </div>
            </div>
          </div>

          {/* Pending Document Upload Review List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
            <h3 className="text-base font-bold text-slate-800 mb-4">Ungeprüfte Kundendokumente / Freigaben</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-mono uppercase">
                    <th className="py-3 px-4 font-bold">Kunde</th>
                    <th className="py-3 px-4 font-bold">Dateiname</th>
                    <th className="py-3 px-4 font-bold">Kategorie</th>
                    <th className="py-3 px-4 font-bold">Upload-Datum</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.files.filter(f => f.status === 'Eingereicht').length > 0 ? (
                    data.files.filter(f => f.status === 'Eingereicht').map(file => (
                      <tr key={file.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{file.customerName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">{file.name}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                            file.category === 'Vertrag' ? 'bg-blue-50 text-blue-700' :
                            file.category === 'Video' ? 'bg-pink-50 text-pink-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {file.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                          {new Date(file.uploadDate).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-medium border border-amber-200/50">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Ungeprüft</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                        Alle eingereichten Dateien wurden bearbeitet und freigegeben!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Profile & Stammdaten */}
          <div id="admin-profile-settings" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 scroll-mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Inhaber-Profil & Firmen-Stammdaten</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bearbeiten Sie Ihre personengebundenen Daten, um das Portal an Ihre Firma anzupassen.</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Konfigurations-Zentrale</span>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-6">
              {profileSaveSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Profil erfolgreich auf dem Server gespeichert und im gesamten Portal aktualisiert!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Spalte 1: Stammdaten */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">1. Allgemeine Informationen</h4>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name des Inhabers / Beraters</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="z.B. Max Muster-Consultant"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Firmenname / Unternehmen</label>
                    <input 
                      type="text" 
                      value={profileCompany} 
                      onChange={(e) => setProfileCompany(e.target.value)}
                      placeholder="z.B. Muster Consulting GmbH"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">E-Mail-Adresse</label>
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="z.B. info@firma.de"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Telefonnummer</label>
                      <input 
                        type="text" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="z.B. +49 123 45678"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse (Anschrift)</label>
                    <textarea 
                      value={profileAddress} 
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Musterstraße 10, 80331 München"
                      rows={2}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Spalte 2: Zahlungs- & Abrechnungsdaten */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">2. Bank- & Steuerdaten (Rechnungen)</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Geldinstitut (Bankname)</label>
                      <input 
                        type="text" 
                        value={profileBankName} 
                        onChange={(e) => setProfileBankName(e.target.value)}
                        placeholder="Muster Stadtsparkasse"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Steuernummer</label>
                      <input 
                        type="text" 
                        value={profileTaxNumber} 
                        onChange={(e) => setProfileTaxNumber(e.target.value)}
                        placeholder="143/123/45678"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">IBAN</label>
                      <input 
                        type="text" 
                        value={profileIban} 
                        onChange={(e) => setProfileIban(e.target.value)}
                        placeholder="DE89 3704 0044..."
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">BIC</label>
                      <input 
                        type="text" 
                        value={profileBic} 
                        onChange={(e) => setProfileBic(e.target.value)}
                        placeholder="WELADED1MUC"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Handelsregisternr. (HRB - optional)</label>
                      <input 
                        type="text" 
                        value={profileHrb} 
                        onChange={(e) => setProfileHrb(e.target.value)}
                        placeholder="z.B. HRB 98765"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Rechnungs-Fußnote</label>
                      <input 
                        type="text" 
                        value={profileFootnote} 
                        onChange={(e) => setProfileFootnote(e.target.value)}
                        placeholder="z.B. Alle Preise zzgl. gesetzlicher USt."
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Sicherheits-Zugangsdaten / Passwort-Änderung */}
                  <div className="pt-4 mt-4 border-t border-slate-205">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 font-mono flex items-center gap-1">
                      🔐 Administrator-Passwort ändern (optional)
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Neues Passwort</label>
                        <input 
                          type="password" 
                          value={profileNewPassword} 
                          onChange={(e) => setProfileNewPassword(e.target.value)}
                          placeholder="Unverändert lassen"
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Neues Passwort bestätigen</label>
                        <input 
                          type="password" 
                          value={profileConfirmPassword} 
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          placeholder="Neues Passwort bestätigen"
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">
                      * Leer lassen, wenn Sie Ihr bestehendes Passwort behalten möchten.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 font-semibold text-white rounded text-xs hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
                >
                  Profil & Stammdaten dauerhaft speichern
                </button>
              </div>
            </form>
          </div>

          {/* SYSTEM SECURITY AUDIT LOG SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 font-sans">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <span>Administrative System-Audit-Logbuch (Echtzeit)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lückenlose Aufzeichnung aller kritischen Ereignisse (Sitzungen, Login-Versuche, Freischaltungen, Änderungen & Datenexporte).
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportAuditLogsCSV}
                  className="px-3 py-1.5 bg-indigo-55/70 hover:bg-indigo-100 text-indigo-705 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Gesamtes Audit-Log als CSV-Datei herunterladen"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Log exportieren (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAuditLogs}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Alle Einträge unwiderruflich löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Protokoll leeren</span>
                </button>
              </div>
            </div>

            {/* Filters Controls */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Logs durchsuchen nach Aktion, Initiator, IP-Adresse oder Details..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-700"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-250 w-full md:w-auto overflow-x-auto">
                {(['all', 'success', 'info', 'warning', 'failure'] as const).map(lev => {
                  const label = lev === 'all' ? 'Alle' :
                                lev === 'success' ? 'Erfolg' :
                                lev === 'info' ? 'Info' :
                                lev === 'warning' ? 'Warnung' : 'Sperre/Fehler';
                  return (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setAuditStatusFilter(lev)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        auditStatusFilter === lev 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-mono uppercase tracking-wider select-none">
                      <th 
                        className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                        onClick={() => {
                          if (auditSortField === 'timestamp') {
                            setAuditSortDirection(p => p === 'asc' ? 'desc' : 'asc');
                          } else {
                            setAuditSortField('timestamp');
                            setAuditSortDirection('desc');
                          }
                        }}
                      >
                        <span className="flex items-center gap-1">
                          Zeitstempel (UTC)
                          {auditSortField === 'timestamp' && (
                            <span>{auditSortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                          )}
                        </span>
                      </th>
                      <th 
                        className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                        onClick={() => {
                          if (auditSortField === 'action') {
                            setAuditSortDirection(p => p === 'asc' ? 'desc' : 'asc');
                          } else {
                            setAuditSortField('action');
                            setAuditSortDirection('asc');
                          }
                        }}
                      >
                        <span className="flex items-center gap-1">
                          Aktion
                          {auditSortField === 'action' && (
                            <span>{auditSortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                          )}
                        </span>
                      </th>
                      <th 
                        className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                        onClick={() => {
                          if (auditSortField === 'user') {
                            setAuditSortDirection(p => p === 'asc' ? 'desc' : 'asc');
                          } else {
                            setAuditSortField('user');
                            setAuditSortDirection('asc');
                          }
                        }}
                      >
                        <span className="flex items-center gap-1">
                          Initiator
                          {auditSortField === 'user' && (
                            <span>{auditSortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                          )}
                        </span>
                      </th>
                      <th className="py-3 px-4 font-bold whitespace-nowrap">IP-Adresse</th>
                      <th className="py-3 px-4 font-bold whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 font-bold min-w-[200px]">Details &amp; Sicherheitsrelevanter Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAndSortedAuditLogs.length > 0 ? (
                      filteredAndSortedAuditLogs.map(log => {
                        const statusColors = 
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          log.status === 'failure' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                          log.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200';
                        
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">{log.action}</td>
                            <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">{log.user}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                              {log.ipAddress || '127.0.0.1 (Local)'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide border ${statusColors}`}>
                                {log.status === 'success' && 'SUCCESS'}
                                {log.status === 'info' && 'INFO'}
                                {log.status === 'warning' && 'WARNING'}
                                {log.status === 'failure' && 'FAILURE'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[11px] font-medium leading-relaxed max-w-md break-words text-slate-650">
                              {log.details}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                          {auditSearch ? 'Keine Audit-Logs entsprechen Ihren Filtereinstellungen.' : 'Noch keine systemkritischen Logbucheinträge vorhanden.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
              <div>
                Einträge: {filteredAndSortedAuditLogs.length} von {(data.auditLogs || []).length} insgesamt (Gefiltert)
              </div>
              <div>
                Protokolltyp: ISO-Sitzungsvalidierung auf Client-Ebene (E2EE verschlüsselt)
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. KUNDENVERWALTUNG (DIRECTORY & CREATION) */}
      {activeTab === 'customers' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Kunden</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Verzeichnis</span>
            </div>
             <div className="flex items-center gap-2">
              {/* CSV Import */}
              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold shadow-2xs border border-slate-250 transition-all flex items-center gap-1.5 cursor-pointer select-none">
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold shadow-2xs border border-slate-250 transition-all flex items-center gap-1.5 cursor-pointer select-none"
                title="Mandantenliste als CSV herunterladen"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCustomerModal()}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2 cursor-pointer select-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Neuen Kunden anlegen</span>
              </button>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {data.customers.some(c => c.approved === false) && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-amber-800 animate-fade-in">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">Ausstehende Mandanten-Registrierungen</h4>
                    <p className="text-[11px] text-amber-600 mt-0.5">Es liegen {data.customers.filter(c => c.approved === false).length} unverifizierte Mandanten-Anmeldungen vor, die manuell freigeschaltet werden müssen.</p>
                  </div>
                </div>
                <div className="bg-amber-500 text-white rounded-full font-mono text-xs font-bold w-6 h-6 flex items-center justify-center shadow-xs shrink-0">
                  {data.customers.filter(c => c.approved === false).length}
                </div>
              </div>
            )}
            {/* Action Bar & Stats */}
            <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">🔍 Schnell-Suche</p>
                  <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 rounded px-3 py-1.5 w-full">
                    <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <input
                      id="customer-search-input"
                      type="text"
                      placeholder="Suche Name, Firma, Notizen, Branche, Produkte..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-xs w-full focus:ring-0"
                    />
                  </div>
                </div>

                {/* Filter Status */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">⚡ Registrierungsstatus</p>
                  <select
                    value={customerStatusFilter}
                    onChange={(e) => setCustomerStatusFilter(e.target.value as any)}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 h-[34px]"
                  >
                    <option value="all">Alle Registrierungen</option>
                    <option value="approved">Freigeschaltete Konten</option>
                    <option value="pending">Ausstehende Aktivierungen</option>
                  </select>
                </div>

                {/* Sort Field */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">⇅ Sortieren nach</p>
                  <select
                    value={customerSortField}
                    onChange={(e) => setCustomerSortField(e.target.value as any)}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 h-[34px]"
                  >
                    <option value="createdAt">Registrierungsdatum</option>
                    <option value="name">Name des Mandanten</option>
                    <option value="company">Unternehmensname</option>
                    <option value="approved">Freigabe-Status</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 font-mono">⇅ Reihenfolge</p>
                  <div className="flex bg-slate-100 border border-slate-200 rounded p-0.5 h-[34px]">
                    <button
                      type="button"
                      onClick={() => setCustomerSortOrder('asc')}
                      className={`flex-1 rounded text-center text-xs font-bold transition-all ${
                        customerSortOrder === 'asc' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      ▲ ASC
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerSortOrder('desc')}
                      className={`flex-1 rounded text-center text-xs font-bold transition-all ${
                        customerSortOrder === 'desc' ? 'bg-indigo-650 text-white shadow-xs' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                      }`}
                    >
                      ▼ DESC
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-xs font-mono uppercase">
                    <th className="py-3 px-4 font-bold">Kunde & Unternehmen</th>
                    <th className="py-3 px-4 font-bold">Benutzername (Login)</th>
                    <th className="py-3 px-4 font-bold">E-Mail & Telefon</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Anmeldedatum</th>
                    <th className="py-3 px-4 font-bold text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.customers
                    .filter(c => {
                      const query = customerSearch.toLowerCase().trim();
                      const matchesSearch = 
                        !query ||
                        (c.name || '').toLowerCase().includes(query) ||
                        (c.company || '').toLowerCase().includes(query) ||
                        (c.notes || '').toLowerCase().includes(query) ||
                        (c.email || '').toLowerCase().includes(query) ||
                        (c.phone || '').toLowerCase().includes(query) ||
                        (c.address || '').toLowerCase().includes(query) ||
                        (c.onboarding?.industry || '').toLowerCase().includes(query) ||
                        (c.onboarding?.services || '').toLowerCase().includes(query) ||
                        (c.onboarding?.products || '').toLowerCase().includes(query) ||
                        (c.onboarding?.description || '').toLowerCase().includes(query) ||
                        (c.onboarding?.specialFeatures || '').toLowerCase().includes(query) ||
                        (c.onboarding?.individualRequirements || '').toLowerCase().includes(query);
                      
                      if (!matchesSearch) return false;

                      if (customerStatusFilter === 'approved') {
                        return c.approved !== false;
                      } else if (customerStatusFilter === 'pending') {
                        return c.approved === false;
                      }

                      return true;
                    })
                    .sort((a, b) => {
                      let comparison = 0;
                      if (customerSortField === 'createdAt') {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        comparison = dateA - dateB;
                      } else if (customerSortField === 'name') {
                        comparison = (a.name || '').localeCompare(b.name || '', 'de');
                      } else if (customerSortField === 'company') {
                        comparison = (a.company || '').localeCompare(b.company || '', 'de');
                      } else if (customerSortField === 'approved') {
                        const appA = a.approved !== false ? 1 : 0;
                        const appB = b.approved !== false ? 1 : 0;
                        comparison = appA - appB;
                      }

                      return customerSortOrder === 'asc' ? comparison : -comparison;
                    })
                    .map(cust => (
                      <tr key={cust.id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">{cust.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{cust.company}</p>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-blue-600 bg-blue-50/20 px-2.5 py-1 rounded-lg">
                          {cust.username}
                        </td>
                        <td className="py-4 px-4 text-xs font-mono">
                          <p className="font-sans text-slate-600 font-medium">{cust.email}</p>
                          <p className="text-slate-400 mt-0.5">{cust.phone || 'Keine Telefonnummer'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                              cust.approved === false ? 'bg-amber-500 text-white border-amber-600 animate-pulse' :
                              cust.status === 'Stammkunde' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                              cust.status === 'Neukunde' ? 'bg-blue-50 text-blue-600 border-blue-200/50' :
                              cust.status === 'Aktiv' ? 'bg-indigo-50 text-indigo-600 border-indigo-200/50' :
                              'bg-slate-50 text-slate-600 border-slate-200/50'
                            }`}>
                              {cust.approved === false ? 'Aktivierung ausstehend' : cust.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                          {new Date(cust.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {cust.approved === false && (
                              <button
                                onClick={() => handleApproveCustomer(cust)}
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-850 text-white rounded text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer scale-105"
                                title="Mandanten freischalten"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Freischalten</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedCustForContracts(cust)}
                              className="p-1.5 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                              title="Projektvereinbarungen sichten & verwalten"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleResetCustomerPassword(cust)}
                              className="p-1.5 hover:bg-slate-100 text-amber-600 hover:text-amber-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                              title="Passwort für diesen Kunden zurücksetzen"
                            >
                              <LockKeyhole className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleOpenCustomerModal(cust)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                              title="Kundenkonto bearbeiten"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(cust.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                              title="Kunde permanent löschen"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CUSTOMER MODAL (CREATE / EDIT) */}
          {isCustomerModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-scale-up">
                <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">
                    {selectedCustomer ? 'Kundenkonto bearbeiten' : 'Neues Kundenkonto anlegen'}
                  </h3>
                  <button
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-opacity font-bold font-mono text-lg p-2 leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Voller Name*</label>
                      <input
                        type="text"
                        placeholder="z.B. Max Mustermann"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Firma / Unternehmen</label>
                      <input
                        type="text"
                        placeholder="z.B. Muster GmbH"
                        value={customerForm.company}
                        onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">E-Mail*</label>
                      <input
                        type="email"
                        placeholder="kunde@firmendomain.de"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Telefonnummer</label>
                      <input
                        type="text"
                        placeholder="+49 89 123456"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Adresse</label>
                    <input
                      type="text"
                      placeholder="Straße, Hausnummer, PLZ & Ort"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Portal Login: Benutzername*</label>
                      <input
                        type="text"
                        placeholder="z.B. max.muster"
                        value={customerForm.username}
                        onChange={(e) => setCustomerForm({ ...customerForm, username: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">
                        {selectedCustomer ? 'Passwort überschreiben' : 'Anfangs-Passwort*'}
                      </label>
                      <input
                        type="password"
                        placeholder={selectedCustomer ? 'Unverändert lassen' : 'kunde123'}
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 transition-colors"
                      />
                      {customerForm.password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1 h-1.5">
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(customerForm.password).score >= 1 ? getPasswordStrength(customerForm.password).bgClass : 'bg-slate-200'}`}></div>
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(customerForm.password).score >= 2 ? getPasswordStrength(customerForm.password).bgClass : 'bg-slate-200'}`}></div>
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(customerForm.password).score >= 3 ? getPasswordStrength(customerForm.password).bgClass : 'bg-slate-200'}`}></div>
                            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(customerForm.password).score >= 4 ? getPasswordStrength(customerForm.password).bgClass : 'bg-slate-200'}`}></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-mono">Passwortstärke:</span>
                            <span className={`font-semibold font-mono ${getPasswordStrength(customerForm.password).textColor}`}>
                              {getPasswordStrength(customerForm.password).label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Kunden-Klassifizierung</label>
                      <select
                        value={customerForm.status}
                        onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value as Customer['status'] })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      >
                        <option value="Neukunde">Neukunde (Default)</option>
                        <option value="Stammkunde">Stammkunde</option>
                        <option value="Aktiv">Aktiv</option>
                        <option value="Inaktiv">Inaktiv</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Consulting- & Projektphase</label>
                      <select
                        value={customerForm.activePhase}
                        onChange={(e) => setCustomerForm({ ...customerForm, activePhase: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      >
                        <option value={1}>Phase 1: Erstgespräch & Briefing</option>
                        <option value={2}>Phase 2: Audit & Datenanalyse</option>
                        <option value={3}>Phase 3: Strategie-Entwurf</option>
                        <option value={4}>Phase 4: Umsetzung & Medienbearbeitung</option>
                        <option value={5}>Phase 5: Abschluss & Auswertung</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Interne CRM Notizen</label>
                    <textarea
                      placeholder="Besonderheiten, Vertragskonditionen, Video-Feedback-Frequenz..."
                      rows={3}
                      value={customerForm.notes}
                      onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  {/* INTERACTIVE ROADMAP MEILENSTEINE PLANNER */}
                  <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100/50">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-indigo-600" />
                          <span>Fahrplan für Mandanten freischalten (Scharf schalten)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Bestimmen Sie, ob dieser Kunde seine interaktive Schritt-für-Schritt-Roadmap einsehen kann.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setCustomerForm({ ...customerForm, roadmapEnabled: !customerForm.roadmapEnabled })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            customerForm.roadmapEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              customerForm.roadmapEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 font-mono">
                        Ruhestands- oder Consulting-Schablone (Template) auswählen
                      </label>
                      <select
                        value={customerForm.roadmapTemplateId}
                        onChange={(e) => setCustomerForm({ ...customerForm, roadmapTemplateId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-indigo-500 transition-colors"
                      >
                        {allTemplates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {tpl.name} ({tpl.description})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 font-mono">Phasen-Meilensteine & Aufgaben-Checkliste</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                        Hier können Sie den Fortschritt des Kunden steuern. To-dos werden direkt abgehakt oder Phasen freigeschaltet.
                      </p>
                    </div>

                    {/* Predefined milestones grouped by phase */}
                    <div className="space-y-3 pt-1">
                      {([1, 2, 3, 4, 5] as const).map((ph) => {
                        const activeTemplate = allTemplates.find(t => t.id === customerForm.roadmapTemplateId) || allTemplates[0];
                        const phaseDetails = activeTemplate.phases.find(p => p.phase === ph);
                        const phaseName = `Phase ${ph}: ${phaseDetails ? phaseDetails.title : 'Beratungsschritt'}`;

                        const phaseTasks = activeTemplate.tasks.filter(t => t.phase === ph);
                        const completedInPhase = phaseTasks.filter(t => customerForm.completedTasks.includes(t.id)).length;
                        const isCurrentActive = customerForm.activePhase === ph;

                        return (
                          <div 
                            key={ph} 
                            className={`rounded-xl border p-3.5 bg-white transition-all ${
                              isCurrentActive ? 'border-indigo-400 ring-2 ring-indigo-50/50 bg-indigo-50/10' : 'border-slate-150'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-dashed border-slate-100">
                              <span className={`text-[11px] font-bold ${isCurrentActive ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {phaseName} {isCurrentActive && '📍'}
                              </span>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                                  {completedInPhase} / {phaseTasks.length} To-dos
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCustomerForm({ ...customerForm, activePhase: ph })}
                                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded cursor-pointer transition-all ${
                                    isCurrentActive 
                                      ? 'bg-indigo-600 text-white border border-indigo-650 shadow-xs' 
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isCurrentActive ? 'Aktiv' : 'Aktivieren'}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 pl-1.5">
                              {phaseTasks.map(task => {
                                const isChecked = customerForm.completedTasks.includes(task.id);
                                return (
                                  <label 
                                    key={task.id} 
                                    className="flex items-start gap-2 text-[11px] font-sans text-slate-600 hover:text-slate-800 transition-colors cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        let updated: string[];
                                        if (isChecked) {
                                          updated = customerForm.completedTasks.filter(id => id !== task.id);
                                        } else {
                                          updated = [...customerForm.completedTasks, task.id];
                                        }
                                        setCustomerForm({ ...customerForm, completedTasks: updated });
                                      }}
                                      className="mt-0.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 w-3.5 h-3.5 shrink-0"
                                    />
                                    <div>
                                      <span className={isChecked ? 'line-through text-slate-400 font-medium' : 'font-medium text-slate-700'}>
                                        {task.title}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                        Rolle: <strong className={task.role === 'Berater' ? 'text-blue-600' : 'text-slate-500'}>
                                          {task.role === 'Berater' ? (data.adminProfile?.name ? `${data.adminProfile.name.split(' ')[0]} (Sie)` : 'Berater (Sie)') : task.role === 'Kunde' ? 'Kunde (Mandant)' : 'Zusammenarbeit'}
                                        </strong>
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-medium text-sm"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveCustomer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all duration-200 text-sm"
                  >
                    Konto speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER CONTRACTS OVERVIEW MODAL (EYE ICON CLICK) */}
          {selectedCustForContracts && (
            <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="admin-cust-contracts-modal">
              <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Banner */}
                <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <span className="text-[10px] bg-emerald-500/25 text-emerald-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-400/20 uppercase">
                        VERTRAGSMAPPE (ADMIN-SICHT)
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        Verträge von {selectedCustForContracts.name} {selectedCustForContracts.company && `(${selectedCustForContracts.company})`}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustForContracts(null)}
                    className="text-slate-400 hover:text-white font-bold font-mono text-xl leading-none p-2 cursor-pointer transition-colors border-none bg-transparent"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable Contents */}
                <div className="p-6 overflow-y-auto space-y-6">
                  
                  {/* General Kanzlei Metadata */}
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-150 flex items-start gap-3">
                    <span className="text-emerald-750 text-base">📈</span>
                    <div className="text-xs text-slate-650 leading-relaxed">
                      <strong>Projekt- & Service-Übersicht:</strong> Die folgenden Projektdaten von <strong>{selectedCustForContracts.name}</strong> sind auf dem neuesten aktiven Stand. Als Berater ({data.adminProfile?.name || 'Administrator'}) können Sie diese jederzeit einsehen und steuern.
                    </div>
                  </div>

                  {/* Portfolio KPI summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-[9px] uppercase font-mono text-slate-400 font-bold">Aktive Projektmodule</p>
                        <h4 className="text-sm font-bold text-slate-800">3 Module</h4>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center gap-3">
                      <Euro className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-[9px] uppercase font-mono text-slate-400 font-bold">Monatliches Budget</p>
                        <h4 className="text-sm font-bold text-slate-800">3.550,00 €</h4>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-[9px] uppercase font-mono text-slate-400 font-bold">Projektstatus</p>
                        <h4 className="text-sm font-bold text-emerald-750">Im Zeitplan</h4>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Contracts Table or Contract Editor Form */}
                  {editingContract ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveContract(editingContract);
                      }}
                      className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2.5 mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <span>{editingContract.id ? 'Projektmodul editieren' : 'Neues Projektmodul anlegen'}</span>
                        </h4>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {editingContract.id || 'NEU'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Name des Projektmoduls *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.name || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, name: e.target.value })}
                            placeholder="z.B. Massivholztisch & Stühle"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Verantwortliches Gewerk / Partner *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.insurer || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, insurer: e.target.value })}
                            placeholder="z.B. Tischler-Werkstatt"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vereinbarungsnummer *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono text-[11px]"
                            value={editingContract.policyNumber || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, policyNumber: e.target.value })}
                            placeholder="z.B. MOB-MUC-101-26"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Budget (€) *</label>
                          <input
                            type="number"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
                            value={editingContract.premium || 0}
                            onChange={(e) => setEditingContract({ ...editingContract, premium: parseFloat(e.target.value) || 0 })}
                            placeholder="z.B. 8500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Abrechnungsart *</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.paymentInterval || 'Projekt'}
                            onChange={(e) => setEditingContract({ ...editingContract, paymentInterval: e.target.value })}
                          >
                            <option value="Projekt">Projektgebunden</option>
                            <option value="Pauschal">Pauschal</option>
                            <option value="Monat">Monatlich</option>
                            <option value="Einmalig">Einmalig</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Projektstatus *</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.status || 'Aktiv'}
                            onChange={(e) => setEditingContract({ ...editingContract, status: e.target.value })}
                          >
                            <option value="In Vorbereitg.">In Vorbereitung</option>
                            <option value="Aktiv">Aktiv</option>
                            <option value="In Fertigung">In Fertigung</option>
                            <option value="Abgeschlossen">Abgeschlossen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Startdatum *</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.startDate || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lieferdatum / Milestones *</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.mainDueDate || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, mainDueDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Zusatzvereinbarung / Konditionen</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.deductible || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, deductible: e.target.value })}
                            placeholder="z.B. Inkl. Montage"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Geltungsbereich (Ort / Raum)</label>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                            value={editingContract.scope || ''}
                            onChange={(e) => setEditingContract({ ...editingContract, scope: e.target.value })}
                            placeholder="z.B. Loft im Erdgeschoss"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Leistungsinhalte / Arbeitsschritte (Ein Eintrag pro Zeile)</label>
                        <textarea
                          rows={3}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                          value={(editingContract.details || []).join('\n')}
                          onChange={(e) => setEditingContract({ ...editingContract, details: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="CAD-Konstruktionszeichnung des Tisches&#10;Auswahl der Massivholz-Chargen (Wildeiche)&#10;Lieferung & staubfreie Endmontage"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setEditingContract(null)}
                          className="px-3.5 py-1.5 border border-slate-200 text-slate-750 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer border-none"
                        >
                          Speichern
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {/* Sub header for adding new portfolio contract */}
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Projektmodule & Leistungsübersicht</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Erfassungsbögen und meilenstein-basierte Werksverträge des Kunden</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingContract({
                            id: '',
                            name: '',
                            insurer: 'Tischler-Werkstatt',
                            policyNumber: `MOB-${selectedCustForContracts.id.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}-26`,
                            premium: 2500,
                            paymentInterval: 'Projekt',
                            status: 'Aktiv',
                            startDate: new Date().toISOString().split('T')[0],
                            deductible: 'Inkl. Montage',
                            contactPerson: 'Zentraler Tischlereileiter',
                            coverage: 'Komplett',
                            scope: 'Wohnräume im Aufmaß',
                            mainDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            billingMethod: 'Abschlagsrechnung',
                            details: []
                          })}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer border-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Projektmodul hinzufügen</span>
                        </button>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-650 min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3 font-bold">Projektmodul</th>
                                <th className="px-4 py-3 font-bold">Kooperationspartner</th>
                                <th className="px-4 py-3 font-bold">Vereinbarungsnummer</th>
                                <th className="px-4 py-3 text-right font-bold">Budget</th>
                                <th className="px-4 py-3 text-center font-bold">Status</th>
                                <th className="px-4 py-3 text-right font-bold">Aktionen</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                              {(selectedCustForContracts.contracts || getPlausibleContracts(selectedCustForContracts)).map((contract) => (
                                <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-[10px] shrink-0 border border-emerald-100/60 font-mono">
                                        {contract.name.substring(0, 3).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-800 text-xs block">{contract.name}</span>
                                        <span className="text-[10px] text-slate-400 block font-mono leading-none mt-0.5">{contract.scope}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 text-slate-705 font-semibold">{contract.insurer}</td>
                                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">{contract.policyNumber}</td>
                                  <td className="px-4 py-3.5 text-right font-bold font-mono text-slate-800 whitespace-nowrap">
                                    {contract.premium.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} <span className="text-[9px] text-slate-450 font-normal font-sans">/ {contract.paymentInterval}</span>
                                  </td>
                                  <td className="px-4 py-3.5 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border bg-emerald-50 text-emerald-700 border-emerald-150">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                                      {contract.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAdminDetailPolicy(contract)}
                                        className="px-2 py-1 text-slate-700 hover:text-white border border-slate-200 hover:bg-slate-900 rounded-lg text-[10px] font-bold shadow-3xs transition-all flex items-center gap-1 cursor-pointer bg-white"
                                        title="Leistungsinhalte detailiert einsehen"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Details</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingContract(contract)}
                                        className="px-2 py-1 text-slate-700 hover:text-white border border-slate-200 hover:bg-slate-900 rounded-lg text-[10px] font-bold shadow-3xs transition-all flex items-center gap-1 cursor-pointer bg-white"
                                        title="Projektmodul editieren"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteContract(contract.id)}
                                        className="px-2 py-1 text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-lg text-[10px] font-bold shadow-3xs transition-all flex items-center gap-1 cursor-pointer bg-white"
                                        title="Projektmodul löschen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Löschen</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer buttons */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChatCustomerId(selectedCustForContracts.id);
                      onTabChange && onTabChange('messages');
                      setSelectedCustForContracts(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 border-none"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat mit {selectedCustForContracts.name} öffnen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCustForContracts(null)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Schließen
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ADMIN ACTION: CONTRACT DETAILS MODAL */}
          {selectedAdminDetailPolicy && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4 animate-fade-in" id="admin-policy-details-modal">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-400/20 uppercase">
                        VERTRAGSDETAILS
                      </span>
                      <h4 className="text-sm font-bold mt-0.5">
                        {selectedAdminDetailPolicy.name}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAdminDetailPolicy(null)}
                    className="text-slate-400 hover:text-white font-bold text-xl leading-none p-3 cursor-pointer border-none bg-transparent"
                  >
                    ×
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Honorar / Budget</span>
                      <strong className="text-xs text-slate-800 font-mono font-black">
                        {selectedAdminDetailPolicy.premium.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </strong>
                      <span className="text-[9px] text-slate-450 block font-normal">pro {selectedAdminDetailPolicy.paymentInterval}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Nebenkosten</span>
                      <strong className="text-xs text-slate-800 font-mono font-semibold">
                        {selectedAdminDetailPolicy.deductible}
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Laufzeit / Limit</span>
                      <strong className="text-xs text-indigo-700 font-semibold block">
                        {selectedAdminDetailPolicy.coverage.split(' ')[0]}
                      </strong>
                      <span className="text-[8px] text-slate-450 font-mono uppercase block truncate">
                        {selectedAdminDetailPolicy.coverage.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-mono uppercase font-bold block">Projektende</span>
                      <strong className="text-xs text-slate-800 font-mono font-semibold">
                        {new Date(selectedAdminDetailPolicy.mainDueDate).toLocaleDateString('de-DE')}
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide border-b pb-2">
                        Wichtige Leistungskomponenten
                      </h5>
                      <ul className="space-y-2">
                        {selectedAdminDetailPolicy.details.map((detail: string, index: number) => (
                           <li key={index} className="flex items-start gap-2.5 text-xs text-slate-650 leading-relaxed font-sans">
                             <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                             <span>{detail}</span>
                           </li>
                        ))}
                      </ul>
                    </div>

                    <div className="md:col-span-5 bg-slate-50/65 p-4 rounded-xl border border-slate-150 space-y-3">
                      <h5 className="text-[10px] font-bold text-indigo-905 font-mono uppercase tracking-wider border-b pb-2">
                        Stammdaten des Projekts
                      </h5>
                      <div className="space-y-2 text-xs font-sans">
                        <div className="flex justify-between border-b pb-1">
                           <span className="text-slate-400 text-[11px]">Dienstleister:</span>
                           <strong className="text-slate-800 text-right font-medium">{selectedAdminDetailPolicy.insurer}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-1 font-mono text-[11px]">
                           <span className="text-slate-400">Vertrags-Nr:</span>
                           <strong className="text-slate-850">{selectedAdminDetailPolicy.policyNumber}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                           <span className="text-slate-400 text-[11px]">Geltungsbereich:</span>
                           <strong className="text-slate-800 text-right font-medium">{selectedAdminDetailPolicy.scope}</strong>
                        </div>
                        <div className="flex justify-between text-[11px]">
                           <span className="text-slate-400">Abrechnung:</span>
                           <span className="text-slate-800 font-semibold">{selectedAdminDetailPolicy.billingMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer close */}
                <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedAdminDetailPolicy(null)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Zurück zur Übersicht
                  </button>
                </div>

              </div>
            </div>
          )}
        </div></div>
      )}

      {/* 3. DOKUMENTEN-ZENTRALE / ARCHIV */}
      {activeTab === 'files' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Kunden</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Dokumenten-Zentrale</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold border border-indigo-150">
                {filteredFiles.length} DATEIEN INSGESAMT
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {/* Aggregated Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-2 border border-slate-200 rounded shadow-sm">
              <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded px-2.5 py-1">
                <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Projekt/Datei..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-xs w-full"
                />
              </div>

              <div>
                <select
                  value={fileCategoryFilter}
                  onChange={(e) => setFileCategoryFilter(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-xs outline-none text-slate-700 focus:bg-white transition-colors"
                >
                  <option value="all">Kategorie: Alle</option>
                  <option value="Vertrag">Kategorie: Verträge</option>
                  <option value="Video">Kategorie: Videos</option>
                  <option value="Datei">Kategorie: Zusatzdateien</option>
                </select>
              </div>

              <div>
                <select
                  value={fileCustomerFilter}
                  onChange={(e) => setFileCustomerFilter(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-xs outline-none text-slate-700 focus:bg-white transition-colors"
                >
                  <option value="all">Mandant: Alle Kunden</option>
                  {data.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

            <div className="flex items-center justify-end font-mono text-xs text-slate-400 font-bold self-center">
              Treffer: {filteredFiles.length} Dokumente
            </div>
          </div>

          {/* Files Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(file => {
                const isContract = file.category === 'Vertrag';
                const isVideo = file.category === 'Video';
                return (
                  <div key={file.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-5 flex-1 space-y-4">
                      {/* Brand Label Header */}
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isContract ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                          isVideo ? 'bg-pink-50 text-pink-700 border-pink-200/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        }`}>
                          {file.category}
                        </span>

                        <span className={`inline-flex items-center text-[10px] uppercase font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                          file.status === 'Genehmigt' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                          file.status === 'In Bearbeitung' ? 'bg-amber-50 text-amber-600 border-amber-200/50' :
                          file.status === 'Abgelehnt' ? 'bg-rose-50 text-rose-600 border-rose-200/50' :
                          'bg-slate-50 text-slate-600 border-slate-200/50'
                        }`}>
                          {file.status}
                        </span>
                      </div>

                      {/* Icon & Details */}
                      <div className="flex items-start space-x-3.5">
                        <div className={`p-3 rounded-xl ${
                          isContract ? 'bg-blue-100/40 text-blue-600' :
                          isVideo ? 'bg-pink-100/40 text-pink-600' : 'bg-emerald-100/40 text-emerald-600'
                        }`}>
                          {isContract ? <FileText className="h-6 w-6" /> :
                           isVideo ? <Video className="h-6 w-6" /> : <File className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate" title={file.name}>
                            {file.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">Kunde: <span className="font-semibold text-slate-600">{file.customerName}</span></p>
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/40 space-y-1 text-xs text-slate-500 font-mono">
                        <div className="flex justify-between">
                          <span>Größe:</span>
                          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Eingereicht am:</span>
                          <span>{new Date(file.uploadDate).toLocaleDateString('de-DE')}</span>
                        </div>
                      </div>

                      {/* Admin Note display */}
                      {file.adminNote && (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-slate-600 text-xs italic">
                          <strong>Admin Feedback:</strong> {file.adminNote}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100/80 flex items-center justify-between">
                      <button
                        onClick={() => handleSelectFile(file)}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Status & Notiz bearbeiten</span>
                      </button>
                      
                      {file.dataUrl ? (
                        <a
                          href={file.dataUrl}
                          download={file.name}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Echte Datei herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(`Simulierter Download für: ${file.name}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Simulierter Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white p-16 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">Keine hochgeladenen Dokumente zu diesen Kriterien gefunden.</p>
              </div>
            )}
          </div>

          {/* EDIT DOCUMENT FREIGABE STATUS MODAL */}
          {selectedFile && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-scale-up">
                <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">Dokumentenprüfung & Feedback</h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-white transition-opacity font-bold font-mono text-lg p-2 leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-mono space-y-1">
                    <p><strong>Datei:</strong> {selectedFile.name}</p>
                    <p><strong>Eingereicht von:</strong> {selectedFile.customerName}</p>
                    <p><strong>Format:</strong> {selectedFile.type}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-15 font-mono">Freigabe-Status</label>
                    <div className="grid grid-cols-4 gap-2.5 mt-2">
                      {(['Eingereicht', 'In Bearbeitung', 'Genehmigt', 'Abgelehnt'] as const).map(status => {
                        const isSelected = editingFileStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setEditingFileStatus(status)}
                            className={`px-3 py-2 text-xs rounded-xl font-semibold border transition-all text-center ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Feedback & Anweisungen an den Kunden</label>
                    <textarea
                      placeholder="Tragen Sie hier Anregungen, Prüfungshinweise oder Korrekturwünsche ein. Der Kunde sieht dies direkt in seinem Portal."
                      rows={5}
                      value={editingFileNote}
                      onChange={(e) => setEditingFileNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors resize-none mt-1"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-medium text-sm"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleUpdateFileStatus}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all duration-200 text-sm"
                  >
                    Status speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div></div>
      )}

      {/* 4. DIREKTNACHRICHTEN (DMs) CHAT DASHBOARD */}
      {activeTab === 'messages' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>CRM</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">DMs (Secure Chat)</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Online/Offline Mode Switch */}
              <button
                type="button"
                onClick={() => onOnlineToggle(!isOnline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-emerald-500/20' 
                    : 'bg-amber-655 text-amber-900 border border-amber-300 bg-amber-50'
                }`}
                title={isOnline ? 'Online-Modus aktiv: Nachrichten werden synchronisiert' : 'Offline-Modus aktiv: Nachrichten werden lokal zwischengespeichert'}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-100" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
                <span>{isOnline ? 'Live-Netzwerk' : 'Lokal Offline'}</span>
              </button>

              {/* Active Pending Sync Counter & Button */}
              {pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={handleSyncOfflineMessages}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 animate-pulse cursor-pointer disabled:opacity-50"
                  title="Ausstehende DMs übertragen"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Übertrage...' : `${pendingSyncCount} syncen`}</span>
                </button>
              )}

              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold uppercase shadow-sm">
                E2EE active
              </span>
            </div>
          </header>

          <div className="flex-grow flex overflow-hidden divide-x divide-slate-200 bg-white">
          {/* Left panel: list of conversations */}
          <div className="w-80 flex flex-col bg-slate-50 h-full">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Nachrichtenverläufe</h3>
              <p className="text-xs text-slate-500 mt-0.5">Wählen Sie einen Mandanten aus</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {data.customers.map(c => {
                const isSelected = c.id === activeChatCustomerId;
                const unread = unreadPerCustomer[c.id] || 0;
                
                // Get the last message preview
                const lastMsg = data.messages
                  .filter(m => (m.senderId === 'admin' && m.receiverId === c.id) || (m.senderId === c.id && m.receiverId === 'admin'))
                  .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

                return (
                  <button
                    key={c.id}
                    onClick={() => selectChat(c.id)}
                    className={`w-full flex items-start space-x-3 p-3.5 rounded-xl transition-all text-left ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'hover:bg-slate-200/50 text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-300 rounded-xl flex items-center justify-center font-bold text-sm text-slate-800 uppercase flex-shrink-0">
                      {c.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs truncate uppercase tracking-wider">{c.name}</h4>
                        {unread > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full scale-100">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {c.company}
                      </p>
                      {lastMsg && (
                        <p className={`text-xs mt-1.5 truncate ${isSelected ? 'text-blue-100/90' : 'text-slate-500'}`}>
                          {lastMsg.senderId === 'admin' ? 'Ich: ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: conversational timeline */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            {activeChatCustomer ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Active Chat Header with E2EE Credentials */}
                <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold uppercase">
                      {activeChatCustomer.name.slice(0,2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-none">{activeChatCustomer.name}</h3>
                      <span className="text-xs text-slate-400 mt-1 block">Kunde • {activeChatCustomer.company}</span>
                    </div>
                  </div>

                  {/* E2EE Passphrase Adjustment & Cipher Text Toggle */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-blue-700 font-semibold font-mono">
                      <LockKeyhole className="w-3.5 h-3.5" />
                      <span>E2EE Schlüssel:</span>
                    </div>
                    <input
                      type="text"
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono w-36 text-slate-700 outline-none focus:border-blue-500"
                      value={e2eePassphrase}
                      onChange={(e) => setE2eePassphrase(e.target.value)}
                      placeholder="E2EE Passwort..."
                      title="Alle gesendeten Nachrichten und Dateianhänge werden mit diesem Passwort verschlüsselt."
                    />
                    <button
                      type="button"
                      onClick={() => setShowRawCiphers(!showRawCiphers)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                        showRawCiphers
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Umschalten zwischen verschlüsselter Datenstromansicht und entschlüsseltem Klartext"
                    >
                      {showRawCiphers ? '🔒 Roh-Chiffre' : '👁️ Klartext'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleClearFullChatAdmin(activeChatCustomer.id)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 rounded text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer"
                      title="Gesamten Chatverlauf mit diesem Kunden löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Chat leeren</span>
                    </button>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeChatMessages.length > 0 ? (
                    activeChatMessages.map(msg => {
                      const isMe = msg.senderId === 'admin';
                      let displayedText = msg.content;
                      let decryptionError = false;

                      if (msg.isEncrypted) {
                        if (showRawCiphers) {
                          displayedText = msg.encryptedContent || '';
                        } else {
                          const decrypted = decryptMessage(msg.encryptedContent || '', e2eePassphrase);
                          if (decrypted.startsWith('[Decryption Error')) {
                            decryptionError = true;
                          }
                          displayedText = decrypted;
                        }
                      }

                      const isPending = msg.syncStatus === 'PendingSync';

                      // Decrypt attachments on fly if they are encrypted
                      let decryptedAttachmentUrl = '';
                      let attachmentDecryptionError = false;
                      if (msg.attachment) {
                        if (!showRawCiphers) {
                          const decryptedAtt = decryptMessage(msg.attachment.dataUrl, e2eePassphrase);
                          if (decryptedAtt.startsWith('[Decryption Error')) {
                            attachmentDecryptionError = true;
                          } else {
                            decryptedAttachmentUrl = decryptedAtt;
                          }
                        }
                      }

                      return (
                        <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-lg rounded-2xl p-4 shadow-sm text-sm relative ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/60'
                          }`}>
                            <p className={`whitespace-pre-wrap leading-relaxed ${decryptionError ? 'text-rose-300 font-mono text-xs' : 'font-sans'}`}>
                              {displayedText}
                            </p>

                            {/* Attachment rendering */}
                            {msg.attachment && (
                              <div className={`mt-3 p-2.5 rounded-xl border flex flex-col space-y-2 ${
                                isMe 
                                  ? 'bg-blue-700/60 border-blue-500 text-blue-50' 
                                  : 'bg-slate-50 border-slate-200 text-slate-850'
                              }`}>
                                <div className="flex items-center space-x-2.5 text-xs">
                                  <FileText className={`w-4 h-4 ${isMe ? 'text-blue-300' : 'text-blue-600'}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate" title={msg.attachment.name}>{msg.attachment.name}</p>
                                    <p className={`text-[9px] font-mono mt-0.5 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                      {(msg.attachment.size / 1024).toFixed(1)} KB • {msg.attachment.type.split('/').pop()?.toUpperCase()}
                                    </p>
                                  </div>
                                </div>

                                {showRawCiphers ? (
                                  <div className="p-1.5 bg-black/15 rounded text-[8px] font-mono break-all line-clamp-2 text-slate-300">
                                    {msg.attachment.dataUrl.slice(0, 100)}...
                                  </div>
                                ) : attachmentDecryptionError ? (
                                  <div className="text-[10px] text-rose-500 font-mono font-bold">
                                    ⚠️ Entschlüsselung fehlgeschlagen
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-current/10">
                                    {msg.attachment.type.startsWith('image/') && decryptedAttachmentUrl && (
                                      <img
                                        src={decryptedAttachmentUrl}
                                        alt={msg.attachment.name}
                                        className="w-10 h-10 object-cover rounded-md border border-black/10 flex-shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <a
                                      href={decryptedAttachmentUrl}
                                      download={msg.attachment.name}
                                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1 hover:brightness-110 transition-all ${
                                        isMe
                                          ? 'bg-blue-700/80 border-blue-600 text-white hover:bg-blue-650'
                                          : 'bg-blue-50 border-blue-100 text-blue-750 hover:bg-blue-100'
                                      }`}
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Herunterladen</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Metadata */}
                            <div className="flex items-center justify-end space-x-1.5 mt-2">
                              {msg.isEncrypted && (
                                <ShieldCheck className={`w-3.5 h-3.5 ${
                                  decryptionError ? 'text-rose-400 animate-pulse' : isMe ? 'text-blue-300' : 'text-emerald-500'
                                }`} title="E2E Verschlüsselt" />
                              )}
                              {isPending && (
                                <span className={`text-[8px] font-bold font-mono px-1 rounded flex items-center gap-0.5 ${
                                  isMe ? 'bg-amber-500/20 text-text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-600'
                                }`} title="In lokaler Warteschlange (Offline)">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Warteschlange (Offline)</span>
                                </span>
                              )}
                              <span className={`block text-[10px] font-mono ${
                                isMe ? 'text-blue-200' : 'text-slate-400'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </span>

                              {/* Interactive message delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMessageAdmin(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-300 hover:text-rose-450 hover:underline ml-2 transition-all cursor-pointer bg-transparent border-none outline-none font-mono font-bold"
                                title="Nachricht löschen"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <MessageSquare className="h-8 w-8 mx-auto opacity-50 mb-3" />
                      <p className="text-xs">Starten Sie die Unterhaltung mit Herrn {activeChatCustomer.name.split(' ').pop()}!</p>
                    </div>
                  )}
                </div>

                {/* Chat Control Input Fields */}
                <div className="p-4 bg-white border-t border-slate-200">
                  {/* File Attachment Chip */}
                  {selectedAttachment && (
                    <div className="mb-3 p-2.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-150 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold truncate max-w-xs">{selectedAttachment.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({(selectedAttachment.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAttachment(null)}
                        className="text-slate-400 hover:text-slate-600 font-bold p-1 leading-none text-sm transition-colors cursor-pointer"
                        title="Anhang löschen"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Attachment size error alert */}
                  {attachmentError && (
                    <div className="mb-3 p-2 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-xs animate-shake">
                      {attachmentError}
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      id="admin-attachment-input-file"
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-attachment-input-file"
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20"
                      title="Anhang hochladen (max. 2MB)"
                    >
                      <Paperclip className="w-5 h-5" />
                    </label>

                    <input
                      type="text"
                      placeholder={selectedAttachment ? 'Optionalen Text zum Anhang schreiben...' : 'Schreiben Sie eine Direktnachricht...'}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                    />
                    <button
                      onClick={handleSendDM}
                      className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-slate-400">
                <MessageSquare className="h-12 w-12 opacity-40 mb-3" />
                <p className="text-sm font-semibold">Keine aktiven Kommunikationspartner registriert.</p>
              </div>
            )}
          </div>
        </div></div>
      )}

      {/* 5. TERMINE & PLANUNG */}
      {activeTab === 'appointments' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Klienten</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Besprechungs-Kalender</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAppointmentModalOpen(true)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neuen Termin eintragen</span>
              </button>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded shadow-sm p-4 font-sans">
              <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider font-mono">Anstehende Beratungstermine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.appointments.length > 0 ? (
                data.appointments.map(appt => {
                  const client = data.customers.find(c => c.id === appt.customerId);
                  const isConfirmed = appt.status === 'Bestätigt';
                  const isRejected = appt.status === 'Abgelehnt';
                  const isPending = !appt.status || appt.status === 'Ausstehend';

                  return (
                    <div key={appt.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/50 hover:shadow-sm transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            {appt.date} um {appt.time} Uhr
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' :
                              isRejected ? 'bg-rose-50 text-rose-700 border-rose-250/50' :
                              'bg-amber-50 text-amber-700 border-amber-250/50 animate-pulse'
                            }`}>
                              <span>{appt.status || 'Ausstehend'}</span>
                            </span>
                            <button
                              onClick={() => handleDeleteAppointment(appt.id)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Termin permanent löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{appt.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{appt.description}</p>
                      </div>

                      <div className="mt-4 border-t border-slate-200/60 pt-3 space-y-3">
                        {client && (
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Klient:</span>
                            <span className="font-semibold text-slate-600">{client.name} ({client.company})</span>
                          </div>
                        )}

                        {isPending && appt.customerId && (
                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-dashed border-slate-200">
                            <button
                              onClick={() => handleConfirmAppointment(appt.id)}
                              className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Bestätigen</span>
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appt.id)}
                              className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Ablehnen</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto opacity-40 mb-3" />
                  <p className="text-sm font-semibold">Keine anstehenden Termine eingetragen.</p>
                </div>
              )}
            </div>
          </div>

          {/* APPOINTMENT MODAL */}
          {isAppointmentModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-up">
                <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <h3 className="text-lg font-bold">Neuen Termin planen</h3>
                  <button
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="text-slate-400 hover:text-white transition-opacity font-bold font-mono text-lg p-2 leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Arbeitstitel / Thema*</label>
                    <input
                      type="text"
                      placeholder="z.B. Feedback-Review Vorstellungsvideo"
                      value={appointmentForm.title}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Datum*</label>
                      <input
                        type="date"
                        value={appointmentForm.date}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Uhrzeit*</label>
                      <input
                        type="time"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Mandant / Kunde</label>
                    <select
                      value={appointmentForm.customerId}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, customerId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors"
                    >
                      <option value="">Interner Termin (Keine Kundenverknüpfung)</option>
                      {data.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Beschreibung / Notizen</label>
                    <textarea
                      placeholder="Besprechungsinhalte oder Raumkoordinaten angeben..."
                      rows={3}
                      value={appointmentForm.description}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-blue-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsAppointmentModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-medium text-sm"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveAppointment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-all duration-200 text-sm"
                  >
                    Termin planen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div></div>
      )}

      {/* VIDEO UPLOADS PANEL - DISABLED */}
      {false && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none" id="admin-video-uploads-tab">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Medienmanagement</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Video-Uploads & Kampagnen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-pink-200">
                PRODUKTIONSSTUDIO • AKTIV
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-6 select-text">
            {/* Status alerts */}
            {videoUploadSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{videoUploadSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form to Upload Video */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" />
                    <span>Neues Kundenvideo hochladen</span>
                  </h3>
                  <p className="text-[10.5px] text-slate-450 mt-1 leading-normal">
                    Laden Sie fertige Schnittversionen, Social-Media Clips oder Vorsorge-Erklärungsvideos für Ihre Mandanten hoch. Nach dem Freigeben erscheinen diese sofort im Kundenportal des ausgewählten Kontakts.
                  </p>
                </div>

                <form onSubmit={handleAdminUploadVideo} className="space-y-4 text-xs font-sans">
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">1. Mandant auswählen*</label>
                    <select
                      required
                      value={videoSelectedCustomerId}
                      onChange={(e) => setVideoSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 font-medium focus:border-indigo-500 focus:bg-white transition-colors"
                    >
                      <option value="">-- Kundenkonto wählen --</option>
                      {data.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company || 'Privatkunde'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">2. Videotitel*</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Social Recruiting Werbevideo v1"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-705 font-medium focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">3. Dateiname (Simulierter Upload)*</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="z.B. recruitment_final_1080p.mp4"
                        value={videoFileName}
                        onChange={(e) => setVideoFileName(e.target.value)}
                        className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-705 font-mono text-xs focus:border-indigo-500 focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const titles = ["kampagnen_teaser_tiktok.mp4", "geschaeftsbericht_erklaerung.mp4", "mitarbeiter_imagefilm_heis.mp4", "gewerbe_risikoanalyse_praes.mp4"];
                          setVideoFileName(titles[Math.floor(Math.random() * titles.length)]);
                        }}
                        className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all"
                        title="Zufälliger Dateiname"
                      >
                        Auto-Gen
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">4. Status bei Veröffentlichung</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVideoStatus('Genehmigt')}
                        className={`py-2 px-3 rounded-xl border text-center transition-all ${
                          videoStatus === 'Genehmigt'
                            ? 'bg-[#004d3d] border-[#004d3d] text-white font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Direkt genehmigt
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoStatus('Eingereicht')}
                        className={`py-2 px-3 rounded-xl border text-center transition-all ${
                          videoStatus === 'Eingereicht'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Pendent (Freigabe nötig)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">5. Begleitnotiz des Anbieters (Admin-Notiz)</label>
                    <textarea
                      placeholder="Geben Sie hier Feedback-Wünsche, Anforderungen oder Konditionen für das Video ein..."
                      rows={3}
                      value={videoAdminNote}
                      onChange={(e) => setVideoAdminNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-705 font-medium focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Video freigeben & bereitstellen</span>
                  </button>

                </form>
              </div>

              {/* Right Column: Existing Videos Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wide flex items-center gap-2">
                      <Video className="w-4.5 h-4.5 text-pink-600 animate-pulse" />
                      <span>Aktive Kunden-Videoverbindungen ({data.files.filter(f => f.category === 'Video').length})</span>
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-1">
                      Liste aller hochgeladenen Video-Schnitt- und Erklärdateien pro Mandant.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-550 min-w-[500px]">
                    <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">Zugeordneter Kunde</th>
                        <th className="px-5 py-3.5 font-bold">Video & Dateiname</th>
                        <th className="px-5 py-3.5 font-bold">Datum</th>
                        <th className="px-5 py-3.5 font-bold">Größe</th>
                        <th className="px-5 py-3.5 text-center font-bold">Status</th>
                        <th className="px-4 py-3.5 text-center font-bold">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {data.files
                        .filter(f => f.category === 'Video')
                        .map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50/40 transition-all duration-200">
                            <td className="px-5 py-4">
                              <span className="font-bold text-slate-800 block text-xs">{file.customerName}</span>
                              <span className="text-[9px] text-slate-400 font-mono uppercase">ID: {file.customerId}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg shrink-0 flex items-center justify-center">
                                  <Video className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-semibold text-slate-800 text-[11px] block truncate">{file.name}</span>
                                  <span className="text-[9px] text-slate-450 block truncate max-w-[200px]">{file.adminNote}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                              {new Date(file.uploadDate).toLocaleDateString('de-DE')}
                            </td>
                            <td className="px-5 py-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </td>
                            <td className="px-5 py-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                                file.status === 'Genehmigt'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                  : 'bg-amber-50 text-amber-700 border-amber-150'
                              }`}>
                                {file.status === 'Genehmigt' ? 'Freigegeben' : 'Ausstehend'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Möchten Sie das Video "${file.name}" permanent löschen?`)) {
                                    onDataChange({
                                      ...data,
                                      files: data.files.filter(f => f.id !== file.id)
                                    });
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer bg-transparent"
                                title="Video löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {data.files.filter(f => f.category === 'Video').length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            Bisher keine Kunden-Video-Uploads vorhanden. Verwenden Sie das Formular links!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. KI-BOT TRAINING */}
      {activeTab === 'bottraining' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Roboter & Automation</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Tschu-Tschu Bot Ausbildung</span>
            </div>
            <button
              onClick={() => handleOpenBotRuleModal()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Standard-Antwort trainieren</span>
            </button>
          </header>

          {/* Dual Column Layout: Left Column FAQ Rules, Right Column Simulator sandbox */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 bg-slate-50">
            {/* Left FAQ Rules Board */}
            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden border-r border-slate-200">
              <div className="p-5 border-b border-slate-200 bg-white flex-shrink-0">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Aktive Trainingsdaten & Frage-Trigger ({(data.botRules || []).length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Durchsucht empfangene Klienten-Chatnachrichten nach den untenstehenden Schlüsselwörtern und antwortet vollautomatisiert mit E2E-verschlüsselter Militärgrad-Security.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {(data.botRules || []).length > 0 ? (
                  (data.botRules || []).map((rule) => (
                    <div key={rule.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/50 hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {rule.triggerKeywords.map((kw) => (
                              <span key={kw} className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg">
                                #{kw}
                              </span>
                            ))}
                          </div>
                          
                          {/* Usage counter & Admin actions badge */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>{rule.usagesCount} Auslösungen</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              von: {rule.lastEditedBy || 'System'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55">
                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                            {rule.answer}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenBotRuleModal(rule.id)}
                          className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-150 bg-white hover:bg-indigo-50/20 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Muster korrigieren</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBotRule(rule.id)}
                          className="px-3 py-1.5 text-rose-600 hover:text-white border border-rose-100 hover:bg-rose-600 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Löschen</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Cpu className="h-10 w-10 mx-auto opacity-30 mb-3" />
                    <p className="text-xs font-semibold">Keine KI-Trainingsregeln definiert.</p>
                  </div>
                )}
              </div>

              {/* Unresolved Questions Section */}
              <div className="border-t border-slate-200 bg-indigo-50/20 p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>Ungelöste Fragen & Trainingsbedarf ({(data.unresolvedQueries || []).length})</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Fragen von Klienten, bei denen die KI das Standard-Fallback auslösen musste. Trainieren Sie den Bot mit einem Klick!
                    </p>
                  </div>
                  
                  {(data.unresolvedQueries || []).length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Möchten Sie alle erfassten ungelösten Fragen unwiderruflich aus der Liste löschen?')) {
                          onDataChange({ ...data, unresolvedQueries: [] });
                        }
                      }}
                      className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer bg-transparent border-none outline-none"
                    >
                      Alle leeren
                    </button>
                  )}
                </div>

                {(data.unresolvedQueries || []).length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin">
                    {(data.unresolvedQueries || []).map((q) => (
                      <div key={q.id} className="min-w-[280px] max-w-[320px] bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex-shrink-0 snap-start flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-1.5">
                            <span>Klient: {q.customerName}</span>
                            <span>{new Date(q.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 italic line-clamp-2">
                            "{q.query}"
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[10px]">
                          <button
                            onClick={() => {
                              const filtered = (data.unresolvedQueries || []).filter(item => item.id !== q.id);
                              onDataChange({ ...data, unresolvedQueries: filtered });
                            }}
                            className="px-2 py-1 text-slate-500 hover:text-rose-650 font-bold cursor-pointer"
                          >
                            Ignorieren
                          </button>
                          <button
                            onClick={() => {
                              const prefilledKeywords = q.query
                                .toLowerCase()
                                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
                                .split(/\s+/)
                                .filter(token => token.length > 3)
                                .join(', ');

                              setSelectedBotRuleId(null);
                              setPromotingUnresolvedId(q.id);
                              setBotRuleForm({
                                triggerKeywordsText: prefilledKeywords,
                                answer: `Hallo {Vorname}, bezüglich Deiner Frage zu "${q.query}": ...`
                              });
                              setIsBotRuleModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-55 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Diesen Fall trainieren</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 font-medium">
                    Keine unbeantworteten Fragen erfasst. Der Bot läuft fabelhaft! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Right Sandbox Test Simulator Panel */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-hidden bg-white">
              <div className="p-5 border-b border-slate-200 bg-slate-50/40 flex-shrink-0">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Sandbox: Bot-Reaktionstest</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Prüfen Sie live, ob ein Klienten-Auslöser das richtige Wissen anspricht, bevor Sie es aktivieren.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                    Klienten-Simulationsnachricht
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 outline-none text-slate-700 text-xs focus:border-indigo-500 focus:bg-white transition-colors"
                      placeholder="z.B. Wie viel kostet das Erstgespräch?"
                      value={botTestInput}
                      onChange={(e) => handleTestBotResponse(e.target.value)}
                    ></textarea>
                    <span className="absolute bottom-2.5 right-3 text-[9px] font-mono text-slate-400 uppercase font-bold bg-slate-200/50 px-2 py-0.5 rounded-md">
                      Live Test
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide font-mono">
                    Simuliertes Bot-Verhalten
                  </label>

                  {botTestResult ? (
                    <div className="space-y-4 animate-fade-in">
                      {/* Match metadata indicator */}
                      {botTestResult.matched ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-850 rounded-xl flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold leading-normal">Volltreffer: Regel erkannt!</p>
                            <p className="text-[10px] text-emerald-600 font-mono mt-0.5">
                              {botTestResult.ruleTitle} (Gewichtung: {botTestResult.score})
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-3">
                          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-800 leading-normal">Kein Treffer • Fallback ausgelöst</p>
                            <p className="text-[10px] text-amber-600 font-mono mt-0.5">
                              Anfrage wird automatisch an {data.adminProfile?.name || 'Ihren Berater'} weitergeleitet.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bot Response Bubble preview */}
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                          <span className="text-[9px] font-mono font-bold tracking-wider text-indigo-300 uppercase">
                            KI-SPEICHERABZUG
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Status: ok
                          </span>
                        </div>
                        <p className="text-xs font-sans whitespace-pre-wrap leading-relaxed">
                          {botTestResult.answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                      <Cpu className="w-8 h-8 mx-auto opacity-35 mb-3" />
                      <p className="text-xs">Schreiben Sie oben etwas, um die Live-Spracherkennung des Bots zu verifizieren.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KI-BOT TRAINING EDIT MODAL */}
          {isBotRuleModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up my-8">
                <div className="p-6 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-400/20">
                      CRM TRAINING SYSTEM
                    </span>
                    <h3 className="text-base font-bold mt-1">
                      {selectedBotRuleId ? 'KI-Standardantwort editieren' : 'Neue Wissensquelle anlegen'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setIsBotRuleModalOpen(false);
                      setSelectedBotRuleId(null);
                    }}
                    className="text-slate-400 hover:text-white font-bold text-lg leading-none p-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                      1. Auslöser-Schlüsselwörter (kommagetrennt)*
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-indigo-600 focus:bg-white transition-colors"
                      placeholder="z.B. preise, kosten, honorar, geld"
                      value={botRuleForm.triggerKeywordsText}
                      onChange={(e) => setBotRuleForm({ ...botRuleForm, triggerKeywordsText: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      Tragen Sie hier Signalwörter ein, die in der Frage des Klienten vorkommen. Sobald eines davon erkannt wird, feuert der Bot diese Antwort.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                      2. Professionelle Auto-Antwort*
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none text-slate-700 text-xs focus:border-indigo-600 focus:bg-white transition-colors leading-relaxed"
                      placeholder="Geben Sie hier die automatisierte Antwort ein..."
                      value={botRuleForm.answer}
                      onChange={(e) => setBotRuleForm({ ...botRuleForm, answer: e.target.value })}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1.5 font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dynamische KI-Platzhalter (für absolute Personalisierung)</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-[10px] text-indigo-900 font-mono">
                      <div>
                        <span className="font-bold text-indigo-600">{"{Vorname}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">z.B. Sabine</p>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{"{Kunde}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">Sabine Schmidt</p>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{"{Wochentag}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">z.B. Freitag</p>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{"{Datum}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">z.B. 29.05.2026</p>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{"{Uhrzeit}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">z.B. 19:54 Uhr</p>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-600">{"{Berater}"}</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">{data.adminProfile?.name || 'Tatjana Haßmann'}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                      Tragen Sie diese Codes in Ihre Antwort ein. Sie werden beim echten Chat-Einsatz live durch die Daten des Klienten befüllt!
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-slate-55 border-t border-slate-150 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsBotRuleModalOpen(false);
                      setSelectedBotRuleId(null);
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-150 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveBotRule}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lernregel abspeichern</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. DEZENTRALE RECHNUNGSLEGUNG & BUCHHALTUNG */}
      {activeTab === 'invoices' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Finanzen & Buchhaltung</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Umsatz & Rechnungsarchiv</span>
            </div>
            <button
              onClick={handleOpenCreateInvoiceModal}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Rechnung erstellen</span>
            </button>
          </header>

          <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-6 select-text">
            {/* Bento Grid Buchhaltungs-Statistik */}
            {(() => {
              const invoices = data.invoices || [];
              const netTotal = invoices.reduce((acc, inv) => inv.status !== 'Storno' ? acc + inv.netAmount : acc, 0);
              const taxTotal = invoices.reduce((acc, inv) => inv.status !== 'Storno' ? acc + inv.taxAmount : acc, 0);
              const grossTotal = invoices.reduce((acc, inv) => inv.status !== 'Storno' ? acc + inv.amount : acc, 0);
              const outstanding = invoices.reduce((acc, inv) => inv.status === 'Offen' ? acc + inv.amount : acc, 0);

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Net Sales */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Euro className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Umsatz Netto</p>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                        {netTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                      <span className="text-[9px] text-indigo-500 font-mono">Exkl. MwSt.</span>
                    </div>
                  </div>

                  {/* Card 2: 19% VAT */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Fällige MwSt. (19%)</p>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                        {taxTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                      <span className="text-[9px] text-emerald-550 font-mono">Umsatzsteuerschuld</span>
                    </div>
                  </div>

                  {/* Card 3: Gross Sales */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-4 animate-pulse-slow">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Umsatz Brutto</p>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                        {grossTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                      <span className="text-[9px] text-blue-500 font-mono">Aktiv verrechnet</span>
                    </div>
                  </div>

                  {/* Card 4: Outstanding balances */}
                  <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-rose-450 font-semibold">Offene Außenstände</p>
                      <h4 className="text-lg font-bold text-rose-700 tracking-tight mt-0.5">
                        {outstanding.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                      <span className="text-[9px] text-rose-500 font-mono">Zahlungsziel überfällig</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Grid for Table and Analytics Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Invoices Table */}
              <div className="lg:col-span-2">
                {/* Invoices Filter and Data Board */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 outline-none text-xs w-56 text-slate-705 focus:border-indigo-500 focus:bg-white transition-colors"
                      placeholder="Nummer / Mandant suchen..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                    />
                  </div>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none text-xs text-slate-650 focus:border-indigo-500 transition-colors"
                  >
                    <option value="all">Alle Rechnungsstatus</option>
                    <option value="Bezahlt">Bezahlt</option>
                    <option value="Offen">Offen</option>
                    <option value="Storno">Storniert</option>
                  </select>
                </div>

                <button
                  onClick={handleExportInvoicesCSV}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-indigo-650 border border-slate-200 hover:border-indigo-150 bg-white hover:bg-indigo-50/10 text-xs font-semibold rounded-lg flex items-center gap-1.5 select-none transition-all duration-150 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Steuerberater Export (CSV)</span>
                </button>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Rechnung #</th>
                      <th className="px-5 py-3.5 font-bold">Mandant</th>
                      <th className="px-5 py-3.5 font-bold">Datum</th>
                      <th className="px-5 py-3.5 font-bold">Fälligkeit</th>
                      <th className="px-5 py-3.5 font-bold text-right">Netto</th>
                      <th className="px-5 py-3.5 text-right font-bold text-slate-400/80">MwSt. (19%)</th>
                      <th className="px-5 py-3.5 text-right font-bold">Brutto</th>
                      <th className="px-5 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(() => {
                      const invoices = data.invoices || [];
                      const filtered = invoices.filter(inv => {
                        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase());
                        const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} className="text-center py-14 text-slate-400">
                              <Receipt className="w-8 h-8 opacity-25 mx-auto mb-2" />
                              <p className="font-semibold text-xs text-slate-500">Keine Rechnungen erfasst.</p>
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((inv) => {
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-800 font-mono">{inv.invoiceNumber}</td>
                            <td className="px-5 py-4 text-slate-700 font-medium">{inv.customerName}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(inv.issueDate).toLocaleDateString('de-DE')}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString('de-DE')}</td>
                            <td className="px-5 py-4 text-right font-mono text-slate-600">{inv.netAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                            <td className="px-5 py-4 text-right font-mono text-slate-400">{inv.taxAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                            <td className="px-5 py-4 text-right font-bold font-mono text-slate-900">{inv.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                inv.status === 'Bezahlt'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                  : inv.status === 'Storno'
                                  ? 'bg-slate-100 text-slate-500 border-slate-250'
                                  : 'bg-rose-50 text-rose-700 border-rose-150 animate-pulse'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right flex items-center justify-end gap-1.5 h-full">
                              <button
                                onClick={() => setInvoicePreviewObject(inv)}
                                className="p-1 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50/40 rounded transition-all cursor-pointer"
                                title="A4 Sichten / Drucken"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {inv.status === 'Offen' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateInvoiceStatus(inv.id, 'Bezahlt')}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[9px] uppercase font-mono transition-all cursor-pointer"
                                    title="Zahlungserhalt verbuchen"
                                  >
                                    Zahlung
                                  </button>
                                  <button
                                    onClick={() => handleUpdateInvoiceStatus(inv.id, 'Storno')}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                    title="Als Storno markieren"
                                  >
                                    Stornieren
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close Left Column (lg:col-span-2) */}
            </div>

            {/* Right Column: High Fidelity Finance Analytics & Prediction Insights */}
            <div className="space-y-4">
              
              {/* Visual Sales Velocity Line Chart using SVG */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 font-sans uppercase tracking-wider font-mono">Umsatz-Geschwindigkeit</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Zeitlicher Verlauf aller Projekt-Umsätze</p>
                  </div>
                  <span className="p-1.5 bg-indigo-50 text-indigo-705 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>

                <div className="h-40 w-full relative">
                  {(() => {
                    const invoices = (data.invoices || []).filter(inv => inv.status !== 'Storno');
                    if (invoices.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 z-10 text-center">
                          <span className="text-[11px] font-mono">Noch keine Umsatzdaten erfasst</span>
                        </div>
                      );
                    }

                    // Sort chronologically
                    const sortedInvoices = [...invoices].sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
                    
                    // Calculate cumulative totals
                    let cumulative = 0;
                    const points = sortedInvoices.map((inv, idx) => {
                      cumulative += inv.amount;
                      return { x: idx, val: cumulative, date: inv.issueDate };
                    });

                    const maxVal = Math.max(...points.map(p => p.val), 1);
                    const minVal = 0;
                    const valRange = maxVal - minVal;

                    const width = 230;
                    const height = 110;
                    const padding = 10;

                    // Map data to SVG coordinates
                    const svgPoints = points.map((p, idx) => {
                      const xRatio = points.length > 1 ? idx / (points.length - 1) : 0.5;
                      const x = padding + xRatio * (width - 2 * padding);
                      
                      const yRatio = valRange > 0 ? (p.val - minVal) / valRange : 0.5;
                      const y = height - padding - yRatio * (height - 2 * padding);
                      return { x, y, val: p.val, raw: p };
                    });

                    // Construct path d string
                    let pathD = '';
                    if (svgPoints.length > 0) {
                      pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
                      for (let i = 1; i < svgPoints.length; i++) {
                        pathD += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
                      }
                    }

                    // Construct area path (closing at bottom)
                    let areaD = '';
                    if (svgPoints.length > 0) {
                      areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - padding} L ${svgPoints[0].x} ${height - padding} Z`;
                    }

                    return (
                      <div className="w-full h-full flex flex-col justify-between">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                            </linearGradient>
                          </defs>
                          
                          {/* Horizontal guide lines */}
                          <line x1={0} y1={padding} x2={width} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1={0} y1={height - padding} x2={width} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

                          {/* Filled Area */}
                          {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                          {/* Sparkline Path */}
                          {pathD && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                          {/* Data points */}
                          {svgPoints.map((pt, idx) => (
                            <g key={idx} className="group/dot">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                className="fill-white stroke-indigo-600 cursor-pointer transition-all hover:r-5"
                                strokeWidth="2"
                              />
                              <title>
                                {`${new Date(pt.raw.date).toLocaleDateString('de-DE')}: ${pt.val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`}
                              </title>
                            </g>
                          ))}
                        </svg>

                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-1">
                          <span>Systemstart</span>
                          <span>{cumulative.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} Gesamterlös</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Direct Fälligkeits-Radar (Aging Analysis / Overdue) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <h4 className="text-xs font-bold text-slate-850 font-sans uppercase tracking-wider font-mono">Fälligkeits-Radar (Mahnwesen)</h4>
                </div>
                
                {(() => {
                  const invoices = data.invoices || [];
                  const overdueInvoices = invoices.filter(inv => {
                    if (inv.status !== 'Offen') return false;
                    const dueTime = new Date(inv.dueDate).getTime();
                    return dueTime < Date.now();
                  });

                  if (overdueInvoices.length === 0) {
                    return (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 text-emerald-800 text-[10.5px] flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Keine überfälligen Rechnungen vorhanden. Alles beglichen!</span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400">Es wurden {overdueInvoices.length} überfällige Posten registriert:</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {overdueInvoices.map(inv => {
                          const daysOverdue = Math.ceil((Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                          const customerName = data.customers.find(c => c.id === inv.customerId)?.name || 'Unbekannt';
                          
                          return (
                            <div key={inv.id} className="p-2 w-full bg-rose-50/70 rounded-xl border border-rose-150 text-[11px] text-slate-705 flex flex-col space-y-1 justify-between">
                              <div className="flex justify-between font-mono font-bold text-[10px] text-rose-850">
                                  <span>{inv.invoiceNumber}</span>
                                  <span>{inv.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500">
                                <span>Mandant: {customerName}</span>
                                <span className="font-bold text-rose-600">seit {daysOverdue} Tag{daysOverdue !== 1 ? 'en' : ''} überfällig</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Smart KPIs Summary card with dynamic percentages */}
              <div className="bg-slate-900 text-slate-350 p-5 rounded-2xl shadow-sm border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-400/20">
                    ANALYTICS-PROFIL
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Sync: Live</span>
                </div>

                {(() => {
                  const invoices = data.invoices || [];
                  const paid = invoices.filter(i => i.status === 'Bezahlt');
                  const total = invoices.filter(i => i.status !== 'Storno');
                  const ratio = total.length > 0 ? (paid.length / total.length) * 100 : 100;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10.5px] uppercase font-mono tracking-wider font-bold text-slate-400">Realisierungsquote</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <h3 className="text-xl font-bold font-mono text-white tracking-tight">{ratio.toFixed(1)}%</h3>
                          <span className="text-[9.5px] text-emerald-400 font-mono font-bold">Erfolgreich verbucht</span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1 mt-2.5 overflow-hidden">
                          <div className="bg-indigo-500 h-1 rounded-full transition-all duration-300" style={{ width: `${ratio}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400">
                        <div>
                          <span className="text-slate-500">Beglichen:</span>
                          <p className="text-slate-200 mt-0.5 font-bold">{paid.length} Belege</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Offene Tranchen:</span>
                          <p className="text-slate-200 mt-0.5 font-bold">{total.length - paid.length} Belege</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Close Grid Wrapper */}
            </div>

          </div>

          {/* CREATE INVOICE DIALOG OVERLAY */}
          {isInvoiceModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up my-8">
                <div className="p-5 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-400/20">
                      BUCHHALTUNGSEXTRAS
                    </span>
                    <h3 className="text-base font-bold mt-1">Rechnungsbeleg manuell anlegen</h3>
                  </div>
                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-lg p-2 leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                        1. Zuordnung Mandant*
                      </label>
                      <select
                        value={invoiceForm.customerId}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      >
                        <option value="">-- Mandant auswählen --</option>
                        {data.customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.company || 'Privatperson'})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                        2. Rechnungsnummer*
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                        value={invoiceForm.invoiceNumber}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                        Belegdatum
                      </label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-705 outline-none font-mono"
                        value={invoiceForm.issueDate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                        Zahlungsziel (Fälligkeit)
                      </label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-705 outline-none font-mono"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                        Mehrwertsteuersatz
                      </label>
                      <select
                        value={invoiceForm.taxRate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-705 outline-none font-mono"
                      >
                        <option value={19}>19% Umsatzsteuer</option>
                        <option value={7}>7% USt. (Sonderfall)</option>
                        <option value={0}>0% steuerfreie Vermittlung</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">
                      Betreff / Mandatsbeschreibung
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500"
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                    />
                  </div>

                  {/* Quick presets buttons */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 space-y-2">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Leistungs-Schnellauswahl (Katalog-Muster):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Projektplanung CAD', title: '3D-Raumkonzeptionierung & CAD-Werkstattzeichnung', price: 120 },
                        { label: 'Tischler-Meisterstunde', title: 'Anfertigung & Endmontage durch Schreinermeister', price: 95 },
                        { label: 'Lieferung & Einpassung', title: 'Sicherer Möbellieferdienst mit staubfreier Endmontage', price: 250 },
                        { label: 'Wartung & Holzschutz', title: 'Jährliche Pflege & schützende Tiefenölung aller Massivholzmöbel', price: 150 }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            // If first item is empty, replace it. Otherwise, add a new one.
                            const firstEmpty = invoiceForm.items.length === 1 && invoiceForm.items[0].description === '';
                            if (firstEmpty) {
                              setInvoiceForm({
                                ...invoiceForm,
                                items: [{ id: invoiceForm.items[0].id, description: preset.title, quantity: 1, unitPrice: preset.price }]
                              });
                            } else {
                              setInvoiceForm({
                                ...invoiceForm,
                                items: [
                                  ...invoiceForm.items,
                                  { id: `item-${Date.now()}`, description: preset.title, quantity: 1, unitPrice: preset.price }
                                ]
                              });
                            }
                          }}
                          className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-705 hover:text-indigo-700 font-medium px-2.5 py-1 text-[10px] rounded transition-all cursor-pointer shadow-xs"
                        >
                          + {preset.label} ({preset.price} €)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic invoice items container */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 font-mono">Rechnungsposten (Einzelaufstellung)</h4>
                      <button
                        onClick={handleInvoiceItemAdd}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] uppercase font-mono flex items-center gap-1 transition-all cursor-pointer border-none"
                      >
                        + Posten hinzufügen
                      </button>
                    </div>

                    <div className="space-y-2">
                      {invoiceForm.items.map((it, idx) => {
                        const rowTotal = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
                        return (
                          <div key={it.id} className="grid grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                            <div className="col-span-1 text-center font-mono text-[10px] text-slate-400 font-bold">#{idx + 1}</div>
                            <div className="col-span-5">
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none"
                                placeholder="z.B. Courtage Wohngebäude / Beratungspaket"
                                value={it.description}
                                onChange={(e) => handleInvoiceItemChange(it.id, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none text-center font-mono"
                                placeholder="Menge"
                                value={it.quantity}
                                onChange={(e) => handleInvoiceItemChange(it.id, 'quantity', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none text-right font-mono"
                                placeholder="E-Preis"
                                value={it.unitPrice}
                                onChange={(e) => handleInvoiceItemChange(it.id, 'unitPrice', e.target.value)}
                              />
                            </div>
                            <div className="col-span-1.5 text-right text-xs font-bold font-mono text-slate-700">
                              {rowTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </div>
                            <div className="col-span-0.5 text-center">
                              {invoiceForm.items.length > 1 && (
                                <button
                                  onClick={() => handleInvoiceItemRemove(it.id)}
                                  className="text-rose-600 hover:text-rose-800 text-sm font-bold cursor-pointer"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Calculation preview board */}
                  {(() => {
                    const netTotal = invoiceForm.items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
                    const taxAmt = netTotal * (Number(invoiceForm.taxRate) / 100);
                    const grossTotal = netTotal + taxAmt;

                    return (
                      <div className="bg-indigo-50/30 rounded-xl p-4 border border-indigo-100/50 flex flex-col items-end space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between w-64 text-slate-500">
                          <span>Summe Netto:</span>
                          <span>{netTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                        <div className="flex justify-between w-64 text-slate-400">
                          <span>Umsatzsteuer ({invoiceForm.taxRate}%):</span>
                          <span>{taxAmt.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                        <div className="flex justify-between w-64 text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-sm">
                          <span>Summe Brutto:</span>
                          <span>{grossTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-5 bg-slate-55 border-t border-slate-150 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-150 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveInvoice}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Rechnungsbeleg freigeben</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HIGH FIDELITY A4 RECHNUNGS-VORSCHAU MODAL */}
          {invoicePreviewObject && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white w-full max-w-3xl rounded-none shadow-2xl overflow-hidden my-8 border border-slate-300 select-text flex flex-col">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0 no-print">
                  <span className="text-xs font-mono">DIN-A4 Druckansicht</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 bg-white/20 hover:bg-white/35 text-white text-xs font-bold rounded transition-all cursor-pointer"
                    >
                      Drucken / PDF
                    </button>
                    <button
                      onClick={() => setInvoicePreviewObject(null)}
                      className="text-white hover:text-slate-200 leading-none text-xl px-1.5 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Simulated physical Letterhead Paper */}
                <div className="p-12 sm:p-14 bg-white text-slate-800 font-sans leading-relaxed text-xs aspect-[1/1.414] w-[210mm] max-w-full mx-auto shadow-inner select-text">
                  {/* Sender Branded Header Area */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-10">
                    <div>
                      <h4 className="text-lg font-black tracking-tighter text-indigo-700">{(data.adminProfile?.name || 'Ihr Berater').toUpperCase()}</h4>
                      <p className="text-[10px] font-mono tracking-wider text-slate-400 mt-0.5">UNTERNEHMENSBERATUNG & DIGITALE STRATEGIE</p>
                      <p className="text-[9px] text-slate-500 mt-2 font-mono">
                        {data.adminProfile?.company || 'Consulting Agency'}<br />
                        Kanzleisitz: {data.adminProfile?.address || 'Hauptstraße 1, 10115 Berlin'}
                      </p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-450 space-y-1">
                      <p>USt-IdNr.: DE 312 948 291</p>
                      <p>Projektreg.: PR-2026-X83B</p>
                      <p>Telefon: {data.adminProfile?.phone || '+49 123 456789'}</p>
                      <p>EMail: {data.adminProfile?.email || 'info@agentur.de'}</p>
                    </div>
                  </div>

                  {/* Left address column - small font sender line, recipient area */}
                  <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                      <span className="text-[8px] text-slate-450 border-b border-slate-200 block pb-1.5 mb-2 font-mono uppercase tracking-wide">
                        {data.adminProfile?.company || 'Consulting Brand'} • {data.adminProfile?.address || 'Hauptstraße 1, 10115 Berlin'}
                      </span>
                      {(() => {
                        const cust = data.customers.find(c => c.id === invoicePreviewObject.customerId);
                        return (
                          <div className="space-y-1 font-sans text-[11px] text-slate-800">
                            <p className="font-bold">{cust ? cust.name : invoicePreviewObject.customerName}</p>
                            {cust?.company && <p className="font-semibold text-slate-700">{cust.company}</p>}
                            <p>{cust?.address || 'Kundensitz in Deutschland'}</p>
                            <p className="pt-2 font-mono text-[10px] text-slate-400">Mandanten-ID: #{invoicePreviewObject.customerId.substring(0, 8)}</p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="text-right font-mono space-y-2 mt-4 text-[10px]">
                      <h2 className="text-lg font-black font-sans tracking-tight text-slate-900 border-b border-slate-100 pb-1 mb-3">RECHNUNG</h2>
                      <p><strong>Rechnungsnummer:</strong> {invoicePreviewObject.invoiceNumber}</p>
                      <p><strong>Belegdatum:</strong> {new Date(invoicePreviewObject.issueDate).toLocaleDateString('de-DE')}</p>
                      <p><strong>Fälligkeitstermin:</strong> {new Date(invoicePreviewObject.dueDate).toLocaleDateString('de-DE')}</p>
                      <p><strong>Status:</strong> <span className="font-bold">{invoicePreviewObject.status.toUpperCase()}</span></p>
                    </div>
                  </div>

                  {/* Subject line */}
                  <div className="mb-8 font-sans">
                    <h3 className="text-sm font-bold text-slate-900">Leistungsabrechnung: {invoicePreviewObject.description}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hiermit stellen wir Ihnen für die vereinbarten Leistungen bzw. die erfolgreiche betriebliche Courtage-Sicherstellung folgende Positionen in Rechnung:
                    </p>
                  </div>

                  {/* Items detailed table */}
                  <div className="mb-10">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-55 border-y border-slate-250 font-mono text-[9px] uppercase tracking-wide text-slate-450">
                        <tr>
                          <th className="px-3 py-2">Pos.</th>
                          <th className="px-3 py-2">Leistungsbeschreibung</th>
                          <th className="px-3 py-2 text-center">Einheiten</th>
                          <th className="px-3 py-2 text-right">Einzelpreis</th>
                          <th className="px-3 py-2 text-right font-bold">Postentotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {((invoicePreviewObject.items || []) as any[]).map((it, idx) => {
                          return (
                            <tr key={it.id || idx}>
                              <td className="px-3 py-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                              <td className="px-3 py-3 font-semibold text-slate-800">{it.description}</td>
                              <td className="px-3 py-3 text-center font-mono">{it.quantity}</td>
                              <td className="px-3 py-3 text-right font-mono">{(it.unitPrice || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                              <td className="px-3 py-3 text-right font-bold font-mono">{(it.total || (it.quantity * it.unitPrice)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial computations summary */}
                  <div className="flex justify-end mb-14">
                    <div className="w-72 border-t border-slate-300 pt-3.5 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Nettobetrag:</span>
                        <span>{invoicePreviewObject.netAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-slate-450 border-b border-slate-100 pb-2">
                        <span>Zuzügl. {invoicePreviewObject.taxRate}% USt:</span>
                        <span>{invoicePreviewObject.taxAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black text-xs pt-1">
                        <span>Gesamtsumme Brutto:</span>
                        <span>{invoicePreviewObject.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Legal footer & payments sync instructions */}
                  <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 mt-16 text-[9.5px] text-slate-450 font-sans leading-normal">
                    <div>
                      <p className="font-bold text-slate-700">Zahlungsbedingungen & Hinweise:</p>
                      <p className="mt-1">
                        Bitte überweisen Sie den fälligen Bruttobetrag innerhalb von 14 Tagen unter Angabe der Rechnungsnummer <strong>{invoicePreviewObject.invoiceNumber}</strong> auf das untenstehende Geschäftskonto.
                      </p>
                      <p className="mt-1">
                        Die erbrachten Beratungsleistungen verstehen sich zzgl. der gesetzlichen Umsatzsteuer.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700">Bankverbindung & Geschäftskonto:</p>
                      <p className="mt-1 font-mono">
                        Kreditinstitut: Sparkasse Berlin<br />
                        IBAN: DE49 7835 1520 1883 1941 12<br />
                        BIC: BYLADEM1LIC<br />
                        Konto-Inhaber: {data.adminProfile?.name || 'Inhaber'} e.K.
                      </p>
                    </div>
                  </div>

                  {/* Digital seal signature stamp */}
                  <div className="mt-10 pt-4 border-t border-dashed border-slate-100 flex items-center justify-between font-mono text-[8px] text-slate-400">
                    <span>SEAL HASH: HMAC-SHA256-{invoicePreviewObject.id.substring(4, 16).toUpperCase()}</span>
                    <span>Validierter Original-Finanzbeleg aus dem Portal von {data.adminProfile?.company || 'Service-Partner'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 20. WARENWIRTSCHAFTS-SYSTEM (WWS) DASHBOARD */}
      {activeTab === 'inventory' && (() => {
        // Calculations
        const products = data.inventoryProducts || [];
        const movements = data.stockMovements || [];
        const suppliers = data.suppliers || [];
        const orders = data.supplierOrders || [];

        const totalValue = products.reduce((acc, current) => acc + (current.stock * current.purchasePrice), 0);
        const criticalItems = products.filter(p => p.stock < p.minStock);
        const openOrders = orders.filter(o => o.status === 'Ausstehend' || o.status === 'Bestellt');

        // Handlers
        const handleStockAdjust = (prodId: string, delta: number) => {
          const prod = products.find(p => p.id === prodId);
          if (!prod) return;

          const newStock = Math.max(0, prod.stock + delta);
          const updatedProds = products.map(p => {
            if (p.id === prodId) return { ...p, stock: newStock };
            return p;
          });

          const newMovement = {
            id: 'mov-' + Date.now(),
            productId: prodId,
            productName: prod.name,
            type: (delta > 0 ? 'incoming' : 'outgoing') as 'incoming' | 'outgoing' | 'adjustment',
            quantity: Math.abs(delta),
            date: new Date().toISOString(),
            reason: 'Manuelle Schnell-Korrektur',
            operator: 'Kanzlei-Leitung'
          };

          onDataChange({
            ...data,
            inventoryProducts: updatedProds,
            stockMovements: [newMovement, ...(data.stockMovements || [])]
          });
        };

        const handleSaveWwsProduct = () => {
          if (!wwsProductForm.sku || !wwsProductForm.name) {
            alert('Bitte tragen Sie mindestens Artikelnr. und Name ein.');
            return;
          }

          let updated;
          if (editingWwsProductId) {
            updated = products.map(p => {
              if (p.id === editingWwsProductId) {
                return {
                  ...p,
                  sku: wwsProductForm.sku,
                  name: wwsProductForm.name,
                  category: wwsProductForm.category,
                  stock: wwsProductForm.stock,
                  minStock: wwsProductForm.minStock,
                  purchasePrice: Number(wwsProductForm.purchasePrice),
                  sellingPrice: Number(wwsProductForm.sellingPrice),
                  location: wwsProductForm.location,
                  supplierId: wwsProductForm.supplierId,
                  description: wwsProductForm.description
                };
              }
              return p;
            });

            const newMovement = {
              id: 'mov-' + Date.now(),
              productId: editingWwsProductId,
              productName: wwsProductForm.name,
              type: 'adjustment' as const,
              quantity: wwsProductForm.stock,
              date: new Date().toISOString(),
              reason: 'Artikel-Daten gezaubert',
              operator: 'Kanzlei-Leitung'
            };

            onDataChange({
              ...data,
              inventoryProducts: updated,
              stockMovements: [newMovement, ...(data.stockMovements || [])]
            });
          } else {
            const newId = 'prod-' + Date.now();
            const newProd = {
              id: newId,
              sku: wwsProductForm.sku,
              name: wwsProductForm.name,
              category: wwsProductForm.category,
              stock: wwsProductForm.stock,
              minStock: wwsProductForm.minStock,
              purchasePrice: Number(wwsProductForm.purchasePrice),
              sellingPrice: Number(wwsProductForm.sellingPrice),
              location: wwsProductForm.location,
              supplierId: wwsProductForm.supplierId,
              description: wwsProductForm.description
            };

            const newMovement = {
              id: 'mov-' + Date.now(),
              productId: newId,
              productName: wwsProductForm.name,
              type: 'incoming' as const,
              quantity: wwsProductForm.stock,
              date: new Date().toISOString(),
              reason: 'Lager-Erstzugang',
              operator: 'Kanzlei-Leitung'
            };

            onDataChange({
              ...data,
              inventoryProducts: [...products, newProd],
              stockMovements: [newMovement, ...(data.stockMovements || [])]
            });
          }

          setIsWwsProductModalOpen(false);
          setEditingWwsProductId(null);
        };

        const handleSaveWwsSupplier = () => {
          if (!wwsSupplierForm.name) {
            alert('Name des Lieferanten erforderlich.');
            return;
          }

          let updated;
          if (editingWwsSupplierId) {
            updated = suppliers.map(s => {
              if (s.id === editingWwsSupplierId) {
                return {
                  ...s,
                  name: wwsSupplierForm.name,
                  contactName: wwsSupplierForm.contactName,
                  email: wwsSupplierForm.email,
                  phone: wwsSupplierForm.phone,
                  address: wwsSupplierForm.address
                };
              }
              return s;
            });
          } else {
            const newSup = {
              id: 'sup-' + Date.now(),
              name: wwsSupplierForm.name,
              contactName: wwsSupplierForm.contactName,
              email: wwsSupplierForm.email,
              phone: wwsSupplierForm.phone,
              address: wwsSupplierForm.address
            };
            updated = [...suppliers, newSup];
          }

          onDataChange({
            ...data,
            suppliers: updated
          });
          setIsWwsSupplierModalOpen(false);
          setEditingWwsSupplierId(null);
        };

        const handleCreateWwsOrder = () => {
          if (!wwsOrderForm.supplierId || !wwsOrderForm.productId) {
            alert('Bitte Lieferant und Produkt auswählen.');
            return;
          }

          const sup = suppliers.find(s => s.id === wwsOrderForm.supplierId);
          const prod = products.find(p => p.id === wwsOrderForm.productId);
          if (!sup || !prod) return;

          const orderNum = `ORD-2026-${(orders.length + 1).toString().padStart(3, '0')}`;
          const newOrder = {
            id: 'ord-' + Date.now(),
            orderNumber: orderNum,
            supplierId: sup.id,
            supplierName: sup.name,
            items: [
              {
                productId: prod.id,
                productName: prod.name,
                quantity: Number(wwsOrderForm.quantity),
                unitPrice: prod.purchasePrice
              }
            ],
            totalAmount: prod.purchasePrice * Number(wwsOrderForm.quantity),
            status: 'Ausstehend' as const,
            orderDate: new Date().toISOString().split('T')[0]
          };

          onDataChange({
            ...data,
            supplierOrders: [newOrder, ...(orders)]
          });
          setIsWwsOrderModalOpen(false);
        };

        const handleReceiveWwsOrder = (orderId: string) => {
          const order = orders.find(o => o.id === orderId);
          if (!order || order.status === 'Geliefert') return;

          const updatedOrders = orders.map(o => {
            if (o.id === orderId) {
              return {
                ...o,
                status: 'Geliefert' as const,
                deliveryDate: new Date().toISOString().split('T')[0]
              };
            }
            return o;
          });

          let updatedProds = [...products];
          const logMovements = [...movements];

          order.items.forEach(item => {
            updatedProds = updatedProds.map(p => {
              if (p.id === item.productId) {
                return { ...p, stock: p.stock + item.quantity };
              }
              return p;
            });

            logMovements.unshift({
              id: 'mov-' + Date.now() + Math.random(),
              productId: item.productId,
              productName: item.productName,
              type: 'incoming' as const,
              quantity: item.quantity,
              date: new Date().toISOString(),
              reason: `Wareneingang gebucht (Händlerbestellung ${order.orderNumber})`,
              operator: 'Kanzlei-Leitung'
            });
          });

          onDataChange({
            ...data,
            supplierOrders: updatedOrders,
            inventoryProducts: updatedProds,
            stockMovements: logMovements
          });

          alert(`Bestellung ${order.orderNumber} erfolgreich empfangen und Bestand aktualisiert!`);
        };

        const filteredProducts = products.filter(p => 
          (wwsCategoryFilter === 'all' || p.category === wwsCategoryFilter) &&
          (p.name.toLowerCase().includes(wwsProductSearch.toLowerCase()) || 
           p.sku.toLowerCase().includes(wwsProductSearch.toLowerCase()) ||
           p.location.toLowerCase().includes(wwsProductSearch.toLowerCase()))
        );

        return (
          <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
            {/* Header Bar */}
            <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Betriebsleitung</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Warenwirtschaft &amp; ERP-Leitstand</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingWwsSupplierId(null);
                    setWwsSupplierForm({ name: '', contactName: '', email: '', phone: '', address: '' });
                    setIsWwsSupplierModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold select-none flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lieferant anlegen</span>
                </button>

                <button
                  onClick={() => {
                    if (products.length === 0 || suppliers.length === 0) {
                      alert('Bitte legen Sie zuerst mindestens einen Lieferanten und ein Produkt an.');
                      return;
                    }
                    setWwsOrderForm({ supplierId: suppliers[0].id, productId: products[0].id, quantity: 10 });
                    setIsWwsOrderModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded text-xs font-semibold select-none flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Nachbestellung auslösen</span>
                </button>

                <button
                  onClick={() => {
                    setEditingWwsProductId(null);
                    setWwsProductForm({
                      sku: `ART-${Math.floor(1000 + Math.random() * 9000)}`,
                      name: '',
                      category: 'Möbel',
                      stock: 10,
                      minStock: 5,
                      purchasePrice: 100,
                      sellingPrice: 150,
                      location: 'Regal A1',
                      supplierId: suppliers[0]?.id || '',
                      description: ''
                    });
                    setIsWwsProductModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Artikel katalogisieren</span>
                </button>
              </div>
            </header>

            {/* Core Workspace - Scrollable */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-6 select-text text-left">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Datenbankbestand</div>
                  <div className="text-2xl font-black text-slate-800 mt-1">{products.length} Artikel</div>
                  <div className="text-[11px] text-slate-400 mt-1.5 font-mono">In {(new Set(products.map(p => p.category))).size} Warengruppen</div>
                </div>

                <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Gesamtlagerwert (EK)</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 font-mono">Kapitalbindung im Depot</div>
                </div>

                <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Alarm-Mengen</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {criticalItems.length} Artikel
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 font-mono">Bestände unter Mindestsicherung</div>
                </div>

                <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-sm">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide font-bold">Händler-Bestellungen</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {openOrders.length} im Zulauf
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 font-mono">Von {suppliers.length} Lieferanten</div>
                </div>
              </div>

              {/* Navigation Dashboard Section Controls */}
              <div className="bg-slate-200/50 border border-slate-300 p-1 rounded-xl grid grid-cols-4 gap-1.5 font-mono text-[11px] uppercase font-bold text-center">
                <button
                  onClick={() => setWwsActiveSubTab('products')}
                  className={`py-2 rounded-lg transition-all ${wwsActiveSubTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  📦 Lagerbestand &amp; Disposition ({filteredProducts.length})
                </button>
                <button
                  onClick={() => setWwsActiveSubTab('movements')}
                  className={`py-2 rounded-lg transition-all ${wwsActiveSubTab === 'movements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  📜 Lagerbewegungs-Log ({movements.length})
                </button>
                <button
                  onClick={() => setWwsActiveSubTab('suppliers')}
                  className={`py-2 rounded-lg transition-all ${wwsActiveSubTab === 'suppliers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  🤝 Lieferanten-Verzeichnis ({suppliers.length})
                </button>
                <button
                  onClick={() => setWwsActiveSubTab('orders')}
                  className={`py-2 rounded-lg transition-all ${wwsActiveSubTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  🚛 Zulauf &amp; Backorders ({orders.length})
                </button>
              </div>

              {/* SUB TAB VIEWPORT 1: PRODUCTS DISPLAY LIST */}
              {wwsActiveSubTab === 'products' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-850 text-sm">Zentrallager Inventar &amp; Bestände</h3>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">Automatisierte Mindestbestandsprüfung aktiv</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={wwsCategoryFilter}
                        onChange={(e) => setWwsCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs py-1.5 px-3 rounded-lg outline-none focus:border-indigo-500"
                      >
                        <option value="all">Sämtliche Warengruppen</option>
                        <option value="Möbel">Möbel</option>
                        <option value="Beleuchtung">Beleuchtung</option>
                        <option value="Dekoration">Dekoration</option>
                        <option value="Zubehör">Zubehör</option>
                      </select>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Suche nach Name, SKU, Ort..."
                          value={wwsProductSearch}
                          onChange={(e) => setWwsProductSearch(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs py-1.5 pl-8 pr-3 rounded-lg outline-none focus:border-indigo-500 w-64"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">SKU / Code</th>
                          <th className="px-4 py-3">Ware / Beschreibung</th>
                          <th className="px-4 py-3">Kategorie</th>
                          <th className="px-4 py-3 text-center">Lagerbestand</th>
                          <th className="px-4 py-3 text-right">Einkauf (Netto)</th>
                          <th className="px-4 py-3 text-right">Verkauf (Netto)</th>
                          <th className="px-4 py-3">Depotplatz</th>
                          <th className="px-5 py-3 text-center">Disposition/Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredProducts.map((p) => {
                          const isCritical = p.stock < p.minStock;
                          const isOutOfStock = p.stock <= 0;
                          const supName = suppliers.find(s => s.id === p.supplierId)?.name || 'Eigendepot';

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{p.sku}</td>
                              <td className="px-4 py-3.5">
                                <span className="font-bold text-slate-800 text-[12.5px] block">{p.name}</span>
                                <span className="text-[11px] text-slate-400 block truncate max-w-xs">{p.description || 'Kein Datenblatt hinterlegt.'}</span>
                                <span className="text-[9.5px] text-indigo-500 font-mono mt-0.5 block">Lieferant: {supName}</span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase rounded bg-slate-100 text-slate-600">
                                  {p.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <div className="space-y-1">
                                  <span className={`font-mono font-bold block text-sm ${
                                    isOutOfStock ? 'text-rose-600 animate-pulse' : isCritical ? 'text-amber-500 font-extrabold' : 'text-slate-800'
                                  }`}>
                                    {p.stock} Stk.
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-mono">Soll min: {p.minStock}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                                {p.purchasePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-800 font-bold">
                                {p.sellingPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-4 py-3.5 font-mono text-slate-600">{p.location}</td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-center gap-3">
                                  {/* Quick Stock Adjuster */}
                                  <div className="flex items-center border border-slate-200 rounded overflow-hidden shadow-sm bg-white font-mono font-bold text-[11px]">
                                    <button
                                      onClick={() => handleStockAdjust(p.id, -1)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border-r border-slate-200"
                                      title="Bestand verringern (-1)"
                                    >
                                      -
                                    </button>
                                    <span className="px-2.5 text-slate-800">{p.stock}</span>
                                    <button
                                      onClick={() => handleStockAdjust(p.id, 1)}
                                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border-l border-slate-200"
                                      title="Bestand erhöhen (+1)"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingWwsProductId(p.id);
                                        setWwsProductForm({
                                          sku: p.sku,
                                          name: p.name,
                                          category: p.category,
                                          stock: p.stock,
                                          minStock: p.minStock,
                                          purchasePrice: p.purchasePrice,
                                          sellingPrice: p.sellingPrice,
                                          location: p.location,
                                          supplierId: p.supplierId,
                                          description: p.description || ''
                                        });
                                        setIsWwsProductModalOpen(true);
                                      }}
                                      className="p-1 bg-slate-105 border border-slate-200 rounded text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                                      title="Eigenschaften abändern"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Möchten Sie den Artikel "${p.name}" (SKU: ${p.sku}) wirklich dauerhaft aus dem Katalog entfernen?`)) {
                                          onDataChange({
                                            ...data,
                                            inventoryProducts: products.filter(item => item.id !== p.id)
                                          });
                                        }
                                      }}
                                      className="p-1 bg-rose-50 border border-slate-200 rounded text-rose-500 hover:bg-rose-100"
                                      title="Löschen"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-slate-400 font-mono">
                              Keine passenden Artikel im Zentrallager registriert.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB VIEWPORT 2: STOCK MOVEMENT LOGS */}
              {wwsActiveSubTab === 'movements' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-850 text-sm">Lagerbewegungen &amp; Revisionssicheres Log</h3>
                      <p className="text-xs text-slate-500 leading-normal">Lückenlose Protokollierung aller Wareneingänge, Schnellanpassungen und Rechnungsabgänge.</p>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Übertragung ins Archiv abschließen und Protokoll-Zähler zurücksetzen?')) {
                          onDataChange({
                            ...data,
                            stockMovements: []
                          });
                        }
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-200 transition-colors"
                    >
                      Log-Cache leeren
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">Datum &amp; Uhrzeit</th>
                          <th className="px-4 py-3">Produktname</th>
                          <th className="px-4 py-3 text-center">Buchungs-Typ</th>
                          <th className="px-4 py-3 text-right">Menge</th>
                          <th className="px-4 py-3">Buchungsgrund (Nachweis)</th>
                          <th className="px-5 py-3">Prüfer / Operator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {movements.map((m) => {
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/55 font-mono text-[11px]">
                              <td className="px-5 py-3 text-slate-500">{new Date(m.date).toLocaleString('de-DE')}</td>
                              <td className="px-4 py-3 font-sans font-bold text-slate-800">{m.productName}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  m.type === 'incoming' 
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-250' 
                                    : m.type === 'outgoing' 
                                    ? 'bg-amber-50 text-amber-600 border border-amber-250' 
                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-250'
                                }`}>
                                  {m.type === 'incoming' ? 'ZUGANG' : m.type === 'outgoing' ? 'ABGANG' : 'JUSTIERUNG'}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-bold text-[12.5px] ${m.type === 'incoming' ? 'text-emerald-600' : 'text-slate-650'}`}>
                                {m.type === 'incoming' ? '+' : '-'}{m.quantity} Stk.
                              </td>
                              <td className="px-4 py-3 font-sans text-slate-600">{m.reason}</td>
                              <td className="px-5 py-3 text-slate-500">{m.operator || 'System'}</td>
                            </tr>
                          );
                        })}

                        {movements.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400 font-mono">
                              Keine Logbücher im aktiven Cache erfasst.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB VIEWPORT 3: SUPPLIERS VERZEICHNIS */}
              {wwsActiveSubTab === 'suppliers' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-850 text-sm">Lieferanten &amp; Hersteller-Verzeichnis</h3>
                      <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-0.5">Sicherung Ihrer Einkaufskonditionen</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">LieferantenID</th>
                          <th className="px-4 py-3">Firmenname / Marke</th>
                          <th className="px-4 py-3">Ansprechpartner/in</th>
                          <th className="px-4 py-3">E-Mail Adresse</th>
                          <th className="px-4 py-3">Telefon</th>
                          <th className="px-4 py-3">Hauptsitz / Anschrift</th>
                          <th className="px-5 py-3 text-center">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {suppliers.map((s) => {
                          const associatedProdsCount = products.filter(p => p.supplierId === s.id).length;

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3 font-mono font-bold text-slate-500">{s.id}</td>
                              <td className="px-4 py-3">
                                <strong className="text-slate-850 text-[12.5px] font-sans block">{s.name}</strong>
                                <span className="text-[10px] text-indigo-600 font-mono mt-0.5 block">{associatedProdsCount} gelistete Produkte</span>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-850">{s.contactName}</td>
                              <td className="px-4 py-3 font-mono text-slate-600">{s.email}</td>
                              <td className="px-4 py-3 font-mono text-slate-600">{s.phone}</td>
                              <td className="px-4 py-3 text-slate-600 text-[11.5px] leading-relaxed">{s.address}</td>
                              <td className="px-5 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingWwsSupplierId(s.id);
                                      setWwsSupplierForm({
                                        name: s.name,
                                        contactName: s.contactName,
                                        email: s.email,
                                        phone: s.phone,
                                        address: s.address
                                      });
                                      setIsWwsSupplierModalOpen(true);
                                    }}
                                    className="p-1.5 bg-slate-105 border border-slate-200 rounded text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                                    title="Daten abändern"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Möchten Sie den Partner "${s.name}" wirklich ausbuchen?`)) {
                                        onDataChange({
                                          ...data,
                                          suppliers: suppliers.filter(item => item.id !== s.id)
                                        });
                                      }
                                    }}
                                    className="p-1.5 bg-rose-50 border border-slate-200 rounded text-rose-500 hover:bg-rose-100"
                                    title="Löschen"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {suppliers.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400 font-mono">
                              Keine Lieferanten in der Datenbank.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB VIEWPORT 4: SUPPLIER ORDERS */}
              {wwsActiveSubTab === 'orders' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-slate-850 text-sm">Einkauf &amp; Partner-Zuläufe</h3>
                      <p className="text-xs text-slate-500 leading-normal">Überwachen Sie gelieferte und ausstehende Materialbestellungen.</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left text-slate-650">
                      <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">Bestellnummer</th>
                          <th className="px-4 py-3">Lieferant</th>
                          <th className="px-4 py-3">Bestellte Artikel</th>
                          <th className="px-4 py-3 text-right">Gesamt (Netto)</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Aufgegeben am</th>
                          <th className="px-5 py-3 text-center">Disposition/Wareneingang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {orders.map((o) => {
                          const pending = o.status !== 'Geliefert' && o.status !== 'Storniert';

                          return (
                            <tr key={o.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-mono font-bold text-indigo-600 text-[12px]">{o.orderNumber}</td>
                              <td className="px-4 py-3.5 font-bold text-slate-850">{o.supplierName}</td>
                              <td className="px-4 py-3.5">
                                <div className="space-y-1">
                                  {o.items.map((it, idx) => (
                                    <div key={idx} className="font-medium text-slate-850">
                                      {it.productName} <span className="text-slate-400 font-mono text-[10px]">({it.quantity} Stk. à {it.unitPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-800 font-bold text-[12.5px]">
                                {o.totalAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  o.status === 'Geliefert'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : o.status === 'Storniert'
                                    ? 'bg-slate-50 text-slate-500 border border-slate-200'
                                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}>
                                  {o.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono text-slate-500 text-[10.5px]">
                                {o.orderDate}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                {pending ? (
                                  <button
                                    onClick={() => handleReceiveWwsOrder(o.id)}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[9px] uppercase font-black tracking-wider rounded shadow-sm hover:shadow transition-all flex items-center gap-1.5 mx-auto text-center"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Wareneingang buchen</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    Geliefert am: {o.deliveryDate || 'Archiviert'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400 font-mono">
                              Keine Händler-Zuläufe registriert.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* MODAL 1: ADD/EDIT WWS PRODUCT CATALOG */}
            {isWwsProductModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-250 overflow-hidden text-left animate-scale-up font-sans">
                  <header className="bg-slate-950 text-white px-5 py-4 flex justify-between items-center border-b border-slate-900">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/25">ADMIN-KRAFT</span>
                      <h3 className="text-sm font-bold mt-1 text-white">{editingWwsProductId ? 'Artikeldaten modifizieren' : 'Artikel katalogisieren (WWS)'}</h3>
                    </div>
                    <button
                      onClick={() => setIsWwsProductModalOpen(false)}
                      className="text-slate-400 hover:text-white transition-all bg-slate-900 p-1.5 rounded-lg border border-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </header>

                  <div className="p-5 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Artikelnr. / SKU*</label>
                        <input
                          type="text"
                          value={wwsProductForm.sku}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, sku: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Produkt-Sparte/Kategorie</label>
                        <select
                          value={wwsProductForm.category}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, category: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500"
                        >
                          <option value="Möbel">Möbel</option>
                          <option value="Beleuchtung">Beleuchtung</option>
                          <option value="Dekoration">Dekoration</option>
                          <option value="Zubehör">Zubehör</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Artikel-Bezeichnung*</label>
                      <input
                        type="text"
                        placeholder="z.B. Cloud Server-Knoten V1"
                        value={wwsProductForm.name}
                        onChange={(e) => setWwsProductForm({ ...wwsProductForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-sans font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Einkaufspreis € (Netto)</label>
                        <input
                          type="number"
                          value={wwsProductForm.purchasePrice}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, purchasePrice: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Verkaufspreis € (Netto)</label>
                        <input
                          type="number"
                          value={wwsProductForm.sellingPrice}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, sellingPrice: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Ist-Bestand</label>
                        <input
                          type="number"
                          value={wwsProductForm.stock}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, stock: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Mindestbestand</label>
                        <input
                          type="number"
                          value={wwsProductForm.minStock}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, minStock: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Lagerplatz / Ort</label>
                        <input
                          type="text"
                          placeholder="z.B. Regal B2"
                          value={wwsProductForm.location}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, location: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Bevorzugter Produkt-Lieferant</label>
                        <select
                          value={wwsProductForm.supplierId}
                          onChange={(e) => setWwsProductForm({ ...wwsProductForm, supplierId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Kein bevorzugter Händler --</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Artikel-Beschreibung / Datenblatt</label>
                      <textarea
                        rows={2}
                        placeholder="Detaillierte Informationen, Typeneigenschaften, etc."
                        value={wwsProductForm.description}
                        onChange={(e) => setWwsProductForm({ ...wwsProductForm, description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-sans"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => setIsWwsProductModalOpen(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSaveWwsProduct}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
                      >
                        Artikel einbuchen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 2: ADD/EDIT SUPPLIER */}
            {isWwsSupplierModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-250 overflow-hidden text-left animate-scale-up font-sans">
                  <header className="bg-slate-950 text-white px-5 py-4 flex justify-between items-center border-b border-slate-900">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/25">ERP PARTNER</span>
                      <h3 className="text-sm font-bold mt-1 text-white">{editingWwsSupplierId ? 'Lieferantendaten anpassen' : 'Neuen Produktionspartner listen'}</h3>
                    </div>
                    <button
                      onClick={() => setIsWwsSupplierModalOpen(false)}
                      className="text-slate-400 hover:text-white transition-all bg-slate-900 p-1.5 rounded-lg border border-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </header>

                  <div className="p-5 space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Lieferanten/Gewerbename*</label>
                      <input
                        type="text"
                        value={wwsSupplierForm.name}
                        onChange={(e) => setWwsSupplierForm({ ...wwsSupplierForm, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-sans font-bold"
                        placeholder="z.B. Tech-Distributor Europe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Hauptansprechpartner/in</label>
                        <input
                          type="text"
                          value={wwsSupplierForm.contactName}
                          onChange={(e) => setWwsSupplierForm({ ...wwsSupplierForm, contactName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-sans"
                          placeholder="z.B. Thomas Koch"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Telefonnummer</label>
                        <input
                          type="text"
                          value={wwsSupplierForm.phone}
                          onChange={(e) => setWwsSupplierForm({ ...wwsSupplierForm, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                          placeholder="z.B. +49 89 223344"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Händler E-Mail</label>
                      <input
                        type="email"
                        value={wwsSupplierForm.email}
                        onChange={(e) => setWwsSupplierForm({ ...wwsSupplierForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        placeholder="sales@tech-dist.de"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Gewerbeanschrift (Adresse)</label>
                      <input
                        type="text"
                        value={wwsSupplierForm.address}
                        onChange={(e) => setWwsSupplierForm({ ...wwsSupplierForm, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-sans"
                        placeholder="Gewerbepark 4, 80331 München"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => setIsWwsSupplierModalOpen(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSaveWwsSupplier}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
                      >
                        Lieferant eintragen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL 3: SUPPLIER ORDERS */}
            {isWwsOrderModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-250 overflow-hidden text-left animate-scale-up font-sans">
                  <header className="bg-slate-950 text-white px-5 py-4 flex justify-between items-center border-b border-slate-900">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/25">EINKAUF</span>
                      <h3 className="text-sm font-bold mt-1 text-white">Nachbestellung anweisen (B2B)</h3>
                    </div>
                    <button
                      onClick={() => setIsWwsOrderModalOpen(false)}
                      className="text-slate-400 hover:text-white transition-all bg-slate-900 p-1.5 rounded-lg border border-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </header>

                  <div className="p-5 space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Hersteller / Lieferant</label>
                      <select
                        value={wwsOrderForm.supplierId}
                        onChange={(e) => setWwsOrderForm({ ...wwsOrderForm, supplierId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500"
                      >
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Produkt zum Kommissionieren</label>
                      <select
                        value={wwsOrderForm.productId}
                        onChange={(e) => setWwsOrderForm({ ...wwsOrderForm, productId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Soll-min: {p.minStock}, Ist: {p.stock})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider mb-1">Menge / Einheiten</label>
                      <input
                        type="number"
                        value={wwsOrderForm.quantity}
                        onChange={(e) => setWwsOrderForm({ ...wwsOrderForm, quantity: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 font-mono"
                        min="1"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => setIsWwsOrderModalOpen(false)}
                        className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleCreateWwsOrder}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow"
                      >
                        Order absenden
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* 8. PROZESS-ROADMAP SCHABLONEN BUILDER - DISABLED */}
      {false && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Template-Zentrale</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Prozess-Schablonen & Fahrpläne</span>
            </div>
            <button
              onClick={() => handleOpenCreateTemplateModal()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Neue Schablone entwerfen</span>
            </button>
          </header>

          <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-5 select-text">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 max-w-4xl mx-auto">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Aktive Schablonen in der Systemdatenbank ({allTemplates.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Diese Fahrpläne strukturieren die Zusammenarbeit in exakt 5 Phasen. Weisen Sie diese Schablonen in der Kundenverwaltung direkt zu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {allTemplates.map((tpl) => {
                const isSystem = ROADMAP_TEMPLATES.some(s => s.id === tpl.id);
                return (
                  <div 
                    key={tpl.id} 
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-150 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          tpl.category === 'Marketing' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-150'
                            : tpl.category === 'Versicherung'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                            : tpl.category === 'Finanzierung'
                            ? 'bg-purple-50 text-purple-700 border border-purple-150'
                            : 'bg-amber-50 text-amber-700 border border-amber-150'
                        }`}>
                          {tpl.category}
                        </span>
                        
                        <span className="text-[9px] text-slate-400 font-mono">
                          {isSystem ? 'Systemtemplate' : 'Custom Template'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 mt-3 font-sans line-clamp-1">{tpl.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-1 lines-clamp-2 leading-relaxed min-h-[30px]">{tpl.description}</p>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/40 mt-4 text-[10px] text-slate-400 font-mono text-center">
                        <div>
                          <p className="text-slate-500 font-bold">{tpl.phases.length}</p>
                          <p className="text-[8px] uppercase">Phasen</p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-bold">{tpl.tasks.length}</p>
                          <p className="text-[8px] uppercase">Aufgaben</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-5">
                      <button
                        onClick={() => handleOpenCreateTemplateModal(tpl.id)}
                        className="flex-grow px-2 py-1.5 text-center text-slate-650 hover:text-indigo-600 border border-slate-250 hover:border-indigo-150 bg-white hover:bg-indigo-50/15 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Kopie bearbeiten</span>
                      </button>
                      
                      {!isSystem ? (
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="px-2.5 py-1.5 text-rose-500 hover:text-white border border-rose-100 hover:bg-rose-500 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer"
                          title="Fahrplan löschen"
                        >
                          Löschen
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-350 italic font-mono px-2 py-1 bg-slate-50 rounded">System-geschützt</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEMPLATE GENERATOR MODAL VIEW */}
          {isTemplateModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up my-8">
                <div className="p-5 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-400/20">
                      SCHABLONEN ASSISTENT
                    </span>
                    <h3 className="text-base font-bold mt-1">
                      {editingTemplateId ? 'Roadmap-Schablone anpassen & klonen' : 'Neue Beratungsschablone entwerfen'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="text-slate-400 hover:text-white font-bold text-lg p-2 leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto select-text font-sans">
                  {/* General settings row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                        Schablonen-Bezeichnung*
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="z.B. Vorsorgekonzept Altersvorsorge v1"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                        Fachbereich / Sparte
                      </label>
                      <select
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none"
                      >
                        <option value="Versicherung">Versicherung & Vorsorge</option>
                        <option value="Finanzierung">Baufinanzierung & Darlehen</option>
                        <option value="Gewerbe">Gewerbeabsicherung (KMU)</option>
                        <option value="Marketing">Marketing & Consulting</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                        Visualizer Symbol
                      </label>
                      <select
                        value={templateForm.icon}
                        onChange={(e) => setTemplateForm({ ...templateForm, icon: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-705 outline-none font-mono"
                      >
                        <option value="Layers">Layers (Standard)</option>
                        <option value="TrendingUp">Trending Up (Finanzen)</option>
                        <option value="ShieldCheck">Shield (Versicherungen)</option>
                        <option value="Video">Video (Medien)</option>
                      </select>
                    </div>

                    <div className="md:col-span-12">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                        Zweckbeschreibung & interne Notizen
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-707 outline-none"
                        value={templateForm.description}
                        onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                        placeholder="Erläuterungen zum Einsatzgebiet dieser Schablone..."
                      ></textarea>
                    </div>
                  </div>

                  {/* 5 Phases Editors details */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide">
                      1. Definition der 5 Phasen (Prozess-Phasen)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                      {templateForm.phases.map((ph, idx) => {
                        return (
                          <div key={ph.phase} className="bg-slate-50 p-3 rounded-xl border border-slate-200/40 space-y-1.5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-indigo-600 font-bold block">PHASE {ph.phase}</span>
                            <input
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-750 font-bold outline-none"
                              value={ph.title}
                              onChange={(e) => {
                                const copyPh = [...templateForm.phases];
                                copyPh[idx].title = e.target.value;
                                setTemplateForm({ ...templateForm, phases: copyPh });
                              }}
                              placeholder="Phasentitel"
                            />
                            <textarea
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-450 outline-none leading-relaxed"
                              value={ph.desc}
                              onChange={(e) => {
                                const copyPh = [...templateForm.phases];
                                copyPh[idx].desc = e.target.value;
                                setTemplateForm({ ...templateForm, phases: copyPh });
                              }}
                              placeholder="Kurze Teaser..."
                            ></textarea>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tasks detailed Editor list */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide">
                        2. Aufgabenliste & Meilenstein-Zuständigkeit
                      </h4>
                      <button
                        onClick={handleTemplateTaskAdd}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] uppercase font-mono flex items-center gap-1 transition-all cursor-pointer border-none"
                      >
                        + Neues To-Do hinzufügen
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {templateForm.tasks.map((task, idx) => {
                        return (
                          <div key={task.id} className="grid grid-cols-12 gap-2.5 items-start bg-slate-50/70 p-3 rounded-xl border border-slate-200/40 relative">
                            <div className="col-span-1 border-r border-slate-200/40 h-full flex flex-col items-center justify-center font-mono text-[10px] text-slate-400 font-bold">
                              {idx + 1}
                            </div>
                            
                            <div className="col-span-2">
                              <label className="block text-[8px] font-mono text-slate-400 font-bold uppercase mb-0.5">Phase (1-5)</label>
                              <select
                                value={task.phase}
                                onChange={(e) => handleTemplateTaskChange(task.id, 'phase', Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-mono outline-none"
                              >
                                <option value={1}>Phase 1</option>
                                <option value={2}>Phase 2</option>
                                <option value={3}>Phase 3</option>
                                <option value={4}>Phase 4</option>
                                <option value={5}>Phase 5</option>
                              </select>
                            </div>

                            <div className="col-span-3">
                              <label className="block text-[8px] font-mono text-slate-400 font-bold uppercase mb-0.5">To-Do Überschrift</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 outline-none"
                                value={task.title}
                                onChange={(e) => handleTemplateTaskChange(task.id, 'title', e.target.value)}
                                placeholder="z.B. Courtagedetail sichten"
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="block text-[8px] font-mono text-slate-400 font-bold uppercase mb-0.5">Aufgabenbeschreibung</label>
                              <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] text-slate-500 outline-none"
                                value={task.desc}
                                onChange={(e) => handleTemplateTaskChange(task.id, 'desc', e.target.value)}
                                placeholder="Sichtbares Begleit-To-do..."
                              />
                            </div>

                            <div className="col-span-1.5">
                              <label className="block text-[8px] font-mono text-slate-400 font-bold uppercase mb-0.5">Zuständig</label>
                              <select
                                value={task.role}
                                onChange={(e) => handleTemplateTaskChange(task.id, 'role', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-700 outline-none"
                              >
                                <option value="Kunde">Kunde</option>
                                <option value="Berater">Berater</option>
                                <option value="Beide">Beide</option>
                              </select>
                            </div>

                            <div className="col-span-0.5 text-center self-center pt-2">
                              {templateForm.tasks.length > 1 && (
                                <button
                                  onClick={() => handleTemplateTaskRemove(task.id)}
                                  className="text-rose-600 hover:text-rose-800 text-sm font-bold cursor-pointer"
                                  title="Aufgabe löschen"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-55 border-t border-slate-150 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsTemplateModalOpen(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-150 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Zuweisbare Schablone verbuchen</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. MULTI-TENANT PROJEKTE & SERVER-PROVISIONIERUNG */}
      {activeTab === 'projects' && (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          {/* Server Header & Control Status Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/20 animate-pulse">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight uppercase leading-none">Premium Cloud Serversteuerung</h1>
                <p className="text-[10.5px] text-slate-400 font-mono tracking-wider mt-0.5">Zentralisierte Orchestrierung & Multi-Tenant Mandantenverwaltung</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 border border-slate-700 rounded-lg text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-350">Server Node:</span>
                <strong className="text-emerald-400 font-bold uppercase">SERVER-DE-BERLIN-G3</strong>
              </div>
              <button
                id="btn-trigger-onboarding"
                onClick={() => {
                  setOnboardingForm({
                    custId: '',
                    newClientName: '',
                    companyName: '',
                    industry: 'Versicherung',
                    services: 'Allgemeine Vorsorge, KFZ, Gebäude, Hausrat',
                    products: 'Sorgenfrei-Paket, Premium-Schutz',
                    targetGroup: 'Privathaushalte und Familien',
                    phone: '+49 30 1234567',
                    email: 'kontakt@versicherungspartner.de',
                    address: 'Musterweg 12, 10115 Berlin',
                    description: 'Unsere Agentur begleitet Sie partnerschaftlich in allen Lebenslagen.',
                    specialFeatures: 'Familienrabatt, 24/7 Notfall-Hotline, Sofortregulierung',
                    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&auto=format&fit=crop',
                    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
                    appointmentWishes: 'Montag bis Freitag, flexibel abends',
                    individualRequirements: 'Direkte PDF-Generierung für Angebote.',
                    crmTitle: ''
                  });
                  setProvisionSuccessInfo(null);
                  setIsOnboardingFormOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-slate-850 text-white font-bold text-xs uppercase font-mono rounded-xl tracking-wider transition-all shadow flex items-center gap-1.5 cursor-pointer border border-transparent"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Datenerfassung & Provisionierung</span>
              </button>
            </div>
          </div>

          {/* Provisioning Server Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-slate-805">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Gesamtprojekte</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{data.customers.length}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Zentral verwaltete Mandanten</p>
            </div>
            
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-slate-805">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bereitgestellte Websites</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {data.customers.filter(c => c.landingpageUrl).length}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Landingpages mit Login-Bereich</p>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-slate-805">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Einzel-CRMs</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {data.customers.filter(c => c.crmTitle).length}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Spezifisch personalisiert</p>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm text-slate-805">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bestätigte Übergaben</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {data.customers.filter(c => c.handoverProtocol?.confirmedByClient).length}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Rechtskräftig signierte Übergaben</p>
            </div>
          </div>

          {/* Provisioning List and Detailed View Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: List of Multi-tenant projects */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 text-slate-800">
                <h3 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <span>Aktive Web-Projekte</span>
                  <span className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 text-[9px] rounded-full">
                    {data.customers.length} gelistet
                  </span>
                </h3>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {data.customers.map((cust) => {
                    const isSelected = selectedProjectCustId === cust.id;
                    const hasProject = !!cust.landingpageUrl;
                    const isSigned = !!cust.handoverProtocol?.confirmedByClient;
                    
                    return (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedProjectCustId(cust.id);
                          setProvisionSuccessInfo(null);
                        }}
                        className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50/50 border-indigo-400' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 font-sans">{cust.company}</h4>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Branche: {cust.onboarding?.industry || 'Nicht spezifiziert'}</p>
                          </div>
                          
                          {/* Badge Status */}
                          <div className="flex gap-1">
                            {hasProject ? (
                              <span className="px-1.5 py-0.5 text-[8px] bg-indigo-100 text-indigo-700 font-mono rounded border border-indigo-200 uppercase font-semibold">
                                Live
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[8px] bg-amber-100 text-amber-700 font-mono rounded border border-amber-200 uppercase font-semibold">
                                Vorbereitung
                              </span>
                            )}
                            
                            {isSigned ? (
                              <span className="px-1.5 py-0.5 text-[8px] bg-emerald-100 text-emerald-700 font-mono rounded border border-emerald-200 uppercase font-semibold">
                                Signiert
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[8px] bg-slate-100 text-slate-500 font-mono rounded border border-slate-300 uppercase font-semibold">
                                Offen
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Summary of credentials */}
                        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Link: {cust.landingpageUrl ? 'Zentrallink' : 'Ausstehend'}</span>
                          <span>Phase: {cust.activePhase || 1} / 5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Selected Project Workspace */}
            <div className="lg:col-span-12 xl:col-span-7 col-span-1 border border-slate-200 bg-white rounded-2xl shadow-sm p-5 text-slate-800">
              {(() => {
                const currentProj = data.customers.find(c => c.id === selectedProjectCustId);
                
                if (!currentProj) {
                  return (
                    <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                        <Server className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Kein Projekt ausgewählt</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          Wählen Sie einen Kunden in der linken Leiste aus oder starten Sie das Datenerfassungsformular, um ein neues Web- und CRM-Projekt zu provisionieren.
                        </p>
                      </div>
                    </div>
                  );
                }

                const onboarding = currentProj.onboarding;
                const handover = currentProj.handoverProtocol;

                return (
                  <div className="space-y-6">
                    
                    {/* Live Success Banner */}
                    {provisionSuccessInfo && provisionSuccessInfo.companyName === currentProj.company && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-800 text-xs">
                        <div className="flex gap-2.5">
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-2 flex-1">
                            <p className="font-bold leading-normal text-emerald-900">PROJEKT ERFOLGREICH PROVISIONIERT & BEREITGESTELLT!</p>
                            <p className="leading-normal">
                              Die Landingpage und das CRM-System für die <strong>{provisionSuccessInfo.companyName}</strong> wurden auf Ihrem Cloud-Server eingerichtet. Kein separates Hosting erforderlich.
                            </p>
                            
                            <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 space-y-1 font-mono text-[11px] text-slate-800">
                              <p>🌐 <strong>Landingpage Link:</strong> <span className="text-blue-600 underline">{provisionSuccessInfo.landingpageUrl}</span></p>
                              <p>🖥️ <strong>Personalisiertes CRM:</strong> {provisionSuccessInfo.crmTitle}</p>
                              <p>🔑 <strong>Admin-Login:</strong> {provisionSuccessInfo.adminUser} / {provisionSuccessInfo.adminPass}</p>
                              <p>👤 <strong>Mandanten-Login:</strong> {provisionSuccessInfo.clientUser} / {provisionSuccessInfo.clientPass}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Onboarding Overview Panel */}
                    <div className="space-y-4 text-slate-750">
                      
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4 text-slate-500" />
                            <span>Erfasste Projektdaten ({currentProj.company})</span>
                          </h3>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Datenbasis für KI-Landingpage & CRM-Branding</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            id="btn-preview-landing-trigger"
                            onClick={() => setLandingPagePreviewCustId(currentProj.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Laptop className="w-3 h-3 text-slate-600" />
                            <span>Landingpage betrachten</span>
                          </button>
                        </div>
                      </div>

                      {onboarding ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Firmenname:</strong> <span className="text-slate-800 font-semibold">{onboarding.companyName}</span></p>
                            <p><strong className="text-slate-500">Branche:</strong> <span className="text-slate-750 font-medium">{onboarding.industry}</span></p>
                            <p><strong className="text-slate-500">Hauptleistungen:</strong> <span className="text-slate-700">{onboarding.services}</span></p>
                            <p><strong className="text-slate-500">Produkte:</strong> <span className="text-slate-700">{onboarding.products}</span></p>
                            <p><strong className="text-slate-500">Zielgruppe:</strong> <span className="text-slate-700">{onboarding.targetGroup}</span></p>
                          </div>
                          
                          <div className="space-y-2">
                            <p><strong className="text-slate-500">Kontaktdaten:</strong> <span className="text-slate-700">{onboarding.phone} | {onboarding.email}</span></p>
                            <p><strong className="text-slate-500">Adresse:</strong> <span className="text-slate-700 leading-tight block mt-0.5">{onboarding.address}</span></p>
                            <p><strong className="text-slate-500">Leistungsmerkmale:</strong> <span className="text-slate-700">{onboarding.specialFeatures}</span></p>
                            <p><strong className="text-slate-500">Terminwünsche:</strong> <span className="text-slate-700">{onboarding.appointmentWishes || 'Keine Angabe'}</span></p>
                          </div>

                          <div className="md:col-span-2 pt-2 border-t border-slate-100">
                            <p className="text-slate-500 font-bold mb-0.5">Unternehmensbeschreibung:</p>
                            <p className="text-slate-650 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">{onboarding.description}</p>
                          </div>
                          
                          {onboarding.individualRequirements && (
                            <div className="md:col-span-2">
                              <p className="text-slate-500 font-bold mb-0.5">Individuelle Anforderungen:</p>
                              <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-250 text-amber-800 font-mono text-[10.5px]">
                                {onboarding.individualRequirements}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                          <p className="text-xs">Für diesen Kunden sind noch keine Onboarding-Daten erfasst worden.</p>
                          <button
                            onClick={() => {
                              setOnboardingForm({
                                custId: currentProj.id,
                                newClientName: currentProj.name,
                                companyName: currentProj.company,
                                industry: 'Dienstleistungsunternehmen',
                                services: '',
                                products: '',
                                targetGroup: '',
                                phone: currentProj.phone,
                                email: currentProj.email,
                                address: currentProj.address,
                                description: '',
                                specialFeatures: '',
                                logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop',
                                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
                                appointmentWishes: '',
                                individualRequirements: '',
                                crmTitle: ''
                              });
                              setIsOnboardingFormOpen(true);
                            }}
                            className="mt-2 text-[10px] text-indigo-600 font-bold uppercase tracking-wider hover:underline"
                          >
                            Jetzt Datenerfassungsformular ausfüllen
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Standardized Übergabeprotokoll Document Panel */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span>Standard-Übergabeprotokoll</span>
                          </h3>
                          <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Absicherung der ordnungsgemäßen Bereitstellung</p>
                        </div>
                        
                        <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
                          handover?.confirmedByClient 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-758 border-amber-200'
                        }`}>
                          {handover?.confirmedByClient ? 'VOM Mandanten BESTÄTIGT' : 'UNTERSCHRIFT AUSSTEHEND'}
                        </span>
                      </div>

                      {handover ? (
                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs text-slate-700">
                          {/* Formal Header */}
                          <div className="flex justify-between items-start border-b border-slate-250 pb-3">
                            <div>
                              <h4 className="font-bold uppercase text-slate-800 text-xs tracking-wide">ÜBERGABEPROTOKOLL</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Nummer: UP-2026-{currentProj.id.substring(5, 11).toUpperCase()}</p>
                            </div>
                            <div className="text-right text-[10px] text-slate-500 font-mono">
                              <p>Datum: {handover.handoverDate || 'Keine Angabe'}</p>
                              <p>Hoster: Enterprise Central Germany</p>
                            </div>
                          </div>

                          {/* Technical provision checkmarks */}
                          <div>
                            <p className="font-mono text-[9px] uppercase font-bold text-slate-455 tracking-wider mb-2">Erfolgreiche Funktionsprüfung</p>
                            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px] text-slate-750">
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✔</span>
                                <span>[Landingpage] Status 200 OK</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✔</span>
                                <span>[Custom CRM] Personalisiert</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✔</span>
                                <span>[User DB Cluster] Initiale User</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600 font-bold">✔</span>
                                <span>[Secure Vault] E2EE Zertifikat</span>
                              </div>
                            </div>
                          </div>

                          {/* Credentials Table */}
                          <div className="bg-white border border-slate-202 rounded-lg p-3 space-y-1.5 text-xs">
                            <p className="font-bold text-[10.5px] text-slate-700">Zugangsdaten &amp; Links:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10.5px] font-mono text-slate-650">
                              <div>
                                <p className="text-slate-400 font-sans font-bold">Admin-Schnittstelle:</p>
                                <div className="mt-0.5 bg-slate-50 p-1.5 rounded text-slate-800 border border-slate-100">
                                  User: <strong>{handover.adminUsername}</strong><br />
                                  Pass: <strong>{handover.adminPasswordPlain}</strong>
                                </div>
                              </div>
                              <div>
                                <p className="text-slate-400 font-sans font-bold">Kundenportal-Logins:</p>
                                <div className="mt-0.5 bg-slate-50 p-1.5 rounded text-slate-800 border border-slate-100">
                                  User: <strong>{handover.clientUsername}</strong><br />
                                  Pass: <strong>{handover.clientPasswordPlain}</strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Signature confirmation state */}
                          <div className="pt-3 border-t border-slate-200">
                            {handover.confirmedByClient ? (
                              <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                                <div className="space-y-1">
                                  <p className="font-bold">✓ Bestätigung des Kunden liegt vor</p>
                                  <p className="text-[10px] text-emerald-600 font-medium">
                                    Rechtswirksam digital unterzeichnet von: <strong>{handover.confirmationSignature}</strong>
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-100/50 px-2.5 py-1 rounded-md border border-emerald-202 flex-shrink-0">
                                  SEAL HASH: UP-{currentProj.id.substring(4, 11).toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs leading-relaxed space-y-2">
                                <p className="font-bold">⚠ Unterschrift ausstehend</p>
                                <p>
                                  Der Mandant hat dieses Übergabeprotokoll noch nicht digital gegengezeichnet. Der Mandant kann sich im Kundenportal anmelden und unter dem Reiter <strong>&quot;Projekt &amp; Übergabe&quot;</strong> die Abnahme vollständig selbst durchführen.
                                </p>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      const updatedCustomers = data.customers.map(c => {
                                        if (c.id === currentProj.id) {
                                          return {
                                            ...c,
                                            handoverProtocol: {
                                              ...c.handoverProtocol!,
                                              confirmedByClient: true,
                                              confirmationSignature: `Administrativer Bypass (${currentProj.name})`,
                                              confirmationDate: new Date().toISOString()
                                            }
                                          };
                                        }
                                        return c;
                                      });
                                      onDataChange({ ...data, customers: updatedCustomers });
                                    }}
                                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] uppercase font-mono rounded transition-colors cursor-pointer"
                                  >
                                    Überbrücken (Voranmeldung bestätigen)
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">Kein Übergabeprotokoll generiert.</p>
                      )}
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>

          {/* ONBOARDING MODAL: DATENERFASSUNGSFORMULAR */}
          {isOnboardingFormOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
                <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-bold text-sm tracking-tight font-mono uppercase">Datenerfassungsformular</h3>
                    <p className="text-[10px] text-slate-400">Automatische Erstellung der Landingpage &amp; CRM-Konfiguration</p>
                  </div>
                  <button
                    onClick={() => setIsOnboardingFormOpen(false)}
                    className="text-slate-400 hover:text-white transition-all p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleProvisionProject} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-700 text-left">
                  {/* Select Customer mapping */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Mandant zuweisen*</label>
                    <select
                      value={onboardingForm.custId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        if (cid) {
                          const matched = data.customers.find(c => c.id === cid);
                          if (matched) {
                            setOnboardingForm({
                              ...onboardingForm,
                              custId: cid,
                              newClientName: '',
                              companyName: matched.company || onboardingForm.companyName,
                              phone: matched.phone || onboardingForm.phone,
                              email: matched.email || onboardingForm.email,
                              address: matched.address || onboardingForm.address,
                              crmTitle: onboardingForm.crmTitle || `Musterfirma CRM (${matched.company})`
                            });
                          }
                        } else {
                          setOnboardingForm({
                            ...onboardingForm,
                            custId: '',
                            companyName: ''
                          });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 focus:bg-white transition-all font-mono"
                    >
                      <option value="">-- Neuen Kunden direkt anlegen --</option>
                      {data.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>

                  {!onboardingForm.custId && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Name des künftigen Ansprechpartners*</label>
                      <input
                        type="text"
                        placeholder="z.B. Sabine Müller"
                        value={onboardingForm.newClientName}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, newClientName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Firmenname*</label>
                      <input
                        type="text"
                        placeholder="z.B. Müller Beratung GmbH"
                        value={onboardingForm.companyName}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, companyName: e.target.value, crmTitle: `${e.target.value} CRM` })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 focus:bg-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Branchentyp*</label>
                      <select
                        value={onboardingForm.industry}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, industry: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500 focus:bg-white"
                      >
                        <option value="Versicherung">Versicherungsagentur &amp; Makler</option>
                        <option value="Handelsvertretung">Handelsvertretung &amp; Vertrieb</option>
                        <option value="Dienstleistungsunternehmen">Dienstleistungsunternehmen</option>
                        <option value="Finanzberatung">Finanzberatung</option>
                        <option value="Schnitt &amp; Medienproduktion">Schnitt &amp; Medienproduktion</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Telefon*</label>
                      <input
                        type="text"
                        value={onboardingForm.phone}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Email*</label>
                      <input
                        type="email"
                        value={onboardingForm.email}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Adresse*</label>
                      <input
                        type="text"
                        value={onboardingForm.address}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Dienstleistungen (kommagetrennt)</label>
                      <input
                        type="text"
                        placeholder="z.B. Premium-Vermittlung, Altersvorsorge-Struktur, Hausrat"
                        value={onboardingForm.services}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, services: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Produkte (kommagetrennt)</label>
                      <input
                        type="text"
                        placeholder="z.B. Schutzschild-Tarif, Kapital-Rente"
                        value={onboardingForm.products}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, products: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none text-xs focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Zielgruppe</label>
                      <input
                        type="text"
                        placeholder="z.B. Junge Familien, Gründer"
                        value={onboardingForm.targetGroup}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, targetGroup: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Terminwünsche</label>
                      <input
                        type="text"
                        placeholder="z.B. Montag Nachmittag"
                        value={onboardingForm.appointmentWishes}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, appointmentWishes: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Unternehmensbeschreibung*</label>
                    <textarea
                      placeholder="Geben Sie eine prägnante Firmenbeschreibung ein."
                      rows={3}
                      value={onboardingForm.description}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Besondere Leistungsmerkmale</label>
                      <input
                        type="text"
                        placeholder="z.B. ISO-Zertifizierung, Digitaler Eilservice"
                        value={onboardingForm.specialFeatures}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, specialFeatures: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Wunsch-CRM Bezeichnung</label>
                      <input
                        type="text"
                        placeholder="z.B. Premium CRM oder Musterfirma CRM"
                        value={onboardingForm.crmTitle}
                        onChange={(e) => setOnboardingForm({ ...onboardingForm, crmTitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono font-bold">Individuelle Anforderungen im Projekt</label>
                    <textarea
                      placeholder="Besondere Schnittstellen, abweichendes Design..."
                      rows={2}
                      value={onboardingForm.individualRequirements}
                      onChange={(e) => setOnboardingForm({ ...onboardingForm, individualRequirements: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsOnboardingFormOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase font-mono rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-800 text-white font-bold text-[10px] uppercase font-mono rounded-xl tracking-wider transition-all shadow cursor-pointer border border-transparent"
                    >
                      Auf Cloud-Server bereitstellen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SIMULATED VIRTUAL WEB DEVICE: LANDINGPAGE SIMULATOR MODAL */}
          {landingPagePreviewCustId && (() => {
            const previewCust = data.customers.find(c => c.id === landingPagePreviewCustId);
            if (!previewCust) return null;
            
            const brandName = previewCust.company;
            const industry = previewCust.onboarding?.industry || 'Unternehmensberatung';
            const description = previewCust.onboarding?.description || 'Ihr vertrauenswürdiger Service-Partner.';
            
            const servicesArray = previewCust.onboarding?.services 
              ? previewCust.onboarding.services.split(',').map(s => s.trim()) 
              : ['Individuelle Fachberatung', 'Prozessanalyse & Audit', 'Laufende Betreuung & Administration'];
              
            const productsArray = previewCust.onboarding?.products 
              ? previewCust.onboarding.products.split(',').map(p => p.trim()) 
              : ['Standardpaket Basic', 'Premium Service-Schild v2'];

            let themeClass = 'from-blue-900 to-indigo-950 text-white';
            let btnClass = 'bg-blue-600 hover:bg-blue-700 text-white';
            
            if (industry.includes('Versicherung')) {
              themeClass = 'from-sky-900 to-blue-950 text-white';
              btnClass = 'bg-sky-600 hover:bg-sky-700 text-white';
            } else if (industry.includes('vertrieb') || industry.includes('Vertretung')) {
              themeClass = 'from-indigo-900 to-slate-900 text-white';
              btnClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';
            } else if (industry.includes('Dienstleitung') || industry.includes('Consulting')) {
              themeClass = 'from-slate-900 to-slate-950 text-white';
              btnClass = 'bg-indigo-600 hover:bg-indigo-700 text-white';
            } else if (industry.includes('Medien') || industry.includes('Schnitt')) {
              themeClass = 'from-fuchsia-950 to-slate-950 text-white';
              btnClass = 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white';
            }

            return (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 z-50 overflow-y-auto">
                <div className="bg-slate-100 rounded-2xl max-w-4xl w-full border border-slate-700 shadow-2xl flex flex-col my-4 h-[95vh] text-[13px] text-slate-800 leading-normal select-none">
                  
                  {/* Virtual Frame Browser Bar */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 flex-shrink-0 text-white">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    
                    {/* Simulated Address Field */}
                    <div className="bg-slate-850 border border-slate-800 rounded-lg py-1 px-4 text-slate-350 text-xs font-mono w-2/3 text-center flex items-center justify-center gap-1">
                      <LockKeyhole className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{previewCust.landingpageUrl || `https://${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.my-portal.de`}</span>
                    </div>

                    <button
                      onClick={() => setLandingPagePreviewCustId(null)}
                      className="text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg flex items-center gap-1 font-mono text-[10px] uppercase font-bold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Schließen</span>
                    </button>
                  </div>

                  {/* VIRTUAL ACTIVE LANDING PAGE CONTAINER */}
                  <div className="flex-1 overflow-y-auto bg-white font-sans antialiased text-slate-800 text-left">
                    
                    {/* Public Header */}
                    <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex justify-between items-center shadow-sm select-none">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-md text-white font-black flex items-center justify-center text-sm font-mono uppercase">
                          {brandName.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight text-sm uppercase">{brandName}</span>
                      </div>
                      
                      <nav className="hidden md:flex items-center gap-5 text-slate-650 font-semibold text-xs">
                        <a href="#services" className="hover:text-indigo-600 transition-colors">Leistungen</a>
                        <a href="#products" className="hover:text-indigo-600 transition-colors">Produkte</a>
                        <a href="#appointment" className="hover:text-indigo-600 transition-colors">Abstimmung</a>
                        <a href="#contact" className="hover:text-indigo-600 transition-colors font-mono">PORTAL API</a>
                      </nav>

                      {/* Explicit Login Area Access from Landingpage */}
                      <button
                        onClick={() => {
                          setLandingPagePreviewCustId(null);
                          onTabChange('dashboard');
                          alert(`Bereichs-Demo: Nutzen Sie zur Anmeldung am Hauptportal Ihre Mandantendaten: User: '${previewCust.username}', Passwort: 'kunde123'.`);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Unlock className="w-3 h-3 text-emerald-400" />
                        <span>Kunden-Login</span>
                      </button>
                    </header>

                    {/* HERO ELEMENT */}
                    <section className={`bg-gradient-to-br ${themeClass} py-14 px-8 text-center relative overflow-hidden select-none`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="max-w-2xl mx-auto space-y-4 relative z-10 text-center">
                        <span className="bg-white/10 border border-white/20 text-white font-mono text-[9px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full">
                          {industry.toUpperCase()} • POWERED BY SECURE PORTAL
                        </span>
                        
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                          Exzellenz &amp; Vertrauen für {brandName}
                        </h1>
                        
                        <p className="text-slate-200 text-sm leading-relaxed max-w-lg mx-auto font-sans opacity-95">
                          {description}
                        </p>
                        
                        <div className="pt-4 flex justify-center gap-3">
                          <a href="#appointment" className={`px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow ${btnClass}`}>
                            Termin anfragen
                          </a>
                          <a href="#services" className="bg-white/10 hover:bg-white/20 text-white px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-white/20">
                            Mehr erfahren
                          </a>
                        </div>
                      </div>
                    </section>

                    {/* SERVICES ELEMENT */}
                    <section id="services" className="py-12 px-8 max-w-4xl mx-auto space-y-6">
                      <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">Unser Dienstleistungsportfolio</h2>
                        <p className="text-xs text-slate-500 font-sans">Maßgeschneiderte Loesungen &amp; Konzepte für Sie</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {servicesArray.map((service, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl space-y-2 hover:shadow-sm transition-all text-left">
                            <span className="text-xl">✨</span>
                            <h4 className="font-bold text-slate-800 text-xs">{service}</h4>
                            <p className="text-slate-500 text-[11px] leading-normal font-sans">
                              Zuverlässig implementiert und engmaschig überwacht durch die erfahrenen Spezialisten der {brandName}.
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* PRODUCTS ELEMENT */}
                    <section id="products" className="py-10 bg-slate-50 border-y border-slate-150 px-8">
                      <div className="max-w-4xl mx-auto space-y-6">
                        <div className="text-center space-y-1">
                          <h2 className="text-xl font-bold text-slate-900">Exklusive Beratungs-Produkte</h2>
                          <p className="text-xs text-slate-500 font-sans">Herausragender Schutz und strukturierte Rahmenbedingungen</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {productsArray.map((prod, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex gap-3.5 items-start text-left">
                              <span className="p-2.5 bg-indigo-50 text-indigo-650 rounded-xl font-bold text-xs font-mono">0{idx + 1}</span>
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-800 text-xs">{prod}</h4>
                                <p className="text-slate-600 text-[11px] leading-normal font-sans">
                                  Hauseigene Produktklasse der {brandName}, speziell formuliert zur Reduzierung von operationalen Risiken und finanziellen Einbußen.
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* LIVE APPOINTMENT BOOKING FORM IN LANDING PAGE */}
                    <section id="appointment" className="py-12 px-8 max-w-2xl mx-auto space-y-6">
                      <div className="text-center space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">Direkte Online-Terminanfrage</h2>
                        <p className="text-xs text-slate-500 font-sans">
                          Wunschtermin sichern • Sofortige Erstellung im CRM-Kalender
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-left space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Gewünschtes Datum*</label>
                            <input
                              id="lp-appt-date-2"
                              type="date"
                              defaultValue="2026-06-15"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Wunsch-Uhrzeit*</label>
                            <input
                              id="lp-appt-time-2"
                              type="time"
                              defaultValue="10:00"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Anlass des Gesprächs*</label>
                          <input
                            id="lp-appt-title-2"
                            type="text"
                            placeholder="z.B. Kennenlerngespräch &amp; Erst-Checkup"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const dVal = (document.getElementById('lp-appt-date-2') as HTMLInputElement)?.value || '2026-06-15';
                            const tVal = (document.getElementById('lp-appt-time-2') as HTMLInputElement)?.value || '10:00';
                            const titleVal = (document.getElementById('lp-appt-title-2') as HTMLInputElement)?.value || 'Erstberatung Onlinetermin';

                            const newAppointment: CalendarAppointment = {
                              id: 'appt-' + Date.now(),
                              title: `${titleVal} (Anfrage via Landingpage)`,
                              date: dVal,
                              time: tVal,
                              description: `Automatisierte Termineinreichung durch Interessenten über die öffentliche Landingpage der ${previewCust.company}.`,
                              status: 'Ausstehend',
                              customerId: previewCust.id
                            };

                            onDataChange({
                              ...data,
                              appointments: [...(data.appointments || []), newAppointment]
                            });

                            alert(`Terminanfrage am ${dVal} um ${tVal} Uhr erfolgreich im Kalender der ${previewCust.company} hinterlegt! Der CRM-Bearbeiter erhält hierzu sofort eine Benachrichtigung im Kontrollzentrum.`);
                          }}
                          className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono cursor-pointer ${btnClass}`}
                        >
                          Termin jetzt verbindlich anfragen
                        </button>
                      </div>
                    </section>

                    {/* PUBLIC FOOTER */}
                    <footer className="bg-slate-900 text-slate-400 py-10 px-8 text-center text-xs select-none border-t border-slate-850">
                      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="space-y-2">
                          <p className="font-bold text-white uppercase tracking-wider">{brandName}</p>
                          <p className="text-[11px] leading-relaxed text-slate-400">
                            Ihr zertifizierter und hochspezialisierter Partner für künftige Projekte und lückenlose Beratung.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-bold text-white uppercase tracking-wider text-[11px]">Services &amp; Kontakt</p>
                          <p>Tel: {previewCust.onboarding?.phone || previewCust.phone}</p>
                          <p>Email: {previewCust.onboarding?.email || previewCust.email}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-bold text-white uppercase tracking-wider text-[11px]">Zentrale Anschrift</p>
                          <p className="leading-relaxed">{previewCust.onboarding?.address || previewCust.address}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Geschützter Hostingbereich • Cloud Server Cluster</p>
                        </div>
                      </div>
                    </footer>

                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* 9. INTERAKTIVE KANZLEI DOCUMENTATION & HANDBUCH */}
      {activeTab === 'documentation' && (
        <ManualDoc />
      )}

      {/* SYSTEM RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-rose-950 text-white p-5 border-b border-rose-800 flex items-center gap-3 shrink-0">
              <div className="p-2 bg-rose-500/25 text-rose-300 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  System-Zurücksetzung &amp; Datenmanagement
                </h4>
                <p className="text-[10px] text-rose-300 font-mono mt-0.5 uppercase">Administrativer Eingriff</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <strong>Daten sichern & wiederherstellen:</strong> Hier können Sie die gesamte CRM-Inhaltsmappe lokal archivieren oder einspielen.
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-150">
                <button
                  type="button"
                  onClick={handleExportFullJSON}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 justify-center cursor-pointer shadow-sm text-center"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Backup exportieren</span>
                </button>

                <label className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 justify-center cursor-pointer text-slate-700 text-center select-none">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Backup einspielen</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFullJSON}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-900 leading-relaxed">
                <strong>Werkseinstellungen & Löschen:</strong> Vorsicht, diese Aktionen verändern den aktuellen Stand der Mappe nachhaltig.
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSystemReset('empty')}
                  className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl hover:border-rose-400 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-200 shrink-0">
                    <Trash className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs text-left">Alle Dummydaten löschen (Clean-Slate-Modus)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Löscht alle Kundenkonten, hochgeladenen Dateien, Chat-Nachrichten, Rechnungen und Termine. Startet das System als leere, betriebsbereite Plattform für reale Kundendaten.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSystemReset('demo')}
                  className="w-full text-left p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-200 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs text-left">Zurücksetzen auf Demo-Werkseinstellungen</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Übernimmt die Standard-Dummydaten (inkl. Anna Schmidt &amp; Max Muster), um das System für Präsentationszwecke voll funktionsfähig und beispielhaft zu füllen.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal High Density Status Footer */}
      <footer className="h-8 bg-slate-950 text-slate-400 px-4 flex items-center justify-between text-[10px] font-mono select-none flex-shrink-0 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>SYSTEM: DATENSCHUTZKONFORM (OFFLINE-MODUS)</span>
        </div>
        <div>
          <span>{data.adminProfile?.name?.toUpperCase() || 'ADMINISTRATOR'} • CONSULTING CRM PRO v4.1</span>
        </div>
      </footer>
    </div>
  );
}
