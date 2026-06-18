import { CRMData } from './types';

export const INITIAL_MOCK_DATA: CRMData = {
  adminProfile: {
    name: "Max Muster-Consultant",
    company: "Muster Consulting GmbH",
    email: "info@muster-consulting.de",
    phone: "+49 123 45678",
    address: "Musterstraße 10, 80331 München",
    iban: "DE89 3704 0044 0532 0130 00",
    bankName: "Muster Stadtsparkasse",
    bic: "WELADED1MUC",
    taxNumber: "143/123/45678",
    hrb: "HRB 98765"
  },
  customers: [
    {
      id: "cust-max",
      name: "Max Mustermann",
      company: "Muster GmbH",
      email: "max@muster.de",
      phone: "+49 123 456789",
      address: "Musterstraße 1, 80331 München",
      status: "Stammkunde",
      username: "max.muster",
      passwordHash: "fc46231ef64c5be7f0580970877990159f8a379373bd33e46c7ad7208d2b2707", // SHA256 of 'kunde123'
      notes: "Stammkunde seit 2024. Sehr interessiert an neuen Beratungslösungen und monatlichen Projektberichten.",
      createdAt: "2026-01-10T12:00:00.000Z",
      activePhase: 3,
      crmTitle: "Musterfirma CRM (Muster GmbH)",
      landingpageUrl: "https://mustergmbh-it.my-portal.de",
      onboarding: {
        companyName: "Muster GmbH",
        industry: "Dienstleistungsunternehmen (IT-Consulting)",
        services: "IT-Transformation, Cloud-Architekturen, Enterprise Security Audits",
        products: "CloudVault v2, SecureMappe Enterprise, On-Premise Monitoring Suite",
        targetGroup: "Mittelständische Handwerks- und Industriebetriebe in Bayern",
        phone: "+49 123 456789",
        email: "info@mustergmbh-it.de",
        address: "Musterstraße 1, 80331 München",
        description: "Die Muster GmbH berät seit 10 Jahren lückenlos zu modernen Cloud-Workflows und Datenschutzvorgaben.",
        specialFeatures: "ISO-27001 zertifiziert, 24/7 Cyber-Response-Leitstelle, zertifizierte White-Hat Hacker.",
        logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
        appointmentWishes: "Dienstag oder Donnerstag Vormittag",
        individualRequirements: "Echtzeit-Schnittstelle zu lokalem Active Directory gewünscht.",
        createdAt: "2026-01-10T11:00:00.000Z"
      },
      handoverProtocol: {
        deployed: true,
        landingpageActive: true,
        crmSetupActive: true,
        userDbActive: true,
        documentStorageActive: true,
        appointmentsActive: true,
        adminUsername: "admin_muster",
        adminPasswordPlain: "musterAdmin2026!",
        clientUsername: "max.muster",
        clientPasswordPlain: "kunde123",
        handoverDate: "2026-01-15",
        confirmedByClient: true,
        confirmationSignature: "Max Mustermann",
        confirmationDate: "2026-01-15"
      }
    },
    {
      id: "cust-anna",
      name: "Anna Schmidt",
      company: "Schmidt AG",
      email: "anna@schmidt.de",
      phone: "+49 987 654321",
      address: "Hauptstraße 15, 80335 München",
      status: "Neukunde",
      username: "anna.schmidt",
      passwordHash: "fc46231ef64c5be7f0580970877990159f8a379373bd33e46c7ad7208d2b2707", // SHA256 of 'kunde123'
      notes: "Neuzugang aus Empfehlung. Sucht exklusive Raumkonzeption & Maßanfertigungen.",
      createdAt: "2026-05-15T09:30:00.000Z",
      activePhase: 1,
      crmTitle: "Schmidt AG Consulting CRM",
      landingpageUrl: "https://schmidt-wohnfuehlen.my-portal.de",
      onboarding: {
        companyName: "Schmidt AG",
        industry: "Premium-Möbelmanufaktur & Raumkonzepte",
        services: "Raumplanung, Maßanfertigung von Massivholzmöbeln, ergonomische Arbeitsplatzgestaltung",
        products: "OakMaster Esstische, Ergofit Designstühle, Aura Massivholz-Betten, Loft Regalsysteme",
        targetGroup: "Architekten, Bürogemeinschaften, Interior Designer und anspruchsvolle Privatkunden",
        phone: "+49 987 654321",
        email: "onboarding@schmidt-wohnfuehlen.de",
        address: "Hauptstraße 15, 80335 München",
        description: "Die Schmidt AG entwirft und fertigt exklusive, langlebige Vollholzmöbel mit modernen und nachhaltigen Raumkonzepten.",
        specialFeatures: "Eigene handwerkliche Tischler-Werkstatt, millimetergenaue Maßarbeit, CAD-Visualisierung in 3D.",
        logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=200&auto=format&fit=crop",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
        appointmentWishes: "Werktags ab 15:00 Uhr nachmittags",
        individualRequirements: "Integrierter Konfigurator für Holzmaserungen und Produktvarianten im Portal",
        createdAt: "2026-05-15T09:00:00.000Z"
      },
      handoverProtocol: {
        deployed: false,
        landingpageActive: false,
        crmSetupActive: false,
        userDbActive: false,
        documentStorageActive: false,
        appointmentsActive: false,
        adminUsername: "admin_schmidt",
        adminPasswordPlain: "schmidtCrm2026!",
        clientUsername: "anna.schmidt",
        clientPasswordPlain: "kunde123",
        handoverDate: "2026-06-18",
        confirmedByClient: false
      }
    },
    {
      id: "cust-tom",
      name: "Tom Weber",
      company: "Weber Solutions",
      email: "tom@weber.de",
      phone: "+49 555 123456",
      address: "Bahnhofsplatz 5, 80335 München",
      status: "Aktiv",
      username: "tom.weber",
      passwordHash: "fc46231ef64c5be7f0580970877990159f8a379373bd33e46c7ad7208d2b2707", // SHA256 of 'kunde123'
      notes: "Technologiepartner und Beratungskunde. Reicht monatlich Berichte und Verträge ein.",
      createdAt: "2026-03-22T14:45:00.000Z",
      activePhase: 4,
      crmTitle: "Weber Solutions CRM Pro",
      landingpageUrl: "https://webersolutions-consulting.my-portal.de",
      onboarding: {
        companyName: "Weber Solutions",
        industry: "Handelsvertretung & Vertriebsagentur",
        services: "B2B Vertriebsoptimierung, Funnel-Building, Kaltakquise-Schulungen",
        products: "Weber Sales-Accelerator Bootcamps, Inbound Conversions Audit",
        targetGroup: "Softwarehersteller, Tech-Startups und Softwarehäuser in DACH",
        phone: "+49 555 123456",
        email: "vertrieb@weber-solutions.de",
        address: "Bahnhofsplatz 5, 80335 München",
        description: "Weber Solutions konzipiert hochkonvertierende Vertriebsprozesse und trainiert Inside-Sales-Teams direkt vor Ort.",
        specialFeatures: "Garantierte Umsatzsteigerung von min. 20% binnen 90 Tagen, eigene Telefonie-Infrastruktur.",
        logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=200&auto=format&fit=crop",
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
        appointmentWishes: "Freitag Vormittag oder flexibel online",
        individualRequirements: "Salesforce CRM Link Integration notwendig.",
        createdAt: "2026-03-22T14:00:00.000Z"
      },
      handoverProtocol: {
        deployed: true,
        landingpageActive: true,
        crmSetupActive: true,
        userDbActive: true,
        documentStorageActive: true,
        appointmentsActive: true,
        adminUsername: "admin_weber",
        adminPasswordPlain: "weberSecure99!",
        clientUsername: "tom.weber",
        clientPasswordPlain: "kunde123",
        handoverDate: "2026-04-01",
        confirmedByClient: true,
        confirmationSignature: "Tom Weber",
        confirmationDate: "2026-04-01"
      }
    }
  ],
  files: [
    {
      id: "file-1",
      customerId: "cust-max",
      customerName: "Max Mustermann",
      name: "Dienstleistungsvertrag_2026_MusterGmbH.pdf",
      type: "application/pdf",
      size: 1048576, // 1 MB
      category: "Vertrag",
      uploadDate: "2026-05-20T10:15:30.000Z",
      status: "Genehmigt",
      adminNote: "Vertrag wurde geprüft und entspricht den Richtlinien. Kopie unterschrieben im Portal hinterlegt."
    },
    {
      id: "file-2",
      customerId: "cust-max",
      customerName: "Max Mustermann",
      name: "Massivholztisch_Planung_MusterGmbH.pdf",
      type: "application/pdf",
      size: 4718592, // ~4 MB
      category: "Datei",
      uploadDate: "2026-05-24T16:20:00.000Z",
      status: "In Bearbeitung",
      adminNote: "Entwurf wird geprüft. Die Maße für die Eichentischplatte passen."
    },
    {
      id: "file-3",
      customerId: "cust-tom",
      customerName: "Tom Weber",
      name: "Umsatzbericht_Q1_WeberSolutions.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 154850, // ~150 KB
      category: "Datei",
      uploadDate: "2026-05-28T11:05:00.000Z",
      status: "Eingereicht"
    },
    {
      id: "file-4",
      customerId: "cust-anna",
      customerName: "Anna Schmidt",
      name: "Planungsauftrag_Raumkonzept_AnnaSchmidt.pdf",
      type: "application/pdf",
      size: 2048576, // 2 MB
      category: "Vertrag",
      uploadDate: "2026-05-29T14:00:00.000Z",
      status: "Eingereicht"
    }
  ],
  messages: [
    {
      id: "msg-1",
      senderId: "admin",
      receiverId: "cust-max",
      content: "Hallo Herr Mustermann, willkommen in Ihrem neuen Kundenportal! Hier können Sie wie besprochen alle Verträge und Entwürfe für Ihr Möbelprojekt sichten.",
      timestamp: "2026-05-20T08:30:00.000Z",
      isRead: true
    },
    {
      id: "msg-2",
      senderId: "cust-max",
      receiverId: "admin",
      content: "Hallo, das sieht wirklich fantastisch und sehr übersichtlich aus! Ich habe direkt den unterschriebenen Entwurfsauftrag und die Raumskizzen hochgeladen.",
      timestamp: "2026-05-20T10:20:00.000Z",
      isRead: true
    },
    {
      id: "msg-3",
      senderId: "admin",
      receiverId: "cust-max",
      content: "Wunderbar! Den Entwurfsauftrag habe ich soeben bereits als genehmigt markiert. Wir prüfen morgen direkt die Raumskizzen und senden Ihnen unser detailliertes Feedback hier im Chat.",
      timestamp: "2026-05-20T11:05:00.000Z",
      isRead: true
    },
    {
      id: "msg-4",
      senderId: "cust-max",
      receiverId: "admin",
      content: "Super, vielen Dank für die extrem schnelle Bearbeitung! Ich freue mich auf die Rückmeldung zur Holzauswahl.",
      timestamp: "2026-05-20T11:15:00.000Z",
      isRead: true
    },
    {
      id: "msg-5",
      senderId: "cust-tom",
      receiverId: "admin",
      content: "Hallo, ich habe unseren aktuellen Umsatzbericht für Q1 hochgeladen. Könnten wir dazu nächste Woche kurz sprechen?",
      timestamp: "2026-05-28T11:10:00.000Z",
      isRead: false
    }
  ],
  appointments: [
    {
      id: "appt-1",
      title: "Vertrags-Review Muster GmbH",
      date: "2026-06-02",
      time: "10:00",
      description: "Abschlussbesprechung der neuen Projektvereinbarung",
      customerId: "cust-max"
    },
    {
      id: "appt-2",
      title: "Umsatzbericht-Analyse Weber Solutions",
      date: "2026-06-03",
      time: "14:30",
      description: "Gemeinsame Analyse der Q1-Kennzahlen im Online-Meeting",
      customerId: "cust-tom"
    },
    {
      id: "appt-3",
      title: "Onboarding-Gespräch Schmidt AG",
      date: "2026-06-05",
      time: "09:00",
      description: "Erstes Onboarding und Bedarfsanalyse für Maßanfertigungen",
      customerId: "cust-anna"
    }
  ],
  botRules: [
    {
      id: "rule-preise",
      triggerKeywords: ["preis", "preise", "kosten", "honorar", "angebot", "günstig", "teuer", "geld", "zahlen", "stundenlohn", "paket"],
      answer: "Unsere Beratung, Raumplanungen und handwerklichen Dienstleistungen erfolgen nach transparenten Fixpreisen oder präzise kalkulierten Angeboten für Arbeits- und Materialstunden. Bei exklusiven Maßanfertigungen vereinbaren wir stets im Voraus ein festes Budget nach Vorfälligkeit der CAD-Zeichnung, sodass für Sie absolute Transparenz herrscht. Ein Erstgespräch zur Bedarfsermittlung (Phase 1) ist für Sie vollkommen kostenfrei!",
      usagesCount: 0,
      lastEditedBy: "Administrator"
    },
    {
      id: "rule-entwurf",
      triggerKeywords: ["holz", "moebel", "muster", "massivholz", "eiche", "entwurf", "zeichnung", "tisch", "bett", "schrank", "massiv", "cad"],
      answer: "Wir fertigen exklusive Massivholzunikate nach Maß. Von der ersten CAD-Raumplanung im Portal bis zum fertigen Möbelstück in unserer Werkstatt begleiten wir Sie Schritt für Schritt. Sie können eigene Inspirationsbilder im Datei-Bereich des Portals hochladen, damit unsere Tischlermeister diese direkt in die Entwurfsplanung einbeziehen.",
      usagesCount: 0,
      lastEditedBy: "Administrator"
    },
    {
      id: "rule-dgm",
      triggerKeywords: ["vertrag", "unterschrift", "unterschreiben", "signieren", "signatur", "vertraglich", "rechtskräftig", "freigabe", "kooperationsvertrag"],
      answer: "Über unser integriertes, digitales Signaturverfahren können Sie Verträge, NDAs und Angebote absolut rechtssicher und digital im Portal signieren. Klicken Sie neben dem Dokument auf 'Signieren', verifizieren Sie Ihre Daten und zeichnen Sie den Beleg ab. Dies erspart Postwege und beschleunigt den Projektstart!",
      usagesCount: 0,
      lastEditedBy: "System"
    },
    {
      id: "rule-termine",
      triggerKeywords: ["termin", "kalender", "meeting", "treffen", "buchung", "buchen", "uhrzeit", "datum", "online", "videochat", "beratung"],
      answer: "Einen persönlichen Abstimmungstermin buchen Sie ganz bequem im Bereich 'Termine' links. Suchen Sie sich einfach einen freien Slot im Kalender aus, der Termin wird automatisch für Sie reserviert und nach Freigabe im Dashboard angezeigt.",
      usagesCount: 0,
      lastEditedBy: "Administrator"
    },
    {
      id: "rule-roadmap",
      triggerKeywords: ["phase", "fortschritt", "roadmap", "schritt", "prozess", "status", "abgeschlossen", "meilenstein"],
      answer: "Ihre interaktive Projekt-Roadmap gliedert sich in 5 Phasen – vom Kick-off-Meeting über die Konzeptionierung bis hin zur fertigen Kampagne und Erfolgsanalyse. Der Administrator schaltet diese Meilensteine für Sie frei, damit Sie immer exakt über den aktuellen Stand informiert sind.",
      usagesCount: 0,
      lastEditedBy: "System"
    },
    {
      id: "rule-kontakt",
      triggerKeywords: ["kontakt", "support", "telefon", "email", "mail", "anrufen", "telefonnummer", "erreichbar", "öffnungszeiten", "adresse", "büro"],
      answer: "Sie erreichen unser Büro von Montag bis Freitag von 09:00 bis 17:00 Uhr telefonisch oder per E-Mail. Die genauen Kontaktdaten sowie Ansprechpartner finden Sie jederzeit im Portal-Briefkopf und im Info-Bereich.",
      usagesCount: 0,
      lastEditedBy: "Administrator"
    }
  ],
  unresolvedQueries: [],
  invoices: [
    {
      id: "inv-1",
      invoiceNumber: "RE-2026-001",
      customerId: "cust-max",
      customerName: "Max Mustermann",
      amount: 1190.00,
      taxAmount: 190.00,
      netAmount: 1000.00,
      taxRate: 19,
      issueDate: "2026-05-15",
      dueDate: "2026-06-15",
      status: "Bezahlt",
      description: "Bedarfsanalyse & Beratungspaket",
      paymentMethod: "Überweisung",
      paidAt: "2026-05-18",
      items: [
        {
          id: "item-1",
          description: "Strukturierte Bedarfsanalyse und Erstellung des ersten Strategiekonzepts",
          quantity: 1,
          unitPrice: 1000.00,
          total: 1000.00
        }
      ]
    },
    {
      id: "inv-2",
      invoiceNumber: "RE-2026-002",
      customerId: "cust-max",
      customerName: "Max Mustermann",
      amount: 345.10,
      taxAmount: 55.10,
      netAmount: 290.00,
      taxRate: 19,
      issueDate: "2026-05-28",
      dueDate: "2026-06-28",
      status: "Offen",
      description: "Consulting & Workflow-Optimierung",
      items: [
        {
          id: "item-2",
          description: "Detailliertes Audit und Optimierung der internen Digitalprozesse",
          quantity: 1,
          unitPrice: 290.00,
          total: 290.00
        }
      ]
    },
    {
      id: "inv-3",
      invoiceNumber: "RE-2026-003",
      customerId: "cust-anna",
      customerName: "Anna Schmidt",
      amount: 595.00,
      taxAmount: 95.00,
      netAmount: 500.00,
      taxRate: 19,
      issueDate: "2026-05-10",
      dueDate: "2026-05-24",
      status: "Überfällig",
      description: "Medienproduktion: Content-Schnitt & Postproduktion",
      items: [
        {
          id: "item-3",
          description: "Schnitt und Postproduktion von digitalem Werbematerial (Social Media Ads)",
          quantity: 1,
          unitPrice: 500.00,
          total: 500.00
        }
      ]
    }
  ],
  customTemplates: [],
  suppliers: [
    {
      id: "sup-1",
      name: "Holzwerk & Designmanufaktur GmbH",
      contactName: "Thomas Koch",
      email: "info@holzwerk-design.de",
      phone: "+49 89 223344",
      address: "Möbelwerkweg 4, 80331 München"
    },
    {
      id: "sup-2",
      name: "WohnStyle & Deko Komfort KG",
      contactName: "Julia Schneider",
      email: "b2b@wohnstyle.de",
      phone: "+49 40 778899",
      address: "Hafenstraße 12, 20457 Hamburg"
    }
  ],
  inventoryProducts: [
    {
      id: "prod-1",
      sku: "ART-1001",
      name: "Ergonomischer Bürostuhl \"Ergofit Pro\"",
      category: "Möbel",
      stock: 12,
      minStock: 5,
      purchasePrice: 120.00,
      sellingPrice: 249.00,
      location: "Halle 1, Regal B2",
      supplierId: "sup-1",
      description: "Ergonomischer Schreibtischstuhl mit 3D-Armlehnen und Lordosenstütze."
    },
    {
      id: "prod-2",
      sku: "ART-1002",
      name: "Massivholz-Schreibtisch \"OakMaster\"",
      category: "Möbel",
      stock: 8,
      minStock: 3,
      purchasePrice: 310.00,
      sellingPrice: 599.00,
      location: "Halle 1, Regal A4",
      supplierId: "sup-1",
      description: "Edler Arbeitstisch aus massiver Wildeiche mit integriertem Kabelkanal."
    },
    {
      id: "prod-3",
      sku: "ART-1003",
      name: "LED-Designer-Stehleuchte \"Aura\"",
      category: "Beleuchtung",
      stock: 15,
      minStock: 5,
      purchasePrice: 35.00,
      sellingPrice: 89.00,
      location: "Halle 2, Regal C1",
      supplierId: "sup-2",
      description: "Dimmbare LED-Warmlicht-Stehleuchte mit Gestensteuerung und minimalistischem Standfuß."
    },
    {
      id: "prod-4",
      sku: "ART-1004",
      name: "Wollteppich Handgewebt \"Nordic Cozy\"",
      category: "Dekoration",
      stock: 4,
      minStock: 5,
      purchasePrice: 65.00,
      sellingPrice: 129.00,
      location: "Halle 2, Regal D3",
      supplierId: "sup-2",
      description: "Dicker Wollteppich aus 100% Bio-Schurwolle im skandinavischen Design."
    }
  ],
  stockMovements: [
    {
      id: "mov-1",
      productId: "prod-1",
      productName: "Ergonomischer Bürostuhl \"Ergofit Pro\"",
      type: "incoming",
      quantity: 15,
      date: "2026-05-01T10:00:00.000Z",
      reason: "Sammelbestellung Wareneingang",
      operator: "System"
    },
    {
      id: "mov-2",
      productId: "prod-1",
      productName: "Ergonomischer Bürostuhl \"Ergofit Pro\"",
      type: "outgoing",
      quantity: 3,
      date: "2026-05-15T14:30:00.000Z",
      reason: "Büroausstattung Muster-Kunde",
      operator: "Admin"
    },
    {
      id: "mov-3",
      productId: "prod-3",
      productName: "LED-Designer-Stehleuchte \"Aura\"",
      type: "outgoing",
      quantity: 2,
      date: "2026-06-01T09:00:00.000Z",
      reason: "Ausstellungsstück Showroom",
      operator: "Admin"
    }
  ],
  supplierOrders: [
    {
      id: "ord-1",
      orderNumber: "ORD-2026-001",
      supplierId: "sup-2",
      supplierName: "WohnStyle & Deko Komfort KG",
      items: [
        {
          productId: "prod-3",
          productName: "LED-Designer-Stehleuchte \"Aura\"",
          quantity: 20,
          unitPrice: 35.00
        }
      ],
      totalAmount: 700.00,
      status: "Geliefert",
      orderDate: "2026-05-20",
      deliveryDate: "2026-05-25"
    },
    {
      id: "ord-2",
      orderNumber: "ORD-2026-002",
      supplierId: "sup-1",
      supplierName: "Holzwerk & Designmanufaktur GmbH",
      items: [
        {
          productId: "prod-1",
          productName: "Ergonomischer Bürostuhl \"Ergofit Pro\"",
          quantity: 5,
          unitPrice: 120.00
        }
      ],
      totalAmount: 600.00,
      status: "Ausstehend",
      orderDate: "2026-06-05"
    }
  ]
};
