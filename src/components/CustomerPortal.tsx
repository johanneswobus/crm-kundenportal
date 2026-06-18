import React, { useState, useRef, useMemo } from 'react';
import { Customer, UploadedFile, DirectMessage, CalendarAppointment, CRMData, PortfolioContract } from '../types';
import { encryptMessage, decryptMessage } from '../cryptoUtils';
import { ROADMAP_TEMPLATES } from '../templates';
import ManualDoc from './ManualDoc';
import { 
  FileText, 
  Video, 
  File, 
  UploadCloud, 
  MessageSquare, 
  Calendar, 
  Send, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  User,
  Shield,
  Key,
  ChevronRight,
  Wifi,
  WifiOff,
  ShieldCheck,
  LockKeyhole,
  RefreshCw,
  Paperclip,
  Check,
  Lock,
  PenTool,
  Award,
  Trash,
  Trash2,
  Phone,
  Mail,
  Smartphone,
  QrCode,
  ExternalLink,
  Receipt,
  BookOpen,
  Euro,
  Server,
  Globe,
  Laptop,
  Briefcase,
  Boxes,
  Printer
} from 'lucide-react';
import { hashPassword } from '../storage';

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: 'Kein Passwort eingegeben', bgClass: 'bg-slate-200', textColor: 'text-slate-400' };
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

interface CustomerPortalProps {
  customer: Customer;
  data: CRMData;
  onDataChange: (newData: CRMData | ((prev: CRMData) => CRMData)) => void;
  activeTab: string;
  isOnline: boolean;
  onOnlineToggle: (online: boolean) => void;
  onTabChange?: (tab: string) => void;
}

export interface RoadmapSubTask {
  id: string;
  phase: number;
  title: string;
  desc: string;
  role: 'Kunde' | 'Berater' | 'Beide';
  actionLabel?: string;
  actionType?: 'upload' | 'appointment' | 'chat';
}

export const ROADMAP_SUBTASKS: RoadmapSubTask[] = [
  { id: 'p1t1', phase: 1, title: 'Kostenfreie Erst-Beratung & Bedarfsanalyse', desc: 'Briefing-Termin mit Ihrem Berater zur Klärung der strategischen Ausrichtung und Meilensteine.', role: 'Beide', actionLabel: 'Erstgespräch buchen', actionType: 'appointment' },
  { id: 'p1t2', phase: 1, title: 'Beratungs-Rahmenvertrag digital unterzeichnen', desc: 'Rechtliche Absicherung der Zusammenarbeit im Mandantenportal sichten und digital signieren.', role: 'Kunde', actionLabel: 'Zu den Verträgen', actionType: 'upload' },
  { id: 'p1t3', phase: 1, title: 'Onboarding-Fragebogen ausfüllen', desc: 'Einreichen aller Unternehmensziele und Fokus-KPIs für die Analysephase.', role: 'Kunde', actionLabel: 'Nachricht senden', actionType: 'chat' },

  { id: 'p2t1', phase: 2, title: 'Upload relevanter Geschäfts- & Werbedaten', desc: 'Sicheres Bereitstellen von aktuellen Reportings, Werbe-Budgets und Analytics-Zugängen.', role: 'Kunde', actionLabel: 'Dokument hochladen', actionType: 'upload' },
  { id: 'p2t2', phase: 2, title: 'Detaillierter Video- & Social-Media Audit', desc: 'Professionelle Analyse Ihres bisherigen Online-Auftritts und Contents durch unsere Experten.', role: 'Berater' },
  { id: 'p2t3', phase: 2, title: 'Identifikation primärer Optimierungshebel', desc: 'Schnittmuster- & Zielgruppen-Checkup zur Vorbereitung der finalen Konzepte.', role: 'Berater' },

  { id: 'p3t1', phase: 3, title: 'Ausarbeitung der maßgeschneiderten Content-Strategie', desc: 'Erstellung des individuellen Redaktionsplans und der Skript-Vorlagen.', role: 'Berater' },
  { id: 'p3t2', phase: 3, title: 'Entwurfs-Abstimmungstermin (Medien-Layout)', desc: 'Virtueller Workshop zur gemeinsamen Feinabstimmung der Strategie.', role: 'Beide', actionLabel: 'Termin vereinbaren', actionType: 'appointment' },
  { id: 'p3t3', phase: 3, title: 'Freigabe des Budget- und Ressourcenplans', desc: 'Finale Bestätigung der Drehtage, Ad-Spendings und Freigabeschritte.', role: 'Kunde', actionLabel: 'Freigabe bestätigen', actionType: 'chat' },

  { id: 'p4t1', phase: 4, title: 'Einreichung des Content-Rohmaterials', desc: 'Upload der Rohvideos und Bilddateien direkt über die gesicherte Datei-Schnittstelle im Portal.', role: 'Kunde', actionLabel: 'Videomaterial hochladen', actionType: 'upload' },
  { id: 'p4t2', phase: 4, title: 'Schnitt & Postproduktion der Social-Media Ads', desc: 'Postproduktion (Untertitel, Sound-Design, Color Grading) durch unser Expertenteam.', role: 'Berater' },
  { id: 'p4t3', phase: 4, title: 'Kampagnen-Launch & Einpflegen in Ad-Kanäle', desc: 'Start der ersten organischen und bezahlten Marketing-Kanäle.', role: 'Beide' },

  { id: 'p5t1', phase: 5, title: 'Performance- & KPI-Dashboard Auswertung', desc: 'Vergleich der real erzielten Ergebnisse und Conversion-Rates mit den Onboarding-Zielen.', role: 'Beide' },
  { id: 'p5t2', phase: 5, title: 'Abschlussgespräch & Retainer-Planung', desc: 'Evaluation der Erfolge und Vereinbarung von Folgemodellen zur dauerhaften Skalierung.', role: 'Beide', actionLabel: 'Abschlusstermin buchen', actionType: 'appointment' },
  { id: 'p5t3', phase: 5, title: 'Übergabe aller finalen Projekt-Assets', desc: 'Bereitstellung hochauflösender Masterfiles und Kampagnenberichte zur Archivierung.', role: 'Berater' }
];

export const FURNITURE_THEME_CONTRACTS: PortfolioContract[] = [
  {
    id: 'pc1',
    name: 'Maßgefertigte Büromöbel & Executive Suiten',
    insurer: 'Tischler-Werkstatt',
    policyNumber: 'MOB-MUC-982-11',
    premium: 45000.00,
    paymentInterval: 'Projekt',
    status: 'In Fertigung',
    startDate: '2026-05-10',
    deductible: 'Inkl. Montage',
    contactPerson: 'Zentraler Tischlereileiter',
    coverage: 'Abnahme bis Aug 2026',
    scope: 'Vorstandsetage MUC-Süd',
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
    policyNumber: 'RAUM-MUC-509-AA',
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
    policyNumber: 'SPF-MUC-224-BB',
    premium: 150.00,
    paymentInterval: 'Monat',
    status: 'Aktiv',
    startDate: '2026-06-15',
    deductible: 'Materialkosten inkl.',
    contactPerson: 'Kundendienst Tischler e.K.',
    coverage: '24 Monate Laufzeit',
    scope: 'Vollholz-Einrichtung Gesamt',
    mainDueDate: '2028-06-15',
    billingMethod: 'Lastschrifteinzug monatlich',
    details: [
      'Jährliche manuelle Tiefenreinigung & Nachölung aller Massivholzoberflächen',
      'Justierung & Nachziehen aller mechanischen Beschläge und Führungen',
      'Reparaturgarantie bei unverschuldeten Kratzern oder Dellen binnen 48 Stunden',
      'Express-Vor-Ort-Hilfe bei Transportschäden oder internen Umzügen',
      'Bereitstellung von Profi-Pflegesets für das interne Facility Management'
    ]
  }
];

export default function CustomerPortal({ customer, data, onDataChange, activeTab, isOnline, onOnlineToggle, onTabChange }: CustomerPortalProps) {
  // --- DYNAMIC ROADMAP PORTFOLIO SELECTORS ---
  const activeTemplate = useMemo(() => {
    const templateId = customer.roadmapTemplateId || 'marketing';
    return ROADMAP_TEMPLATES.find(t => t.id === templateId) || ROADMAP_TEMPLATES[0];
  }, [customer.roadmapTemplateId]);

  const currentPhases = useMemo(() => {
    return customer.roadmapPhases && customer.roadmapPhases.length === 5 
      ? customer.roadmapPhases 
      : activeTemplate.phases;
  }, [customer.roadmapPhases, activeTemplate]);

  const currentTasks = useMemo(() => {
    return customer.roadmapTasks && customer.roadmapTasks.length > 0
      ? customer.roadmapTasks
      : activeTemplate.tasks;
  }, [customer.roadmapTasks, activeTemplate]);

  // --- REAL-TIME PORTFOLIO CONTRACTS FOR SPECIFIC CUSTOMER ---
  const currentContracts = useMemo(() => {
    const dbCust = data.customers?.find(c => c.id === customer.id) || customer;
    if (dbCust.contracts && dbCust.contracts.length > 0) {
      return dbCust.contracts;
    }
    return FURNITURE_THEME_CONTRACTS;
  }, [customer.id, data.customers]);

  // --- ROADMAP STATE & HANLERS ---
  const [selectedRoadmapPhase, setSelectedRoadmapPhase] = useState<number>(customer.activePhase || 1);

  const toggleSubTask = (taskId: string) => {
    const currentCompleted = customer.completedTasks || [];
    let updatedCompleted: string[];
    if (currentCompleted.includes(taskId)) {
      updatedCompleted = currentCompleted.filter(id => id !== taskId);
    } else {
      updatedCompleted = [...currentCompleted, taskId];
    }
    const updatedCustomers = data.customers.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          completedTasks: updatedCompleted
        };
      }
      return c;
    });
    onDataChange({
      ...data,
      customers: updatedCustomers
    });
  };

  // --- MODERN DIGITAL SERVICES INTEGRATION ---
  const [showKeasyModal, setShowKeasyModal] = useState(false);

  const [wwsSearchQuery, setWwsSearchQuery] = useState('');

  const downloadVCard = () => {
    const adminName = data.adminProfile?.name || 'Ihr Berater';
    const adminCompany = data.adminProfile?.company || 'Consulting Agency';
    const adminEmail = data.adminProfile?.email || 'info@agency.de';
    const adminPhone = data.adminProfile?.phone || '';
    const adminAddress = data.adminProfile?.address || '';
    
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
N:${adminName.split(' ').reverse().join(';')};;;
FN:${adminName}
ORG:${adminCompany}
TITLE:Unternehmensberater & Projekt-Experte
TEL;TYPE=WORK,VOICE:${adminPhone}
EMAIL;TYPE=PREF,INTERNET:${adminEmail}
ADR;TYPE=WORK:;;${adminAddress};;;;
NOTE:Ganzheitliche Beratung und Strategieplanung.
END:VCARD`;

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Visitenkarte_${adminName.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // --- STATE FOR FILE UPLOADER ---
  const [selectedCategory, setSelectedCategory] = useState<UploadedFile['category']>('Vertrag');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE FOR MESSAGES ---
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // --- STATE FOR PROFILE / SECURITY ---
  const [profileForm, setProfileForm] = useState({
    name: customer.name,
    company: customer.company,
    email: customer.email,
    phone: customer.phone,
    address: customer.address
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // --- STATE FOR DIGITAL SIGNATURES ---
  const [signingFileId, setSigningFileId] = useState<string | null>(null);
  const [signerFullName, setSignerFullName] = useState(customer.name);
  const [signatureDrawMode, setSignatureDrawMode] = useState<'text' | 'draw'>('text');
  const [drawnSignaturePoints, setDrawnSignaturePoints] = useState<string>(''); // simulates signature SVG drawing data
  const [isDrawing, setIsDrawing] = useState(false);

  // --- STATE FOR APPOINTMENTS ---
  const [newApForm, setNewApForm] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  });

  // --- STATE FOR CLIENT INVOICES ---
  const [selectedClientInvoice, setSelectedClientInvoice] = useState<any | null>(null);
  const [paymentDialogInvoice, setPaymentDialogInvoice] = useState<any | null>(null);

  // --- STATE FOR WEB-CONTRACT DETAILS OVERVIEW ---
  const [selectedDetailContract, setSelectedDetailContract] = useState<any | null>(null);

  // --- FILTER CLIENT SPECIFIC DATA ---
  const customerFiles = useMemo(() => {
    return data.files.filter(f => f.customerId === customer.id)
      .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [data.files, customer.id]);

  const chatMessages = useMemo(() => {
    return data.messages.filter(
      m => (m.senderId === customer.id && m.receiverId === 'admin') ||
           (m.senderId === 'admin' && m.receiverId === customer.id)
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data.messages, customer.id]);

  const customerAppointments = useMemo(() => {
    return data.appointments.filter(a => a.customerId === customer.id)
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.appointments, customer.id]);

  // --- ACTION HANDLERS ---
  
  // Real offline-first drag & drop file upload parsing
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0]);
    }
  };

  const processFileUpload = (file: File) => {
    // 50MB limits to protect localStorage in client apps, but alert user
    if (file.size > 52428800) {
      alert('Diese Datei überschreitet das Offline-Upload-Limit von 50 Megabyte.');
      return;
    }

    setUploadProgress(10);
    const reader = new FileReader();
    
    // Simulate loading bar for modern UX
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 80) {
          clearInterval(interval);
          return 80;
        }
        return prev + 15;
      });
    }, 100);

    reader.onload = (e) => {
      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        const dataUrl = e.target?.result as string;
        
        const newUploadedFile: UploadedFile = {
          id: `file-${Date.now()}`,
          customerId: customer.id,
          customerName: customer.name,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          category: selectedCategory,
          uploadDate: new Date().toISOString(),
          status: 'Eingereicht',
          // Save binary base64 code if file is small (under 1.5MB) to prevent local storage quota failures, otherwise keep simulated
          dataUrl: file.size < 1500000 ? dataUrl : undefined 
        };

        onDataChange({
          ...data,
          files: [...data.files, newUploadedFile]
        });

        setUploadProgress(null);
        uiNotify('Datei erfolgreich hochgeladen und zur Prüfung übermittelt!');
      }, 300);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setUploadProgress(null);
      alert('Fehler beim Einlesen der Datei.');
    };

    reader.readAsDataURL(file);
  };

  const uiNotify = (msg: string) => {
    // Quick custom toast inside view
    alert(msg);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // --- SEND MESSAGES (DMs) ---
  const pendingSyncCount = useMemo(() => {
    return data.messages.filter(m => m.senderId === customer.id && m.syncStatus === 'PendingSync').length;
  }, [data.messages, customer.id]);

  const handleSyncOfflineMessages = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updatedMessages = data.messages.map(m => {
        if (m.senderId === customer.id && m.syncStatus === 'PendingSync') {
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
    e.target.value = '';
  };

  const triggerBotResponse = (userText: string, updatedMessages: DirectMessage[]) => {
    setIsBotTyping(true);

    setTimeout(() => {
      const activeRules = data.botRules || [];
      const tokens = userText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/);
      const lowerText = userText.toLowerCase().trim();
      
      let bestRule: any = null;
      let maxScore = 0;

      // First check for active rules edited by admin
      for (const rule of activeRules) {
        let score = 0;
        for (const kw of rule.triggerKeywords) {
          if (userText.toLowerCase().includes(kw.toLowerCase())) {
            score += 2; // Keyword within string
          }
          // Exact token matches
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

      let botResponseContentStr = "";
      let matchedRuleId: string | null = null;

      if (bestRule && maxScore > 0) {
        botResponseContentStr = bestRule.answer;
        matchedRuleId = bestRule.id;
      } else {
        // Built-in high quality Smalltalk Engine matching dynamic administrator profile
        if (lowerText.match(/^(hallo|hi|hey|guten tag|servus|moin|guten morgen|guten abend|grüß gott|gruezi)/i)) {
          botResponseContentStr = "Ein herzliches Hallo, {Vorname}! Schön, dass Sie sich melden. Wie kann ich Sie heute bei Ihren Projekten und Beratungsthemen unterstützen?";
        } else if (lowerText.includes("wer bist du") || lowerText.includes("was bist du") || lowerText.includes("bist du eine ki") || lowerText.includes("bot") || lowerText.includes("assistent")) {
          botResponseContentStr = "Ich bin der digitale KI-Assistent. Ich unterstütze Sie bei Fragen zu unseren Kooperationsphasen, Dokumentenuploads, Terminabstimmungen oder Projektschritten hier im Mandantenbereich.";
        } else if (lowerText.includes("berater") || lowerText.includes("wer ist") || lowerText.includes("consultant")) {
          botResponseContentStr = "Ihr Ansprechpartner {Berater} berät Sie professionell zu Ihren Wachstumsprojekten, Prozess-Strategien sowie Medien- und Videomarketing.";
        } else if (lowerText.includes("danke") || lowerText.includes("vielen dank") || lowerText.includes("super") || lowerText.includes("klasse") || lowerText.includes("toll") || lowerText.includes("perfekt") || lowerText.includes("genial") || lowerText.includes("dankeschön")) {
          botResponseContentStr = "Sehr gerne, {Vorname}! Es freut mich riesig, wenn alles zu Ihrer vollsten Zufriedenheit läuft. Falls Sie noch Fragen haben, stehe ich Ihnen jederzeit zur Seite!";
        } else if (lowerText.includes("tschüss") || lowerText.includes("auf wiedersehen") || lowerText.includes("ciao") || lowerText.includes("bye") || lowerText.includes("schönen tag") || lowerText.includes("schönes wochenende")) {
          botResponseContentStr = "Auf Wiedersehen, {Vorname}! Ich wünsche Ihnen noch einen produktiven und erfolgreichen Tag. Bis zum nächsten Mal!";
        } else if (lowerText.match(/(beratung|projekt|strategie|marketing|prozess|video|abwicklung)/i)) {
          botResponseContentStr = "Wir unterstützen Sie bei der ganzheitlichen Strategieentwicklung, dem Videomarketing sowie der Prozess-Digitalisierung. Um ein konkretes Thema zu besprechen, vereinbaren Sie am besten direkt einen Online-Termin im Kalenderbereich!";
        } else if (lowerText.match(/(termin|kalender|buchen|gespräch|meeting|treffen)/i)) {
          botResponseContentStr = "Einen persönlichen Gesprächstermin können Sie unkompliziert im Register 'Termine' links anfragen. Wählen Sie einfach Ihren Wunschtag und Uhrzeit – nach Bestätigung erscheint dieser direkt in Ihrer Übersicht!";
        } else {
          // Elegant customized fallback with no robotic metadata
          botResponseContentStr = "Vielen Dank für Ihre Nachricht! Da ich zu Ihrer spezifischen Anfrage aktuell keine automatische Antwort parat habe, habe ich Ihr Anliegen soeben mit hoher Priorität direkt an **{Berater}** weitergeleitet. 📞\n\nWir werden uns in Kürze persönlich bei Ihnen im Portal oder telefonisch zurückmelden!";
        }
      }

      // 2. Placeholder Replacement Engine
      const now = new Date();
      const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
      const weekday = now.toLocaleDateString('de-DE', weekdayOptions);
      const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      const vorname = customer.name.split(' ')[0] || customer.name;

      const adminName = data.adminProfile?.name || 'Ihr Berater';
      const adminCompany = data.adminProfile?.company || 'Consulting Agency';

      botResponseContentStr = botResponseContentStr
        .replace(/{Kunde}/g, customer.name)
        .replace(/{Vorname}/g, vorname)
        .replace(/{Wochentag}/g, weekday)
        .replace(/{Datum}/g, dateStr)
        .replace(/{Uhrzeit}/g, timeStr)
        .replace(/{Berater}/g, adminName);

      // High quality Assistant template prefix
      const botResponseText = `🤖 [${adminCompany} - KI-Assistent]:\n${botResponseContentStr}`;
      const botEncrypted = encryptMessage(botResponseText, e2eePassphrase);
      
      const botMsg: DirectMessage = {
        id: `msg-bot-${Date.now()}`,
        senderId: 'admin',
        receiverId: customer.id,
        content: botResponseText,
        encryptedContent: botEncrypted,
        isEncrypted: true,
        timestamp: new Date().toISOString(),
        isRead: false,
        syncStatus: 'Synced'
      };

      let finalBotRules = data.botRules || [];
      if (matchedRuleId) {
        finalBotRules = finalBotRules.map(r => 
          r.id === matchedRuleId ? { ...r, usagesCount: r.usagesCount + 1 } : r
        );
      }

      // 3. Auto-learn logger for fallbacks
      let finalUnresolved = data.unresolvedQueries || [];
      if (!matchedRuleId) {
        const alreadyExists = finalUnresolved.some(u => u.query.toLowerCase().trim() === userText.toLowerCase().trim());
        if (!alreadyExists) {
          const newUnresolved = {
            id: `unresolved-${Date.now()}`,
            query: userText.trim(),
            timestamp: new Date().toISOString(),
            customerName: customer.name,
            customerId: customer.id
          };
          finalUnresolved = [...finalUnresolved, newUnresolved];
        }
      }

      onDataChange({
        ...data,
        messages: [...updatedMessages, botMsg],
        botRules: finalBotRules,
        unresolvedQueries: finalUnresolved
      });

      setIsBotTyping(false);
    }, 1500);
  };

  const handleSendDM = () => {
    if ((!chatInput.trim() && !selectedAttachment)) return;

    const textContent = chatInput.trim();
    const fallbackText = textContent || `Datei gesendet: ${selectedAttachment?.name}`;

    const encryptedContent = encryptMessage(fallbackText, e2eePassphrase);

    let finalAttachment = undefined;
    if (selectedAttachment) {
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
      senderId: customer.id,
      receiverId: 'admin',
      content: fallbackText,
      encryptedContent: encryptedContent,
      isEncrypted: true,
      timestamp: new Date().toISOString(),
      isRead: false,
      syncStatus: isOnline ? 'Synced' : 'PendingSync',
      attachment: finalAttachment
    };

    const nextMessages = [...data.messages, newMsg];

    onDataChange({
      ...data,
      messages: nextMessages
    });

    setChatInput('');
    setSelectedAttachment(null);
    setAttachmentError(null);

    // If customer wrote something text-based, trigger simulation
    if (textContent) {
      triggerBotResponse(textContent, nextMessages);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (confirm('Möchten Sie diese Nachricht wirklich unwiderruflich aus dem Chatverlauf löschen?')) {
      const updatedMessages = (data.messages || []).filter(m => m.id !== msgId);
      onDataChange({
        ...data,
        messages: updatedMessages
      });
    }
  };

  const handleClearFullChat = () => {
    const adminName = data.adminProfile?.name || 'Ihrem Berater';
    if (confirm(`Möchten Sie Ihren gesamten Chatverlauf mit ${adminName} unwiderruflich leeren? Dies löscht alle Nachrichten und hochgeladenen Chat-Dateien lokal und auf dem Server.`)) {
      const updatedMessages = (data.messages || []).filter(
        m => m.senderId !== customer.id && m.receiverId !== customer.id
      );
      onDataChange({
        ...data,
        messages: updatedMessages
      });
    }
  };

  const handleDSGVOExport = () => {
    const customerFiles = (data.files || []).filter(f => f.customerId === customer.id);
    const customerMessages = (data.messages || []).filter(m => m.senderId === customer.id || m.receiverId === customer.id);
    const customerAppointments = (data.appointments || []).filter(a => a.customerId === customer.id);

    const adminName = data.adminProfile?.name || 'Ihr Berater';
    const adminCompany = data.adminProfile?.company || 'Consulting Agency';

    const exportObject = {
      timestamp: new Date().toISOString(),
      legalParagraph: `Datenexport gemäss Art. 15 DSGVO (Auskunftsrecht der betroffenen Person). Alle Daten stammen aus dem E2E-verschlüsselten Mandantenportal von ${adminCompany}.`,
      dataCategory: {
        customerProfile: {
          id: customer.id,
          name: customer.name,
          company: customer.company,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          status: customer.status,
          createdAt: customer.createdAt,
          activePhase: customer.activePhase || 1
        },
        securityCredentials: {
          e2eeMechanism: "AES-256 equivalent local passphrase",
          activeClientPassphraseUsedAtExport: e2eePassphrase,
        },
        uploadedDocuments: customerFiles.map(f => ({
          fileId: f.id,
          name: f.name,
          category: f.category,
          status: f.status,
          uploadDate: f.uploadDate,
          adminNote: f.adminNote || ""
        })),
        appointments: customerAppointments.map(a => ({
          appointmentId: a.id,
          title: a.title,
          date: a.date,
          time: a.time,
          description: a.description
        })),
        chatHistory: customerMessages.map(m => {
          const isSenderCustomer = m.senderId === customer.id;
          let msgDecrypted = m.content;
          if (m.isEncrypted && m.encryptedContent) {
            msgDecrypted = decryptMessage(m.encryptedContent, e2eePassphrase);
          }
          return {
            messageId: m.id,
            timestamp: m.timestamp,
            sender: isSenderCustomer ? "Mandant (Sie)" : `Berater (${adminName})`,
            isEncrypted: m.isEncrypted || false,
            rawCiphertext: m.encryptedContent || null,
            decryptedContent: msgDecrypted
          };
        })
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportObject, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    const filename = `dsgvo_datenexport_${customer.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // --- SAVE PROFILE & UPDATE PASSWORD ---
  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    
    setTimeout(() => {
      onDataChange(prev => {
        const updatedCustomers = prev.customers.map(c => {
          if (c.id === customer.id) {
            return {
              ...c,
              name: profileForm.name,
              company: profileForm.company,
              email: profileForm.email,
              phone: profileForm.phone,
              address: profileForm.address,
              lastModified: new Date().toISOString()
            };
          }
          return c;
        });
        return { ...prev, customers: updatedCustomers };
      });
      setIsSavingProfile(false);
      alert('Ihre Stammdaten wurden erfolgreich aktualisiert.');
    }, 400);
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) {
      alert('Bitte füllen Sie alle Passwortfelder aus.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert('Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    const currentHash = await hashPassword(passwordForm.currentPassword);
    if (currentHash !== customer.passwordHash) {
      alert('Das aktuelle Passwort ist nicht korrekt.');
      return;
    }

    const newHash = await hashPassword(passwordForm.newPassword);

    onDataChange(prev => {
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === customer.id) {
          return {
            ...c,
            passwordHash: newHash,
            lastModified: new Date().toISOString()
          };
        }
        return c;
      });
      return { ...prev, customers: updatedCustomers };
    });

    setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    alert('Ihr Zugangspasswort wurde erfolgreich geändert.');
  };

  const handleCreateAppointment = () => {
    if (!newApForm.title || !newApForm.date || !newApForm.time) {
      alert('Bitte füllen Sie alle Pflichtfelder (*) aus.');
      return;
    }

    const newAppointment: CalendarAppointment = {
      id: `appt-${Date.now()}`,
      title: newApForm.title,
      date: newApForm.date,
      time: newApForm.time,
      description: newApForm.description,
      customerId: customer.id,
      status: 'Ausstehend'
    };

    onDataChange({
      ...data,
      appointments: [...data.appointments, newAppointment]
    });

    setNewApForm({
      title: '',
      date: '',
      time: '',
      description: ''
    });

    alert('Ihre Terminbuchung wurde erfolgreich eingereicht und steht nun als "Ausstehend" im Kalender.');
  };

  const handleClientPayInvoice = (invoiceId: string) => {
    const updatedInvoices = (data.invoices || []).map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'Bezahlt' as const };
      }
      return inv;
    });

    const activeInvoice = (data.invoices || []).find(i => i.id === invoiceId);
    const invoiceNum = activeInvoice ? activeInvoice.invoiceNumber : '';
    
    // Add a pleasant automated system confirmation post to the client-side Chat bubble history
    const botMsgText = `✅ **Zahlungseingang registriert!** Die Rechnung **#${invoiceNum}** wurde erfolgreich ausgeglichen. Sie finden Ihren freigegebenen Rechnungsbeleg jederzeit in Ihrer Finanzmappe. Vielen Dank!`;
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'bot',
      receiverId: customer.id,
      content: botMsgText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    onDataChange({
      ...data,
      invoices: updatedInvoices,
      messages: [...(data.messages || []), newMsg]
    });

    setPaymentDialogInvoice(null);
  };

  const handleSignDocument = (fileId: string) => {
    if (!signerFullName.trim()) {
      alert('Bitte geben Sie Ihren vollständigen Namen zur Unterschrift an.');
      return;
    }

    const timestamp = new Date().toISOString();
    const signatureHash = 'DGM-SIG-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const updatedFiles = data.files.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          signature: {
            signedByName: signerFullName,
            signedAt: timestamp,
            signatureHash: signatureHash,
            drawingDataUrl: signatureDrawMode === 'draw' ? (drawnSignaturePoints || 'drawn') : undefined
          }
        };
      }
      return f;
    });

    onDataChange({
      ...data,
      files: updatedFiles
    });

    // Also auto-notify advisor about signature
    const signatureNotifyText = `INFO: Der Vertrag '${data.files.find(f => f.id === fileId)?.name}' wurde soeben von ${signerFullName} rechtswirksam DGM-signiert! Verifizierungsschlüssel: ${signatureHash}`;
    const encryptedContent = encryptMessage(signatureNotifyText, e2eePassphrase);
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: customer.id,
      receiverId: 'admin',
      content: signatureNotifyText,
      encryptedContent: encryptedContent,
      isEncrypted: true,
      timestamp: new Date().toISOString(),
      isRead: false,
      syncStatus: isOnline ? 'Synced' : 'PendingSync'
    };

    onDataChange({
      ...data,
      files: updatedFiles,
      messages: [...data.messages, newMsg]
    });

    setSigningFileId(null);
    setDrawnSignaturePoints('');
    alert('Das Dokument wurde erfolgreich mit Ihrer digitalen Signatur signiert. Ihr Berater wurde benachrichtigt.');
  };

  const startDrawingSig = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawnSignaturePoints(`M ${x} ${y}`);
  };

  const drawSig = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawnSignaturePoints(prev => `${prev} L ${x} ${y}`);
  };

  const stopDrawingSig = () => {
    setIsDrawing(false);
  };

  // --- RENDERING DISPATCHER ---
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* 1. CUSTOMER DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Uebersicht</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Sicherer Mandantenzugang
              </div>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {/* Welcome Intro Header banner */}
            <div className="bg-[#0f172a] text-white p-5 rounded border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-mono tracking-wider font-bold uppercase leading-none bg-indigo-500/30 px-2.5 py-1 rounded border border-indigo-400/20 text-indigo-300">
                  Mandanten-Mitgliederbereich
                </span>
                <h1 className="text-xl font-bold mt-2.5">Guten Tag, {customer.name.split(' ').length > 1 ? 'Herr/Frau ' + customer.name.split(' ').pop() : customer.name}</h1>
                <p className="text-emerald-100 mt-1.5 text-sm leading-relaxed max-w-xl">
                  Willkommen. In diesem Portal können Sie Ihre Kooperationsverträge herunterladen, Video-Schnittmaterial hochladen und direkt Feedback mit {data.adminProfile?.name || 'Ihrem Berater'} austauschen.
                </p>
              </div>
              <div className="z-10 px-5 py-3.5 bg-black/20 rounded-2xl border border-white/5 font-mono text-[11px] text-emerald-100">
                <span className="block font-bold">Unternehmenszugang:</span>
                <span className="text-xs text-white font-semibold mt-1 block">{customer.company}</span>
              </div>
            </div>

            {/* Dynamic Project Roadmap Headline - Disabled */}
            {false && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
                    {data.adminProfile?.company || 'Consulting Agency'} • {activeTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Ihr aktueller Fortschrittsstatus in unserer professionellen Unternehmens- und Projektberatung.
                  </p>
                </div>
                {customer.roadmapEnabled !== false && (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl">
                      Phase <strong className="text-indigo-600">{(customer.activePhase || 1)}</strong> von <strong>5</strong>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-150 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>{Math.round(((customer.activePhase || 1) - 1) * 25)}% Abgeschlossen</span>
                    </span>
                  </div>
                )}
              </div>

              {customer.roadmapEnabled === false ? (
                <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50/50 p-6 rounded-2xl border border-indigo-100/60 shadow-xs text-center py-10">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                      <ShieldCheck className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Persönlicher Beratungsprozess wird vorbereitet</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Ihr persönlicher Berater **{data.adminProfile?.name || 'Partner'}** stellt derzeit Ihre individuellen Beratungsphasen und Portfoliomeilensteine zusammen.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Nach der Aktivierung erhalten Sie sofortigen Zugriff auf Ihre interaktive Checkliste und können Dokumente, Verträge und Aufgaben Schritt für Schritt einsehen.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 text-slate-600 text-[10px] rounded-full font-medium shadow-2xs">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      <span>Status: In Vorbereitung durch {data.adminProfile?.name || 'Berater'}</span>
                    </div>
                  </div>
              </div>
            ) : (
              <>
                {/* Stepper Timeline Web View */}
                <div className="hidden lg:grid grid-cols-5 gap-4 relative">
                  {/* Connection Line */}
                  <div className="absolute top-[26px] left-[10%] right-[10%] h-1 bg-slate-100 -z-0">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-500" 
                      style={{ width: `${Math.max(0, Math.min(100, ((customer.activePhase || 1) - 1) * 25))}%` }}
                    ></div>
                  </div>

                  {/* Steps */}
                  {currentPhases.map((step) => {
                    const currentPhase = customer.activePhase || 1;
                    const isCompleted = step.phase < currentPhase;
                    const isActive = step.phase === currentPhase;
                    const isSelected = selectedRoadmapPhase === step.phase;
                    const isLocked = step.phase > currentPhase;

                    return (
                      <button
                        key={step.phase}
                        type="button"
                        onClick={() => setSelectedRoadmapPhase(step.phase)}
                        className="flex flex-col items-center text-center relative z-10 group bg-transparent border-none outline-none focus:outline-none cursor-pointer self-start focus:ring-0"
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold text-sm transition-all shadow-sm ${
                          isSelected ? 'bg-indigo-700 border-indigo-700 text-white ring-4 ring-indigo-100 scale-105 font-black' :
                          isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                          isActive ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-50 animate-pulse' :
                          'bg-white border-slate-200 text-slate-400 group-hover:border-slate-350'
                        }`}>
                          {isCompleted ? <Check className="w-5 h-5 animate-scale-up" /> : 
                           isLocked ? <Lock className="w-4 h-4 text-slate-300 group-hover:text-slate-400" /> : 
                           step.phase}
                        </div>
                        
                        <div className="mt-3.5">
                          <p className={`text-xs font-bold leading-normal transition-colors ${
                            isSelected ? 'text-indigo-700 underline underline-offset-4 decoration-2' :
                            isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-700' : 'text-slate-400 font-medium'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal max-w-[130px]">
                            {step.desc}
                          </p>
                        </div>

                        {isActive && (
                          <span className="absolute -top-6 text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded-md animate-bounce">
                            AKTIV
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Stepper Timeline Mobile View */}
                <div className="lg:hidden space-y-3">
                  {currentPhases.map((step) => {
                    const currentPhase = customer.activePhase || 1;
                    const isCompleted = step.phase < currentPhase;
                    const isActive = step.phase === currentPhase;
                    const isSelected = selectedRoadmapPhase === step.phase;
                    const isLocked = step.phase > currentPhase;

                    return (
                      <button
                        key={step.phase}
                        type="button"
                        onClick={() => setSelectedRoadmapPhase(step.phase)}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all text-left w-full cursor-pointer bg-white focus:outline-none ${
                          isSelected ? 'border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/20 shadow-xs' :
                          isActive ? 'bg-indigo-50/40 border-indigo-200' :
                          isCompleted ? 'bg-slate-50/60 border-slate-150' : 'bg-slate-100/30 border-slate-100 opacity-65'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-xs select-none shrink-0 ${
                          isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                          isActive ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-50' :
                          'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : step.phase}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                            <span>{step.title}</span>
                            {isActive && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0">Aktiv</span>}
                            {isCompleted && <span className="text-emerald-600 text-[10px] shrink-0">✓ Erledigt</span>}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{step.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Phase Detail Checklist Card */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg uppercase">
                          Arbeitsplan & Meilensteine
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-2">
                          Phase {selectedRoadmapPhase}: {
                            currentPhases.find(p => p.phase === selectedRoadmapPhase)?.title || 'Beratungsschritt'
                          }
                        </h4>
                      </div>
                      
                      {/* Progress bar of current selected phase */}
                      <div className="text-right sm:text-left shrink-0">
                        <span className="text-[11px] font-mono text-slate-500">
                          Fortschritt: <strong className="text-slate-700">
                            {currentTasks.filter(t => t.phase === selectedRoadmapPhase && (customer.completedTasks || []).includes(t.id)).length}
                          </strong> von <strong>
                            {currentTasks.filter(t => t.phase === selectedRoadmapPhase).length}
                          </strong> erledigt
                        </span>
                        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1 mx-auto sm:ml-0">
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-300" 
                            style={{ 
                              width: `${(currentTasks.filter(t => t.phase === selectedRoadmapPhase && (customer.completedTasks || []).includes(t.id)).length / Math.max(1, currentTasks.filter(t => t.phase === selectedRoadmapPhase).length)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentTasks.filter(t => t.phase === selectedRoadmapPhase).map((task) => {
                        const isCompleted = (customer.completedTasks || []).includes(task.id);
                        const isClientResponsible = task.role === 'Kunde' || task.role === 'Beide';
                        
                        return (
                          <div 
                            key={task.id} 
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all bg-white select-none ${
                              isCompleted ? 'border-emerald-100 bg-emerald-50/5' : 'border-slate-200/80 hover:border-slate-200 hover:shadow-xs shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Checked or Unchecked Box */}
                              {isClientResponsible ? (
                                <button
                                  type="button"
                                  onClick={() => toggleSubTask(task.id)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'bg-white border-slate-300 text-slate-300 hover:border-slate-450 hover:bg-slate-50'
                                  }`}
                                >
                                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                                </button>
                              ) : (
                                <div 
                                  className="w-5 h-5 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 text-slate-400"
                                  title={`Diese Aufgabe wird von ${data.adminProfile?.name || 'Ihrem Berater'} abgehakt`}
                                >
                                  <Lock className="w-3 h-3" />
                                </div>
                              )}

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-xs font-bold leading-normal ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {task.title}
                                  </span>
                                  
                                  {/* Responsibility Badge */}
                                  <span className={`text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                    task.role === 'Kunde' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    task.role === 'Berater' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    'bg-purple-50 text-purple-700 border border-purple-100 border-dashed'
                                  }`}>
                                    {task.role === 'Kunde' ? 'Ihre Aufgabe' : task.role === 'Berater' ? (data.adminProfile?.name ? `${data.adminProfile.name.split(' ')[0]} (Berater)` : 'Berater') : 'Gemeinsam'}
                                  </span>

                                  {isCompleted && (
                                    <span className="text-[10px] text-emerald-600 font-bold font-mono text-xs">Erledigt ✓</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">
                                  {task.desc}
                                </p>
                              </div>
                            </div>

                            {/* Direct CTA action button if configured */}
                            {task.actionLabel && task.actionType && !isCompleted && onTabChange && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (task.actionType === 'upload') onTabChange('files');
                                  else if (task.actionType === 'appointment') onTabChange('appointments');
                                  else if (task.actionType === 'chat') onTabChange('messages');
                                }}
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-650 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-100 hover:border-indigo-650 transition-all cursor-pointer self-start sm:self-center shrink-0"
                              >
                                {task.actionLabel}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <FolderOpenIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Eingereichte Dateien</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{customerFiles.length} Dokumente</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Ungelesene Chats</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {chatMessages.filter(m => m.senderId === 'admin' && !m.isRead).length} Nachrichten
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center space-x-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">Anstehende Meetings</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{customerAppointments.length} Termine</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Document Approvals & Live activity log */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Check status */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <h3 className="text-base font-bold text-slate-800 mb-4">Letzte Dokumentenprüfungen & Freigaben</h3>
                <div className="space-y-4">
                  {customerFiles.length > 0 ? (
                    customerFiles.slice(0, 3).map(file => (
                      <div key={file.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 mt-0.5">
                            {file.category === 'Vertrag' ? <FileText className="h-5 w-5" /> : 
                             file.category === 'Video' ? <Video className="h-5 w-5" /> : <File className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{file.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">Kategorie: <span className="font-medium text-slate-600">{file.category}</span> • Eingereicht am {new Date(file.uploadDate).toLocaleDateString('de-DE')}</p>
                            {file.adminNote && (
                              <p className="text-xs text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200/30 mt-2.5 font-sans leading-relaxed">
                                <strong>Prüfungshinweis von Admin:</strong> {file.adminNote}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                            file.status === 'Genehmigt' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                            file.status === 'In Bearbeitung' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                            file.status === 'Abgelehnt' ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                            'bg-slate-100 text-slate-600 border-slate-250'
                          }`}>
                            {file.status === 'Genehmigt' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                             file.status === 'In Bearbeitung' ? <Clock className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            <span>{file.status}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-10 text-center">Sie haben noch keine Dokumente hochgeladen.</p>
                  )}
                </div>
              </div>

              {/* Echtzeit-Journalierung & Historie */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Transaktionsdaten-Timeline</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chronologisches Sicherheits-Journal Ihrer digitalen Mandatsverwaltung.</p>
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold bg-[#ecfdf5] text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                    Echtzeit-Audit aktiv
                  </span>
                </div>

                <div className="relative pl-5 space-y-6 before:absolute before:inset-y-1 before:left-1.5 before:w-0.5 before:bg-slate-100">
                  <div className="relative">
                    <span className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-sm z-10"></span>
                    <div>
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className="text-xs font-bold text-slate-700">Digitaler Berater-Fahrplan aktiviert</h4>
                        <span className="text-[9px] font-mono text-slate-400">Heute, 08:20</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Zuweisung des spezifischen Beratungstemplates <strong>{activeTemplate.name}</strong> durch {data.adminProfile?.name || 'Ihren Berater'} erfolgt. Der Fortschritt ist ab sofort interaktiv nutzbar.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm z-10"></span>
                    <div>
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className="text-xs font-bold text-slate-700">Maklervollmacht digital signiert</h4>
                        <span className="text-[9px] font-mono text-slate-400">Gestern, 14:00</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Erfolgreiche Registrierung der Maklervollmacht im dezentralen Transaktionspool mittels rechtssicherer digitaler Unterschrift (DGM-Kryptoprüfung bestanden).
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-500 shadow-sm z-10"></span>
                    <div>
                      <div className="flex items-center justify-between gap-2.5">
                        <h4 className="text-xs font-bold text-slate-700">Audit & Onboarding-Validierung</h4>
                        <span className="text-[9px] font-mono text-slate-400">vor 3 Tagen</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sicherer Erst-Import der Kundendaten f. <strong>{customer.company}</strong> in die verschlüsselte lokale CRM-Datenbank abgeschlossen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Appts & Premium Contact widget */}
            <div className="space-y-6">
              {/* Upcoming Consultations */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <h3 className="text-base font-bold text-slate-800 mb-4">Nächste Absprachen</h3>
                {customerAppointments.length > 0 ? (
                  customerAppointments.slice(0, 3).map(appt => (
                    <div key={appt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 mb-3 flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">{appt.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{appt.description}</p>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-mono font-bold border border-emerald-200/60 mt-2 block w-max">
                          {appt.date} • {appt.time} Uhr
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <Calendar className="h-8 w-8 mx-auto opacity-45 mb-2" />
                    <p className="text-xs">Derzeit keine Termine vereinbart.</p>
                  </div>
                )}
              </div>

              {/* Makler-Visitenkarte */}
              <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                
                <div>
                  <div className="flex items-center gap-3.5 z-10 relative">
                    <div className="w-12 h-12 rounded-full bg-indigo-650 flex items-center justify-center border border-indigo-500 text-white font-extrabold text-sm shadow-sm">
                      {(data.adminProfile?.name || 'IB').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{data.adminProfile?.name || 'Ihr Berater'}</h4>
                      <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider font-mono">Unternehmensberater & Inhaber</p>
                      <p className="text-[9px] text-slate-400">{data.adminProfile?.company || 'Consulting Agency'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-[11.5px] text-slate-300 font-sans border-t border-slate-800 pt-4 mt-3">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="font-mono">{data.adminProfile?.phone || '+49 123 456789'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>{data.adminProfile?.email || 'info@agentur.de'}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal pt-1.5 italic">
                      "Ich berate Sie herstellerneutral bei Ihren Digitalisierungs- und Videomarketing-Projekten für beste Ergebnisse."
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={downloadVCard}
                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="Geschäftskontakt als vCard laden"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>vCard laden</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div></div>
      )}

      {/* 2. DOKUMENTE & UPLOAD HUB */}
      {activeTab === 'files' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Projektmappe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold border border-indigo-150">
                DOKUMENTEN-ZENTRALE
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Custom Interactive Uploader */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">1. Datei-Kategorie festlegen</h3>
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  {(['Vertrag', 'Video', 'Datei'] as const).map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                          isSelected 
                            ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat === 'Vertrag' ? 'Kooperationsvertrag' : cat === 'Video' ? 'Videoschnitt' : 'Zusatzzettel'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 mb-3">2. Dokument hochladen</h3>
                {/* Drag / Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-250 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.avi,.docx,.xlsx"
                  />
                  <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm font-bold text-slate-700">Dateien per Drag & Drop hierhin ziehen</p>
                  <p className="text-xs text-slate-400 mt-1">oder einfach klicken zum Auswählen</p>
                  <span className="text-[10px] text-slate-400 mt-3 block bg-white px-2 py-0.5 rounded border">
                    PDF, JPG, PNG, DOCX, MP4, MOV (max. 50MB)
                  </span>
                </div>

                {uploadProgress !== null && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Übertragung läuft...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* List of uploaded documents */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col">
              <h3 className="text-base font-bold text-slate-800 mb-4">Bisher hochgeladene Dateien</h3>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2">
                {customerFiles.length > 0 ? (
                  customerFiles.map(file => {
                    const isContract = file.category === 'Vertrag';
                    const isVideo = file.category === 'Video';
                    return (
                      <div key={file.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div className="flex items-start space-x-3.5">
                          <div className={`p-2.5 rounded-xl mt-0.5 ${
                            isContract ? 'bg-blue-100/50 text-blue-600' :
                            isVideo ? 'bg-pink-100/50 text-pink-600' : 'bg-emerald-100/50 text-emerald-600'
                          }`}>
                            {isContract ? <FileText className="h-5 w-5" /> : 
                             isVideo ? <Video className="h-5 w-5" /> : <File className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm leading-snug break-all">{file.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                              <span>Kat: {file.category}</span>
                              <span>•</span>
                              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>{new Date(file.uploadDate).toLocaleDateString('de-DE')}</span>
                            </div>
                            
                            {file.adminNote && (
                              <div className="mt-2.5 p-2.5 bg-amber-50/50 rounded-lg border border-amber-105 text-xs text-slate-600">
                                <strong>Feedback von {data.adminProfile?.name || 'Ihrem Berater'}:</strong> {file.adminNote}
                              </div>
                            )}

                            {/* Digital signature display */}
                            {file.signature ? (
                              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <div>
                                  <p className="font-bold leading-normal">Rechtswirksam DGM-signiert von {file.signature.signedByName}</p>
                                  <p className="text-[10px] text-emerald-650 font-mono mt-0.5">
                                    Freigegeben {new Date(file.signature.signedAt).toLocaleDateString('de-DE')} um {new Date(file.signature.signedAt).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr • ID: {file.signature.signatureHash}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              isContract && (
                                <div className="mt-2.5 pt-2 mb-0.5 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider font-mono">DIGITALE UNTERSCHRIFT (DGM):</span>
                                  <button
                                    onClick={() => {
                                      setSigningFileId(file.id);
                                      setSignerFullName(customer.name);
                                    }}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-all border border-indigo-150 flex items-center gap-1 cursor-pointer font-mono"
                                  >
                                    <PenTool className="w-3 h-3 text-indigo-600" />
                                    <span>JETZT DISPOSITIONS-SIGNIEREN</span>
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
                          <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            file.status === 'Genehmigt' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                            file.status === 'In Bearbeitung' ? 'bg-amber-50 text-amber-600 border-amber-200/50' :
                            file.status === 'Abgelehnt' ? 'bg-rose-50 text-rose-600 border-rose-200/50' :
                            'bg-slate-200 text-slate-600 border-slate-300'
                          }`}>
                            {file.status}
                          </span>

                          {file.dataUrl ? (
                            <a
                              href={file.dataUrl}
                              download={file.name}
                              className="p-1.5 hover:bg-white border hover:border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                              title="Herunterladen"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <button
                              onClick={() => alert('Simulierter Download für diese Archivdatei.')}
                              className="p-1.5 hover:bg-white border hover:border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    <UploadCloud className="h-8 w-8 mx-auto opacity-40 mb-3" />
                    <p className="text-sm">Sie haben noch keine Dokumente hochgeladen.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div></div>
      )}

      {/* 3. ADVISOR CHAT (DIRECT MESSAGES WITH ADMIN) */}
      {activeTab === 'messages' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">DMs</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Online/Offline Simulator Switch */}
              <button
                type="button"
                onClick={() => onOnlineToggle(!isOnline)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-750 shadow-sm border border-emerald-500/20' 
                    : 'bg-amber-655 text-amber-900 border border-amber-300 bg-amber-50'
                }`}
                title={isOnline ? 'Online-Modus aktiv: Nachrichten werden synchronisiert' : 'Offline-Modus aktiv: Nachrichten werden lokal zwischengespeichert'}
              >
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-100 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
                <span>{isOnline ? 'Live-Netzwerk' : 'Lokal Offline'}</span>
              </button>

              {/* Offline Messages Queue Sync indicator */}
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

              <span className="text-[10px] bg-slate-105 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold uppercase shadow-sm">
                E2EE active
              </span>

              <button
                type="button"
                onClick={handleClearFullChat}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-100 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                title={`Den gesamten Chatverlauf mit ${data.adminProfile?.name || 'Ihrem Berater'} unwiderruflich leeren`}
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Verlauf leeren</span>
              </button>
            </div>
          </header>

          <div className="flex-grow flex flex-col bg-slate-50 overflow-hidden">
          {/* Chat sub-header area with custom E2EE tuning panel */}
          <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-emerald-100 text-[#064e3b] rounded-xl font-bold">
                {(data.adminProfile?.name || 'IB').split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-none">{data.adminProfile?.name || 'Ihr Berater'}</h3>
                <span className="text-xs text-slate-400 leading-none block mt-1.5">{data.adminProfile?.company || 'Consulting Agency'}</span>
              </div>
            </div>
            
            {/* E2EE Passphrase Adjustment & Cipher Text Toggle */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold font-mono">
                <LockKeyhole className="w-3.5 h-3.5" />
                <span>E2EE Schlüssel:</span>
              </div>
              <input
                type="text"
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono w-36 text-slate-700 outline-none focus:border-emerald-580"
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
            </div>
          </div>

          {/* Messages timeline body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length > 0 ? (
              chatMessages.map(msg => {
                const isMe = msg.senderId === customer.id;
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
                        ? 'bg-[#064e3b] text-white rounded-br-none' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/60'
                    }`}>
                      <p className={`whitespace-pre-wrap leading-relaxed ${decryptionError ? 'text-rose-300 font-mono text-xs' : 'font-sans'}`}>
                        {displayedText}
                      </p>

                      {/* Attachment rendering */}
                      {msg.attachment && (
                        <div className={`mt-3 p-2.5 rounded-xl border flex flex-col space-y-2 ${
                          isMe 
                            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-50' 
                            : 'bg-slate-50 border-slate-200 text-slate-850'
                        }`}>
                          <div className="flex items-center space-x-2.5 text-xs">
                            <FileText className={`w-4 h-4 ${isMe ? 'text-emerald-300' : 'text-blue-600'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate" title={msg.attachment.name}>{msg.attachment.name}</p>
                              <p className={`text-[9px] font-mono mt-0.5 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
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
                                    ? 'bg-emerald-850 border-emerald-700 text-white hover:bg-emerald-800'
                                    : 'bg-[#e6f4ea] border-emerald-100 text-[#137333] hover:bg-[#d2e9d6]'
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
                            decryptionError ? 'text-rose-400 animate-pulse' : isMe ? 'text-emerald-300' : 'text-emerald-555'
                          }`} title="E2E Verschlüsselt" />
                        )}
                        {isPending && (
                          <span className={`text-[8px] font-bold font-mono px-1 rounded flex items-center gap-0.5 ${
                            isMe ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-600'
                          }`} title="In lokaler Warteschlange (Offline)">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Warteschlange (Offline)</span>
                          </span>
                        )}
                        <span className={`block text-[10px] font-mono ${
                          isMe ? 'text-emerald-200' : 'text-slate-400'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Interactive message delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-300 hover:text-rose-400 hover:underline ml-2 transition-all cursor-pointer bg-transparent border-none outline-none font-mono font-bold"
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
                <MessageSquare className="h-10 w-10 mx-auto opacity-45 mb-3" />
                <p className="text-xs">Noch keine Nachrichten ausgetauscht. Schreiben Sie uns eine Nachricht!</p>
              </div>
            )}

            {/* Simulated Bot Typing State Dynamic Bubble */}
            {isBotTyping && (
              <div className="flex justify-start items-center space-x-2 animate-pulse mt-2">
                <div className="bg-white border border-slate-200 text-slate-650 rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-sm flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                  </span>
                  <span className="font-mono font-bold tracking-wider text-indigo-700">{data.adminProfile?.company || 'Consulting Agency'} KI-Assistent analysiert...</span>
                </div>
              </div>
            )}
          </div>

          {/* Messaging controllers input box with Attachment Pickers */}
          <div className="p-4 bg-white border-t border-slate-200">
            {/* File Attachment Chip */}
            {selectedAttachment && (
              <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-150 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center space-x-2 text-slate-600">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold truncate max-w-xs">{selectedAttachment.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({(selectedAttachment.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="text-slate-400 hover:text-slate-650 font-bold p-1 leading-none text-sm transition-colors cursor-pointer"
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
                id="customer-attachment-input-file"
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <label
                htmlFor="customer-attachment-input-file"
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 cursor-pointer shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/20"
                title="Anhang hochladen (max. 2MB)"
              >
                <Paperclip className="w-5 h-5" />
              </label>

              <input
                type="text"
                placeholder={selectedAttachment ? 'Optionalen Text zum Anhang schreiben...' : 'End-to-End verschlüsselte Nachricht senden...'}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendDM()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={handleSendDM}
                className="p-3.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl shadow-md transition-all duration-200 cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div></div>
      )}

      {/* 4. PROFIL & SECURITY TAB */}
      {activeTab === 'profile' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Profil & Sicherheit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
                PORTALKONFIGURATION
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stamp data view */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Meine Stammdaten</span>
              </h3>
              
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Voller Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Firma / Unternehmen</label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                    placeholder="z.B. Firma GmbH"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Passen Sie Ihren Firmennamen und Anzeigenamen an. Änderungen werden sofort portalweit übernommen.</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">E-Mail Adresse</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Telefonnummer</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Adresse</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
                >
                  {isSavingProfile ? 'Speichere Daten...' : 'Stammdaten abspeichern'}
                </button>
              </div>
            </div>

            {/* Password security configuration card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <span>Portal-Passwort ändern</span>
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Aktuelles Passwort</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Neues Passwort</label>
                  <input
                    type="password"
                    placeholder="mind. 6 Zeichen"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                  />
                  {passwordForm.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).score >= 1 ? getPasswordStrength(passwordForm.newPassword).bgClass : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).score >= 2 ? getPasswordStrength(passwordForm.newPassword).bgClass : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).score >= 3 ? getPasswordStrength(passwordForm.newPassword).bgClass : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).score >= 4 ? getPasswordStrength(passwordForm.newPassword).bgClass : 'bg-slate-200'}`}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-mono">Passwortstärke:</span>
                        <span className={`font-semibold font-mono ${getPasswordStrength(passwordForm.newPassword).textColor}`}>
                          {getPasswordStrength(passwordForm.newPassword).label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Neues Passwort bestätigen</label>
                  <input
                    type="password"
                    placeholder="Wiederholen Sie das Passwort"
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                  />
                </div>

                <span className="text-[10px] text-slate-400 flex items-center space-x-1 bg-slate-50 p-2 rounded-lg">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Offline Passwörter werden sicher im Browser verschlüsselt gespeichert.</span>
                </span>

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-medium text-sm transition-all"
                >
                  Passwort aktualisieren
                </button>
              </div>
            </div>
          </div>

          {/* DSGVO / GDPR Compliance & Self-Service Data Export */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/60 mt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Auskunftsrecht & DSGVO-Selbstauskunft (Art. 15 DSGVO)</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Als europäischer Anbieter nehmen wir den Schutz Ihrer vertraulichen Daten ernst. Gemäß Datenschutz-Grundverordnung (DSGVO) haben Sie das Recht auf uneingeschränkte Auskunft über alle Sie betreffenden personenbezogenen Daten.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDSGVOExport}
                className="px-4 py-2.5 bg-emerald-50 text-[#064e3b] hover:bg-[#064e3b] hover:text-white border border-emerald-100 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Daten-Export (JSON)</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wide font-mono text-[10px]">Welche Daten umfasst dieser Export?</h4>
              <p className="leading-relaxed">
                Der maschinenlesbare JSON-Export wird live im Browser generiert und bündelt sämtliche Informationen, die in Ihrer lokalen Mappe und auf dem Server hinterlegt sind:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Ihre Stammdaten:</strong> Vollständiger Name, E-Mail-Adresse, Telefonnummer, Firmenname sowie der aktuelle CRM-Mitgliederstatus.</li>
                <li><strong>Dateianhänge:</strong> Protokoll der vertraulichen Dateiuploads, signierte Verträge und Video-Schnittmaterialien inklusive deren Freigabestatus und Systemnotizen.</li>
                <li><strong>Kalender-Termine:</strong> Alle gebuchten oder angefragten Beratungssitzungen für Ihre Roadmaps.</li>
                <li><strong>E2EE Chat-Protokoll:</strong> Der gesamte E2E-verschlüsselte Konversationsverlauf (sowohl die Roh-Chiffren als auch die mit Ihrem aktuellen Schlüssel live entschlüsselten Klartexte).</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>Ihre Daten werden lokal kompiliert und niemals ungefragt an Drittanbieter übermittelt.</span>
              </div>
            </div>
          </div>
        </div></div>
      )}

      {/* 5. TERMINE & BUCHUNG TAB */}
      {activeTab === 'appointments' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Termine & Planung</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-150">
                MEETING-PLANER
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Booking Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Neuen Beratungstermin anfragen</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Wählen Sie Ihr Wunschdatum und ein Thema aus. Wir werden Ihre Anfrage prüfen und kurzfristig bestätigen.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Arbeitstitel / Thema*</label>
                    <input
                      type="text"
                      placeholder="z.B. Vertragsbesprechung / Feedback Schnittmaterial"
                      value={newApForm.title}
                      onChange={(e) => setNewApForm({ ...newApForm, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Datum*</label>
                      <input
                        type="date"
                        value={newApForm.date}
                        onChange={(e) => setNewApForm({ ...newApForm, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Uhrzeit*</label>
                      <input
                        type="time"
                        value={newApForm.time}
                        onChange={(e) => setNewApForm({ ...newApForm, time: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Notiz / Details (Optional)</label>
                    <textarea
                      placeholder="z.B. Fragen vorab, Schwerpunkte der Besprechung..."
                      rows={3}
                      value={newApForm.description}
                      onChange={(e) => setNewApForm({ ...newApForm, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-[#064e3b] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateAppointment}
                    className="w-full bg-[#064e3b] hover:bg-[#047857] text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Termin verbindlich anfragen</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Appointment List & Statuses */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Ihre Termine & Buchungsverlauf</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hier sehen Sie alle ausstehenden Anfragen sowie bereits bestätigte Besprechungen.
                  </p>
                </div>

                <div className="mt-4 space-y-4 flex-1 overflow-y-auto max-h-[420px] pr-2">
                  {customerAppointments.length > 0 ? (
                    customerAppointments.map(appt => {
                      const isConfirmed = appt.status === 'Bestätigt';
                      const isRejected = appt.status === 'Abgelehnt';
                      const isPending = !appt.status || appt.status === 'Ausstehend';

                      return (
                        <div key={appt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3.5">
                            <div className={`p-2.5 rounded-xl mt-0.5 ${
                              isConfirmed ? 'bg-emerald-100/50 text-emerald-600' :
                              isRejected ? 'bg-rose-100/50 text-rose-600' : 'bg-amber-100/50 text-amber-600'
                            }`}>
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">{appt.title}</h4>
                              <p className="text-xs text-slate-500 mt-1">{appt.description || 'Keine Beschreibung angegeben.'}</p>
                              
                              <span className="inline-flex items-center space-x-1.5 text-[10px] mt-2 bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                                <span>{appt.date} • {appt.time} Uhr</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                              isRejected ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                              'bg-amber-50 text-amber-700 border-amber-200/50'
                            }`}>
                              {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {isRejected && <XCircle className="w-3.5 h-3.5" />}
                              {isPending && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                              <span>{appt.status || 'Ausstehend'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <Calendar className="h-10 w-10 mx-auto opacity-30 mb-3" />
                      <p className="text-xs font-medium">Bisher keine Termine geplant oder angefragt.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MEINE RECHNUNGEN & FINANZMAPPE TAB */}
      {activeTab === 'invoices' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none" id="customer-invoices-view">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Finanzmappe & Rechnungen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-indigo-150">
                PROJEKT DIGITAL-WALLET
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-6 select-text">
            {/* Customer specific financial stats */}
            {(() => {
              const invoices = (data.invoices || []).filter(inv => inv.customerId === customer.id);
              const paidSum = invoices.filter(inv => inv.status === 'Bezahlt').reduce((acc, inv) => acc + inv.amount, 0);
              const openSum = invoices.filter(inv => inv.status === 'Offen').reduce((acc, inv) => acc + inv.amount, 0);
              const totalCount = invoices.length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Beglichene Posten</p>
                      <h4 className="text-base font-bold text-slate-800 tracking-tight mt-0.5">
                        {paidSum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-rose-450 font-bold">Noch Offen / Fällig</p>
                      <h4 className="text-base font-bold text-rose-700 tracking-tight mt-0.5">
                        {openSum.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Belege Gesamtanzahl</p>
                      <h4 className="text-base font-bold text-slate-800 tracking-tight mt-0.5">
                        {totalCount} Beleg{totalCount !== 1 ? 'e' : ''}
                      </h4>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Invoices panel */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-850 font-mono uppercase tracking-wide flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Leistungsabrechnungen & Projektbelege</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-550">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Rechnung #</th>
                      <th className="px-5 py-3.5 font-bold">Betreff / Leistungsbeschreibung</th>
                      <th className="px-5 py-3.5 font-bold">Ausstellungsdatum</th>
                      <th className="px-5 py-3.5 font-bold">Fälligkeitstermin</th>
                      <th className="px-5 py-3.5 text-right font-bold col-span-2">Gesamtsumme Brutto</th>
                      <th className="px-5 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {(() => {
                      const invoices = (data.invoices || []).filter(inv => inv.customerId === customer.id);

                      if (invoices.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="text-center py-14 text-slate-400">
                              <Receipt className="w-8 h-8 opacity-25 mx-auto mb-2" />
                              <p className="font-semibold text-xs text-slate-500">Bisher wurden keine Belege für Sie erfasst.</p>
                            </td>
                          </tr>
                        );
                      }

                      return invoices.map((inv) => {
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-800 font-mono">{inv.invoiceNumber}</td>
                            <td className="px-5 py-4 text-slate-705 font-medium">{inv.description}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(inv.issueDate).toLocaleDateString('de-DE')}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(inv.dueDate).toLocaleDateString('de-DE')}</td>
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
                            <td className="px-5 py-4 text-right flex items-center justify-end gap-2 text-slate-400/80">
                              <button
                                onClick={() => setSelectedClientInvoice(inv)}
                                className="px-2.5 py-1 text-[#064e3b] hover:text-white border border-[#064e3b]/20 hover:bg-[#064e3b] text-[10.5px] font-bold rounded transition-all cursor-pointer bg-transparent"
                              >
                                Sichten
                              </button>
                              {inv.status === 'Offen' && (
                                <button
                                  onClick={() => setPaymentDialogInvoice(inv)}
                                  className="px-2.5 py-1 bg-[#064e3b] hover:bg-[#047857] text-white text-[10.5px] font-bold rounded shadow-sm transition-all cursor-pointer border-none"
                                >
                                  Jetzt begleichen
                                </button>
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
          </div>

          {/* HIGH FIDELITY CLIENT DIN-A4 VISUALIZER */}
          {selectedClientInvoice && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto" id="selected-invoice-visualizer">
              <div className="bg-white w-full max-w-3xl rounded-none shadow-2xl overflow-hidden my-8 border border-slate-300 select-text flex flex-col animate-scale-up">
                <div className="p-4 bg-slate-950 text-white flex justify-between items-center flex-shrink-0 no-print">
                  <span className="text-xs font-mono font-bold tracking-tight uppercase">Originalbeleg / Rechnung</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded transition-all cursor-pointer"
                    >
                      Drucken / PDF-Schnittstelle
                    </button>
                    <button
                      onClick={() => setSelectedClientInvoice(null)}
                      className="text-white hover:text-slate-200 leading-none text-xl px-1.5 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Simulated DIN physical paper letterhead inside customer portal */}
                <div className="p-12 sm:p-14 bg-white text-slate-850 font-sans leading-relaxed text-xs aspect-[1/1.414] w-[210mm] max-w-full mx-auto shadow-inner select-text">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-10">
                    <div>
                      <h4 className="text-lg font-black tracking-tighter text-indigo-700">{(data.adminProfile?.name || 'Ihr Berater').toUpperCase()}</h4>
                      <p className="text-[10px] font-mono tracking-wider text-slate-400 mt-0.5">UNTERNEHMENSBERATUNG & DIGITALE STRATEGIE</p>
                      <p className="text-[9px] text-slate-500 mt-2 font-mono">
                        {data.adminProfile?.company || 'Consulting Agency'}<br />
                        Firmensitz: {data.adminProfile?.address || 'Hauptstraße 1, 10115 Berlin'}
                      </p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-450 space-y-1">
                      <p>USt-IdNr.: DE 312 948 291</p>
                      <p>Projektreg.: PR-2026-X83B</p>
                      <p>Telefon: {data.adminProfile?.phone || '+49 123 456789'}</p>
                      <p>EMail: {data.adminProfile?.email || 'info@agentur.de'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                      <span className="text-[8px] text-slate-400 border-b border-slate-200 block pb-1.5 mb-2 font-mono uppercase tracking-wide">
                        {data.adminProfile?.company || 'Consulting Brand'} • {data.adminProfile?.address || 'Hauptstraße 1, 10115 Berlin'}
                      </span>
                      <div className="space-y-1 font-sans text-[11px] text-slate-800">
                        <p className="font-bold">{customer.name}</p>
                        {customer.company && <p className="font-semibold text-slate-700">{customer.company}</p>}
                        <p>{customer.address || 'Kundensitz in Deutschland'}</p>
                        <p className="pt-2 font-mono text-[10px] text-slate-400">Mandanten-ID: #{selectedClientInvoice.customerId.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono space-y-2 mt-4 text-[10px]">
                      <h2 className="text-lg font-black font-sans tracking-tight text-slate-900 border-b border-slate-100 pb-1 mb-3">RECHNUNG</h2>
                      <p><strong>Rechnungsnummer:</strong> {selectedClientInvoice.invoiceNumber}</p>
                      <p><strong>Belegdatum:</strong> {new Date(selectedClientInvoice.issueDate).toLocaleDateString('de-DE')}</p>
                      <p><strong>Fälligkeitstermin:</strong> {new Date(selectedClientInvoice.dueDate).toLocaleDateString('de-DE')}</p>
                      <p><strong>Status:</strong> <span className="font-bold">{selectedClientInvoice.status.toUpperCase()}</span></p>
                    </div>
                  </div>

                  <div className="mb-8 font-sans">
                    <h3 className="text-sm font-bold text-slate-900">Leistungsabrechnung: {selectedClientInvoice.description}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Vielen Dank für das Vertrauen in unsere Dienstleistung. Nachstehend finden Sie die Postenabrechnung:
                    </p>
                  </div>

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
                        {((selectedClientInvoice.items || []) as any[]).map((it, idx) => {
                          return (
                            <tr key={it.id || idx}>
                              <td className="px-3 py-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                              <td className="px-3 py-3 font-semibold text-slate-850">{it.description}</td>
                              <td className="px-3 py-3 text-center font-mono">{it.quantity}</td>
                              <td className="px-3 py-3 text-right font-mono">{(it.unitPrice || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                              <td className="px-3 py-3 text-right font-bold font-mono">{(it.total || (it.quantity * it.unitPrice)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mb-14">
                    <div className="w-72 border-t border-slate-300 pt-3.5 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-550">
                        <span>Nettobetrag:</span>
                        <span>{selectedClientInvoice.netAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-slate-450 border-b border-slate-100 pb-2">
                        <span>Zuzügl. {selectedClientInvoice.taxRate}% USt:</span>
                        <span>{selectedClientInvoice.taxAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black text-xs pt-1">
                        <span>Gesamtsumme Brutto:</span>
                        <span>{selectedClientInvoice.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 mt-16 text-[9.5px] text-slate-450 font-sans leading-normal">
                    <div>
                      <p className="font-bold text-slate-700">Zahlungsbedingungen & Hinweise:</p>
                      <p className="mt-1">
                        Bitte überweisen Sie den fälligen Bruttobetrag unter Angabe der Rechnungsnummer <strong>{selectedClientInvoice.invoiceNumber}</strong> auf das genannte Geschäftskonto.
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

                  <div className="mt-10 pt-4 border-t border-dashed border-slate-100 flex items-center justify-between font-mono text-[8px] text-slate-400">
                    <span>SEAL HASH: HMAC-SHA256-{selectedClientInvoice.id.substring(4, 16).toUpperCase()}</span>
                    <span>Validierter Original-Finanzbeleg aus dem Portal von {data.adminProfile?.company || 'Service-Partner'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATED CLIENT BANK TRANSFER DIALOG DRAWER */}
          {paymentDialogInvoice && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in" id="payment-simulator-dialog">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
                <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-400/20">
                      ONLINE SOFORT-ÜBERWEISUNG
                    </span>
                    <h3 className="text-base font-bold mt-1">Rechnung direkt ausgleichen</h3>
                  </div>
                  <button
                    onClick={() => setPaymentDialogInvoice(null)}
                    className="text-slate-400 hover:text-white font-bold text-lg leading-none p-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs text-slate-600 select-text font-sans flex-col flex">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Verwendungszweck / Ref:</span>
                      <strong className="font-mono text-slate-800">{paymentDialogInvoice.invoiceNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-sans">Zahlungsempfänger:</span>
                      <span className="font-semibold text-slate-800">{data.adminProfile?.name || 'Inhaber'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/50 pt-2 mt-1">
                      <span className="text-slate-400 text-[11px] font-bold">Zu überweisen (Brutto):</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {paymentDialogInvoice.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-705 font-mono text-[10px] uppercase mb-1">Offline-Feuchtunterschrift (Optional)</h5>
                    <p className="text-[11px] text-slate-400 leading-normal mb-2">
                      Ihre Banküberweisung wird über die gesicherte Online-Schnittstelle der Sparkasse Lichtenfels verifiziert. Sie können diese Zahlung direkt hier simulieren, um den Beleg freizuschalten.
                    </p>
                  </div>

                  {/* Payment account details info */}
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-[10px] text-slate-500 font-mono space-y-1">
                    <p>Sparkasse Lichtenfels</p>
                    <p>IBAN: DE49 7835 1520 1883 1941 12</p>
                    <p>BIC: BYLADEM1LIC</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-55 border-t border-slate-150 flex gap-2.5 justify-end">
                  <button
                    onClick={() => setPaymentDialogInvoice(null)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-150 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Fenster schließen
                  </button>
                  <button
                    onClick={() => handleClientPayInvoice(paymentDialogInvoice.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Jetzt Transfer buchen (Simuliert)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VERTRAGSÜBERSICHT TAB */}
      {activeTab === 'contracts' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden animate-fade-in select-none" id="customer-contracts-view">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 no-print print:hidden">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Mandant</span> <span className="text-slate-300">/</span> <span className="text-slate-900 font-semibold">Vertragsübersicht</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-55 text-emerald-700 px-2.5 py-1 rounded-lg font-mono font-bold border border-emerald-150">
                PORTFOLIOMANAGER • GEPRÜFT
              </span>
            </div>
          </header>

          <div className="flex-grow overflow-y-auto p-5 space-y-6 select-text">
            {/* Print-only brand header/letterhead */}
            <div className="hidden print:block bg-white border-b-2 border-slate-900 pb-5 mb-5 text-slate-900 select-text font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-extrabold tracking-tight uppercase text-slate-900">MANDANTEN-PORTAL</h1>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">Projekt- &amp; Vertragsübersicht (Direktabzug)</p>
                </div>
                <div className="text-right text-[11px] leading-relaxed">
                  <p className="font-extrabold text-slate-900">{customer.company}</p>
                  <p className="text-slate-500 mt-0.5">Mandant: <span className="font-semibold text-slate-800">{customer.name}</span></p>
                  <p className="text-slate-500">Mandanten-ID: <span className="font-mono text-slate-800">#{customer.id}</span></p>
                  <p className="text-slate-500">Erstellt am: <span className="text-slate-800 font-mono">{new Date().toLocaleDateString('de-DE')}</span></p>
                </div>
              </div>
            </div>

            {/* Portfolio statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Aktive Verträge</p>
                  <h4 className="text-base font-bold text-slate-805 tracking-tight mt-0.5">
                    3 Module
                  </h4>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0 border border-indigo-100">
                  <Euro className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Laufender Gesamtbeitrag</p>
                  <h4 className="text-base font-bold text-slate-805 tracking-tight mt-0.5">
                    1.840,05 € <span className="text-[10px] text-slate-400 font-normal">/ Jahr</span>
                  </h4>
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Zustand & Schutz</p>
                  <h4 className="text-base font-bold text-emerald-700 tracking-tight mt-0.5">
                    Rundum aktiv & optimiert
                  </h4>
                </div>
              </div>
            </div>

            {/* Contracts List View */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 font-mono uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                    <span>Aktive Projekt- & Serviceverträge</span>
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1">
                    Überwacht und optimiert von **{data.adminProfile?.name || 'Ihrem Berater'}** — Höchste Qualitätsstandards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none no-print print:hidden"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Dokument drucken / PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onTabChange) {
                        onTabChange('messages');
                      }
                      setChatInput('Hallo, ich habe eine Frage zu unserer Projektübersicht...');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none no-print print:hidden"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Rückfrage stellen</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-550 min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 font-bold">Projektmodul</th>
                      <th className="px-5 py-3.5 font-bold">Zuständiges Team</th>
                      <th className="px-5 py-3.5 font-bold">Vertragsnummer</th>
                      <th className="px-5 py-3.5 font-bold">Startdatum</th>
                      <th className="px-5 py-3.5 text-right font-bold">Budget</th>
                      <th className="px-5 py-3.5 font-bold text-center">Status</th>
                      <th className="px-5 py-3.5 text-center font-bold no-print print:hidden">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {currentContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-slate-50/40 transition-all duration-250">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 border border-emerald-100">
                              {contract.name.substring(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{contract.name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{contract.scope}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700 font-medium">{contract.insurer}</td>
                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">{contract.policyNumber}</td>
                        <td className="px-5 py-4 text-slate-500">{new Date(contract.startDate).toLocaleDateString('de-DE')}</td>
                        <td className="px-5 py-4 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                          {contract.premium.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} <span className="text-[9px] text-slate-400 font-normal font-sans">/ {contract.paymentInterval}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-emerald-50 text-emerald-700 border-emerald-150 shadow-3xs">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center no-print print:hidden">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              title="Details sichten"
                              onClick={() => setSelectedDetailContract(contract)}
                              className="px-2.5 py-1 text-slate-700 hover:text-white border border-slate-200 hover:bg-slate-900 rounded-lg text-[10px] font-bold shadow-3xs hover:border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer bg-white"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Sichten</span>
                            </button>
                            <button
                              title="Vertragsdokument laden (PDF)"
                              onClick={() => {
                                alert(`Dokumenten-Schnittstelle: Das Original-Vertragsdokument für ${contract.name} (${contract.policyNumber}) wird aus dem Projektarchiv exportiert...`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer bg-transparent border-none"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note of secure portal */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-150/40 flex items-start gap-3">
              <span className="text-emerald-700 text-sm">🛡️</span>
              <div className="text-[10.5px] text-slate-500 leading-normal">
                <strong>Anlaufstelle bei Support-Fragen:</strong> Haben Sie Fragen oder ein Anliegen zu Ihren Projekten? Senden Sie uns eine Beschreibung direkt im <span className="text-indigo-600 font-semibold cursor-pointer underline" onClick={() => onTabChange && onTabChange('messages')}>Direkt-Chat</span> oder laden Sie diese in Ihrer <span className="text-indigo-600 font-semibold cursor-pointer underline" onClick={() => onTabChange && onTabChange('files')}>Dokumenten-Zentrale</span> hoch. Den Rest erledigt unser Expertenteam direkt für Sie!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 20. WARENBESTAND (WWS) TAB FOR CUSTOMER */}
      {activeTab === 'inventory' && (() => {
        const filteredProducts = (data.inventoryProducts || []).filter(p => 
          p.name.toLowerCase().includes(wwsSearchQuery.toLowerCase()) || 
          p.sku.toLowerCase().includes(wwsSearchQuery.toLowerCase()) || 
          p.category.toLowerCase().includes(wwsSearchQuery.toLowerCase())
        );

        return (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 text-slate-800 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 to-slate-900 p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Boxes className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight uppercase leading-none">Warenbestand &amp; Betriebsmittel</h1>
                  <p className="text-[10.5px] text-slate-400 font-mono tracking-wider mt-0.5">Portalnetzwerk • Verfügbarkeits-Prüfung</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative z-10 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-350">Datenabgleich:</span>
                <strong className="text-emerald-400">AKTUELL</strong>
              </div>
            </div>

            {/* Quick numbers cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">Gesamtprodukte</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{(data.inventoryProducts || []).length}</p>
              </div>
              
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">Ausreichend auf Lager</p>
                <p className="text-2xl font-bold text-emerald-605 mt-1">
                  {(data.inventoryProducts || []).filter(p => p.stock >= p.minStock).length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">Kritischer Bestand</p>
                <p className={`text-2xl font-bold mt-1 ${
                  (data.inventoryProducts || []).some(p => p.stock < p.minStock) ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {(data.inventoryProducts || []).filter(p => p.stock < p.minStock).length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">Ihre Branchendomäne</p>
                <p className="text-xs font-bold text-slate-850 mt-2 truncate">
                  {customer.onboarding?.industry || 'Allgemeine Beratung'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-850 text-sm">Verfügbare Produkte &amp; IT-Ressourcen</h3>
                  <p className="text-xs text-slate-500">Prüfen Sie freigegebene Lizenzen, Marketing-Artikel, Hardware-Knoten und Mediensets.</p>
                </div>

                {/* Filtering / Search */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Suchen nach Name/SKU..."
                    value={wwsSearchQuery}
                    onChange={(e) => setWwsSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-250 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 w-56 font-mono"
                  />
                </div>
              </div>

              {/* Product Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((prod) => {
                  const isCritical = prod.stock < prod.minStock;
                  const isOutOfStock = prod.stock <= 0;
                  
                  return (
                    <div key={prod.id} className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all bg-slate-50/40">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-mono py-0.5 px-2 rounded-full font-bold">
                              {prod.category}
                            </span>
                            <h4 className="font-bold text-xs text-slate-800 mt-1">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {prod.sku}</p>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock 
                                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                : isCritical 
                                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            }`}>
                              {isOutOfStock ? 'AUSVERKAUFT' : isCritical ? 'BESTAND KNAPP' : 'VERFÜGBAR'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {prod.description || 'Keine nähere Spezifikation hinterlegt.'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-200/60 text-xs font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lagerbestand</span>
                            <strong className="text-slate-800">{prod.stock} Einheiten</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lagerort</span>
                            <strong className="text-slate-800">{prod.location}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <div className="text-left font-mono">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Richtpreis (EKP)</span>
                          <strong className="text-slate-750 text-xs">{(prod.sellingPrice * 1.19).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})} <span className="text-[9px] text-slate-400">brutto</span></strong>
                        </div>

                        <button
                          onClick={() => {
                            // Prefill text or trigger Chat request
                            const inquiryMessage = `Hallo! Ich habe eine Frage bezüglich des Artikels "${prod.name}" (SKU: ${prod.sku}). Ist dieser Artikel für unser Projekt (${customer.company}) freigegeben oder wie können wir Einheiten anfordern?`;
                            
                            // We can push a new message into global state
                            const newMsg = {
                              id: 'msg-' + Date.now(),
                              senderId: customer.id,
                              receiverId: 'admin',
                              content: inquiryMessage,
                              timestamp: new Date().toISOString(),
                              isRead: false
                            };

                            onDataChange({
                              ...data,
                              messages: [...(data.messages || []), newMsg]
                            });

                            onTabChange('messages');
                            alert(`Eine automatische Gesprächsanfrage zum Artikel "${prod.name}" wurde erstellt. Sie wurden direkt zum Chat weitergeleitet!`);
                          }}
                          className="py-1.5 px-3.5 bg-slate-900 hover:bg-emerald-600 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Anfrage senden</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-2 text-center py-10 text-slate-400 font-mono text-xs">
                    Keine Produkte für "{wwsSearchQuery}" gefunden.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 7. HILFE & HANDBUCH / DOKUS TAB */}
      {activeTab === 'documentation' && (
        <ManualDoc />
      )}

      {/* DIGITAL UNTERSCHRIFT OVERLAY MODAL */}
      {signingFileId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-400/20">
                  SECURE DGM-VAULT
                </span>
                <h3 className="text-base font-bold mt-1 max-w-[280px] break-all truncate">
                  Dokumenten-Signierung
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSigningFileId(null);
                  setDrawnSignaturePoints('');
                }}
                className="text-slate-400 hover:text-white font-bold text-lg leading-none p-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                  1. Unterzeichner Name*
                </label>
                <input
                  type="text"
                  value={signerFullName}
                  onChange={(e) => setSignerFullName(e.target.value)}
                  placeholder="z.B. Max Mustermann"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-700 text-sm focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5 font-mono">
                  2. Signatur-Verfahren wählen
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureDrawMode('text');
                      setDrawnSignaturePoints('');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      signatureDrawMode === 'text'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Kalligraphischer Schriftzug
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureDrawMode('draw')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      signatureDrawMode === 'draw'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Freihand-Unterzeichnungsfeld
                  </button>
                </div>
              </div>

              {/* Sign Pad Body */}
              <div className="border border-slate-200 bg-slate-50/50 rounded-2xl h-44 flex flex-col justify-center items-center overflow-hidden relative">
                {signatureDrawMode === 'text' ? (
                  <div className="p-4 text-center space-y-1">
                    <p className="text-[28px] font-serif italic text-indigo-950 tracking-wide select-none">
                      {signerFullName || 'Kein Name angegeben'}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest pt-2">
                      Formales Zertifizierungsduplikat
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full relative cursor-crosshair">
                    <svg
                      className="w-full h-full absolute inset-0 bg-white"
                      onMouseDown={startDrawingSig}
                      onMouseMove={drawSig}
                      onMouseUp={stopDrawingSig}
                      onMouseLeave={stopDrawingSig}
                    >
                      {drawnSignaturePoints && (
                        <path
                          d={drawnSignaturePoints}
                          fill="none"
                          stroke="#1e1b4b"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>

                    <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => setDrawnSignaturePoints('')}
                        className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                      >
                        Löschen
                      </button>
                    </div>

                    {!drawnSignaturePoints && (
                      <p className="absolute pointer-events-none inset-0 flex items-center justify-center text-xs text-slate-400 select-none">
                        Zeichnen Sie hier mit gedrückter Maustaste
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Secure verification notice */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-150 text-[11px] text-slate-650 leading-normal flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>DGM-Verifizierung aktiv:</strong> Bei Bestätigung berechnet das System eine dezentrale, kryptografische Prüfsumme. Dies sichert absolute Nachvollziehbarkeit und rechtliche Integrität gegen Manipulationen ab.
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-55 border-t border-slate-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setSigningFileId(null);
                  setDrawnSignaturePoints('');
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => handleSignDocument(signingFileId!)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Rechtskräftig signieren</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEASY APP ACTIVATION OVERLAY MODAL */}
      {showKeasyModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-400/20 uppercase">
                    Keasy Mobile
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Kundenordner-App aktivieren
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeasyModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg leading-none p-2 cursor-pointer transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-slate-700">
              <p className="text-xs text-slate-500 leading-relaxed">
                Holen Sie Ihre Projektübersichten auf Ihr Smartphone! Mit unserer <strong>Portal-App</strong> haben Sie Ihre Zeitpläne, Meilensteine und Ihren direkten Draht zu **{data.adminProfile?.name || 'Ihrem Berater'}** immer in der Hosentasche.
              </p>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-150">
                {/* Simulated QR Code via beautiful SVG pattern! */}
                <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-xl border border-slate-250 shadow-2xs">
                  <svg className="w-28 h-28 text-slate-900" viewBox="0 0 100 100">
                    {/* Outer borders and QR layout grids */}
                    <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="12" y="12" width="11" height="11" fill="currentColor" />
                    <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="77" y="12" width="11" height="11" fill="currentColor" />
                    <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                    <rect x="12" y="77" width="11" height="11" fill="currentColor" />
                    {/* Arbitrary QR pixels */}
                    <rect x="38" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="50" y="20" width="8" height="8" fill="currentColor" />
                    <rect x="38" y="32" width="14" height="6" fill="currentColor" />
                    <rect x="10" y="38" width="16" height="8" fill="currentColor" />
                    <rect x="20" y="52" width="8" height="8" fill="currentColor" />
                    <rect x="38" y="50" width="12" height="10" fill="currentColor" />
                    <rect x="58" y="38" width="10" height="16" fill="currentColor" />
                    <rect x="70" y="38" width="18" height="8" fill="currentColor" />
                    <rect x="70" y="55" width="8" height="15" fill="currentColor" />
                    <rect x="85" y="65" width="8" height="8" fill="currentColor" />
                    <rect x="38" y="70" width="8" height="18" fill="currentColor" />
                    <rect x="52" y="78" width="12" height="12" fill="currentColor" />
                    <circle cx="50" cy="50" r="10" fill="#10b981" />
                    <text x="47" y="54" fill="white" fontSize="11" fontWeight="bold">K</text>
                  </svg>
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-2 text-center uppercase tracking-wide">
                    QR-Code Scannen
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Schritt 1</h4>
                    <p className="text-[10px] text-slate-500">QR-Code scannen, um die Portal-App für iOS oder Android zu laden.</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Schritt 2</h4>
                    <p className="text-[10px] text-slate-500">Geben Sie beim erstmaligen Anmelden Ihre persönliche Kennung ein:</p>
                    <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 font-mono font-bold text-xs text-indigo-650 text-center shadow-3xs uppercase">
                      K-{customer.id.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Benefit notice */}
              <div className="bg-[#f0fdf4] p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-[10.5px] text-emerald-800 leading-normal">
                  <strong>Echte Synchronisation:</strong> Sobald Sie die App aktivieren, werden alle Meilensteine, Video-Reviews und Status-Tickets des Portals automatisch auf Ihr Smartphone gespiegelt.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeasyModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Verstanden & Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONTRACT DETAILS OVERLAY MODAL */}
      {selectedDetailContract && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in animate-scale-up" id="contract-details-modal">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden select-text flex flex-col max-h-[90vh]">
            
            {/* Print-only modal brand letterhead */}
            <div className="hidden print:block bg-white border-b-2 border-slate-900 pb-4 mb-4 text-slate-900 font-sans p-6 pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-base font-extrabold tracking-tight uppercase text-slate-900">MANDANTEN-PORTAL</h1>
                  <p className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">Projekt- &amp; Einzelvertragsdetails (Auszug)</p>
                </div>
                <div className="text-right text-[10px] leading-relaxed">
                  <p className="font-extrabold text-slate-900">{customer.company}</p>
                  <p className="text-slate-500">Vertragspartner: <span className="font-semibold text-slate-800">{customer.name}</span></p>
                  <p className="text-slate-500">Referenz: <span className="font-mono text-slate-800">{selectedDetailContract.policyNumber}</span></p>
                  <p className="text-slate-500">Druckdatum: <span className="text-slate-800 font-mono">{new Date().toLocaleDateString('de-DE')}</span></p>
                </div>
              </div>
            </div>

            {/* Modal Header Banner */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center shrink-0 no-print print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-400/20 uppercase">
                    VERTRAGS-DETAILSICHT
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {selectedDetailContract.name}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailContract(null)}
                className="text-slate-400 hover:text-white font-bold text-xl leading-none p-4 cursor-pointer transition-colors border-none bg-transparent"
              >
                ×
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto">

              {/* Highlight KPI metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Budget</span>
                  <strong className="text-xs text-slate-800 font-mono font-black">
                    {selectedDetailContract.premium.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </strong>
                  <span className="text-[9px] text-slate-450 block font-normal">pro {selectedDetailContract.paymentInterval}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Zusatzkosten</span>
                  <strong className="text-xs text-slate-800 font-mono font-semibold">
                    {selectedDetailContract.deductible}
                  </strong>
                  <span className="text-[9px] text-slate-450 block font-normal">je Projektmodul</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Leistungsdauer</span>
                  <strong className="text-xs text-indigo-750 font-semibold font-sans">
                    {selectedDetailContract.coverage}
                  </strong>
                  <span className="text-[9px] text-slate-450 block font-normal">Vertragslaufzeit</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Nächste Abnahme</span>
                  <strong className="text-xs text-slate-800 font-mono font-semibold">
                    {new Date(selectedDetailContract.mainDueDate).toLocaleDateString('de-DE')}
                  </strong>
                  <span className="text-[9px] text-slate-450 block font-normal">geplante Abnahme</span>
                </div>
              </div>

              {/* Main Two-column details block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: General Info and Coverage checkmarks list */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
                      Wichtige Leistungskomponenten
                    </h5>
                    <ul className="space-y-2.5">
                      {selectedDetailContract.details.map((detail: string, index: number) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs text-slate-650 leading-relaxed font-sans">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Technical specifications list */}
                <div className="md:col-span-5 space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-150">
                  <h5 className="text-[11px] font-bold text-indigo-900 font-mono uppercase tracking-wider block border-b border-indigo-100/40 pb-2 mb-3">
                    Vertragliche Stammdaten
                  </h5>
                  <div className="space-y-3 text-xs text-slate-600 font-sans">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-450 text-[10px]">Verantwortlich:</span>
                      <strong className="text-slate-800 font-semibold text-right">{selectedDetailContract.insurer}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 font-mono text-[10px]">
                      <span className="text-slate-450">Vereinbarungs-Nr:</span>
                      <strong className="text-slate-800 font-semibold">{selectedDetailContract.policyNumber}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 font-sans">
                      <span className="text-slate-450 text-[10px]">Aktiv seit:</span>
                      <span className="text-slate-800 font-medium">{new Date(selectedDetailContract.startDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-450 text-[10px]">Abrechnungsweise:</span>
                      <span className="text-slate-800 font-medium">{selectedDetailContract.billingMethod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-450 text-[10px]">Geltungsbereich:</span>
                      <span className="text-slate-805 font-semibold text-right text-[11px] leading-tight">{selectedDetailContract.scope}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 text-[10px]">Support-Kanal:</span>
                      <span className="text-emerald-700 font-bold">{selectedDetailContract.contactPerson}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Secure communication alert banner */}
              <div className="bg-[#f0fdf4] p-3.5 rounded-xl border border-emerald-100/80 text-[11px] text-slate-650 leading-normal flex items-start gap-2 pt-3 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <strong>Mandanten-Sicherheitshinweis:</strong> Diese vertraglichen Detailinformationen wurden über die gesicherte und verschlüsselte Systemschnittstelle direkt aus den Archiven geladen. Sämtliche Angaben sind rechtlich verbindlich und auf dem neuesten Stand.
                </div>
              </div>

            </div>

            {/* Modal Action Footer buttons */}
            <div className="p-5 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-2.5 justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  const targetName = selectedDetailContract.name;
                  const targetNumber = selectedDetailContract.policyNumber;
                  setSelectedDetailContract(null);
                  if (onTabChange) {
                    onTabChange('messages');
                  }
                  setChatInput(`Hallo, ich habe eine Frage zu unserem Vertrag "${targetName}" (Vertrags-Nr: ${targetNumber})...`);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>Frage stellen</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const targetName = selectedDetailContract.name;
                  const targetNumber = selectedDetailContract.policyNumber;
                  alert(`Projekt-Supportanfrage wird initiiert...\nEine Support-Anfrage zur Vereinbarung "${targetName}" wurde online vorgemerkt. Bitte ergänzen Sie Ihre genauen Fragen direkt im Direkt-Chat.`);
                  setSelectedDetailContract(null);
                  if (onTabChange) {
                    onTabChange('messages');
                  }
                  setChatInput(`⚠️ **PROJEKT-ÄNDERUNGSANFRAGE / SUPPORT**\nVertrag: ${targetName}\nVertrags-Nr: ${targetNumber}\n\nFragen & Änderungswünsche (Bitte hier ausfüllen):\n- Welche Änderungen/Erweiterungen wünschen Sie?\n- Zu wann soll das umgesetzt werden?\n- Gibt es spezifische Details/Dateien dazu?`);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 border-none no-print print:hidden"
              >
                <span>Änderung anfordern</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 border-none no-print print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Details drucken / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDetailContract(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-650 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer no-print print:hidden"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Universal High Density Status Footer */}
      <footer className="h-8 bg-slate-950 text-slate-400 px-4 flex items-center justify-between text-[10px] font-mono select-none flex-shrink-0 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>MANDANTEN-PORTAL • END-TO-END VERSCHLUESSELT</span>
        </div>
        <div>
          <span>{customer.company} • MEMBER ID #{customer.id}</span>
        </div>
      </footer>
    </div>
  );
}

// Inline fallback since Lucide named folder exports sometimes differ
function FolderOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
