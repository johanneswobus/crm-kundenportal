import { RoadmapSubTask } from './components/CustomerPortal';

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
  tasks: RoadmapSubTask[];
}

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
  {
    id: 'raumplanung',
    name: 'Ganzheitliche Innenarchitektur & Raumplanung',
    description: '3D-Raumkonzeptionierung, Lichtdesign und maßgeschneiderte Materialauswahl für Ihre Wohnräume.',
    icon: 'Layers',
    category: 'Raumplanung',
    phases: [
      { phase: 1, title: 'Erstberatung', desc: 'Briefing & Aufmaß vor Ort' },
      { phase: 2, title: 'Kreativ-Konzept', desc: 'Möbelentwürfe & Disposition' },
      { phase: 3, title: 'Material-Auswahl', desc: 'Holzproben & Textur-Abstimmung' },
      { phase: 4, title: '3D-Visualisierung', desc: 'Fotorealistische CAD-Planung' },
      { phase: 5, title: 'Finale Realisierung', desc: 'Koordinierte Montage & Abnahme' }
    ],
    tasks: [
      { id: 'rp1t1', phase: 1, title: 'Kostenfreies Erstgespräch & Vor-Ort-Aufmaß', desc: 'Detaillierte Analyse Ihrer Wohnräume und Bestimmungen zur künftigen Nutzung.', role: 'Beide', actionLabel: 'Erstgespräch buchen', actionType: 'appointment' },
      { id: 'rp1t2', phase: 1, title: 'Planungsvereinbarung digital unterzeichnen', desc: 'Rechtliche Freigabe des Entwurfsauftrags direkt im Portal signieren.', role: 'Kunde', actionLabel: 'Projektvertrag sichten', actionType: 'upload' },
      
      { id: 'rp2t1', phase: 2, title: 'Upload eigener Inspirationsbilder & Pläne', desc: 'Sicheres Hochladen von Grundrissen, Fotos oder Skizzen Ihrer Wunschmöbel.', role: 'Kunde', actionLabel: 'Dokument hochladen', actionType: 'upload' },
      { id: 'rp2t2', phase: 2, title: 'Erstellung erster Handskizzen & Raumlayouts', desc: 'Zeichnerischer Erstentwurf zur Raumaufteilung durch unsere Meistertischler.', role: 'Berater' },
      { id: 'rp2t3', phase: 2, title: 'Prüfung statischer & baulicher Gegebenheiten', desc: 'Technische Einschätzung bezüglich tragender Wände, Nischen und Anschlüsse.', role: 'Berater' },
      
      { id: 'rp3t1', phase: 3, title: 'Präsentation der Schreinermuster im Showroom', desc: 'Auswahl erlesener Holzarten (Eiche, Nussbaum, Wildesche), Naturöle und Metallbeschläge.', role: 'Beide', actionLabel: 'Termin vereinbaren', actionType: 'appointment' },
      { id: 'rp3t2', phase: 3, title: 'Zusammenstellung des Material- & Bemusterungsboards', desc: 'Haptische Zusammenstellung von Hölzern, Stoffbezügen und Griffmustern.', role: 'Berater' },
      { id: 'rp3t3', phase: 3, title: 'Freigabe der Material- & Design-Kombinationen', desc: 'Bestätigung des Materialboards zur Weitergabe an die Werkstattplanung.', role: 'Kunde', actionLabel: 'Kombination freigeben', actionType: 'chat' },
      
      { id: 'rp4t1', phase: 4, title: 'Erstellung fotorealistischer 3D-CAD-Ansichten', desc: 'Digitale Renderings zeigen Ihre neuen Massivholzmöbel exakt eingepasst in Ihren Raum.', role: 'Berater' },
      { id: 'rp4t2', phase: 4, title: 'Abschluss-Workshop zur 3D-Planungszeichnung', desc: 'Konstruktives Feedbackgespräch und letzte Maßanpassungen am Bildschirm.', role: 'Beide', actionLabel: 'Review-Workshop buchen', actionType: 'appointment' },
      
      { id: 'rp5t1', phase: 5, title: 'Lieferung, Einpassung & staubfreie Endmontage', desc: 'Fachgerechter Aufbau und Einpassung aller Möbelstücke durch Schreinermeister vor Ort.', role: 'Beide' },
      { id: 'rp5t2', phase: 5, title: 'Gemeinsame Endabnahme & Pflege-Einweisung', desc: 'Übergabe der Pflegeanleitung und des exklusiven Pflege-Ölsets zur Werterhaltung.', role: 'Beide' }
    ]
  },
  {
    id: 'einzelanfertigung',
    name: 'Exklusive Massivholzmöbel-Maßanfertigung',
    description: 'Traditionelle Handwerkskunst trifft auf modernen Nutzen - Unikate nach Ihren Maßen gefertigt.',
    icon: 'Sparkles',
    category: 'Einzelanfertigung',
    phases: [
      { phase: 1, title: 'Design-Briefing', desc: 'Formfindung & Maße' },
      { phase: 2, title: 'Holzauswahl', desc: 'Selektion feiner Hölzer' },
      { phase: 3, title: 'Werkstattzeichnung', desc: 'CAD-Konstruktion & Detailfreigabe' },
      { phase: 4, title: 'Möbelbau', desc: 'Zuschnitt, Hobelung & Montage' },
      { phase: 5, title: 'Oberflächenfinish', desc: 'Feinschliff & Tiefenölung' }
    ],
    tasks: [
      { id: 'ea1t1', phase: 1, title: 'Kick-off-Meeting zur Form- & Funktionsauswahl', desc: 'Festlegung von Esstisch-Maßen, Kantenprofilen (Baumkante vs. Schweizer Kante) & Fußgestellen.', role: 'Beide', actionLabel: 'Projektberatung buchen', actionType: 'appointment' },
      { id: 'ea1t2', phase: 1, title: 'Anfertigungsvertrag digital signieren', desc: 'Rechtssichere Freigabe des Werkstattauftrags zur Materialbestellung.', role: 'Kunde', actionLabel: 'Auftrag unterzeichnen', actionType: 'upload' },
      
      { id: 'ea2t1', phase: 2, title: 'Auswahl der exakten Holzdiele im Rohlager', desc: 'Persönliche oder digitale Selektion des Massivholzstammes nach Maserung und Astbild.', role: 'Beide', actionLabel: 'Material-Termin buchen', actionType: 'appointment' },
      { id: 'ea2t2', phase: 2, title: 'Holztrocknung & Feuchtigkeitsmessung', desc: 'Professionelle Prüfung der Restfeuchte im Holz für dauerhafte Verzugsfreiheit.', role: 'Berater' },
      
      { id: 'ea3t1', phase: 3, title: 'Erstellung der 1:1 Konstruktionszeichnung', desc: 'Ermittlung aller Zargen- und Zapfenverbindungen in millimetergenauer Werkstattzeichnung.', role: 'Berater' },
      { id: 'ea3t2', phase: 3, title: 'Werkstattfreigabe der technischen Zeichnung', desc: 'Finale Prüfung der Abmessungen durch den Kunden vor Baubeginn.', role: 'Kunde', actionLabel: 'Zeichnung freigeben', actionType: 'chat' },
      
      { id: 'ea4t1', phase: 4, title: 'Präziser Zuschnitt & traditionelle Holzverbindung', desc: 'Formgebung und Anfertigung klassischer Schlitz-und-Zapfen- oder Schwalbenschwanz-Verbindungen.', role: 'Berater' },
      { id: 'ea4t2', phase: 4, title: 'Werkstatt-Update & Rohbau-Sichtung', desc: 'Erhalten Sie detaillierte Fotos und Berichte des vormontierten Möbelstücks im Chat.', role: 'Beide' },
      
      { id: 'ea5t1', phase: 5, title: 'Feinschliff & manuelle Oberflächenveredelung', desc: 'Mehrstufiger Handschliff bis zu 320er Körnung und Auftrag schützender Bio-Naturöle.', role: 'Berater' },
      { id: 'ea5t2', phase: 5, title: 'Lieferung & Meisteraufbau im Wunschraum', desc: 'Sichere Anlieferung durch unsere eigene Premium-Lieferflotte.', role: 'Beide' }
    ]
  },
  {
    id: 'restaurierung',
    name: 'Fachgerechte Restaurierung antiker Erbstücke',
    description: 'Erhalt von historischer Substanz, meisterhaft rekonstruiert mit historischen Techniken.',
    icon: 'Cpu',
    category: 'Restaurierung',
    phases: [
      { phase: 1, title: 'Zustandsanalyse', desc: 'Schadens- & Epochen-Check' },
      { phase: 2, title: 'Rückbau', desc: 'Lackleime & Altrestaurierungen' },
      { phase: 3, title: 'Epochenbau', desc: 'Originalgetreue Ergänzung' },
      { phase: 4, title: 'Oberflächenbau', desc: 'Schellack-Handpolitur' },
      { phase: 5, title: 'Konservierung', desc: 'Sicherung & Schutzfilm' }
    ],
    tasks: [
      { id: 're1t1', phase: 1, title: 'Detaillierter Zustandsbericht & Fotodokumentation', desc: 'Umfassendes Gutachten über biologischen Befall (Holzwurm), Trockenrisse und Furnierschäden.', role: 'Berater' },
      { id: 're1t2', phase: 1, title: 'Restaurierungsvertrag unterzeichnen', desc: 'Bestätigung des abgestimmten Restaurierungs-Leitfadens.', role: 'Kunde', actionLabel: 'Restaurierungsvertrag signieren', actionType: 'upload' },
      
      { id: 're2t1', phase: 2, title: 'Upload historischer Fotos oder Provenienz-Belege', desc: 'Sicheres Übermitteln alter Bilddokumente zur epochengerechten Rekonstruktion.', role: 'Kunde', actionLabel: 'Historische Belege hochladen', actionType: 'upload' },
      { id: 're2t2', phase: 2, title: 'Sorgsame Reinigung & Entfernung alter Überzüge', desc: 'Schadstofffreier Abtrag von verharzten Wachsschichten und brüchigen Leimen.', role: 'Berater' },
      
      { id: 're3t1', phase: 3, title: 'Ergänzung fehlender Zierelemente und Furniere', desc: 'Sorgfältige Ergänzung mit antikem Altholz passend zum Baujahr des Möbels.', role: 'Berater' },
      { id: 're3t2', phase: 3, title: 'Abstimmung über Detailrekonstruktion', desc: 'Prüfen rekonstruierter Zierteile vor dem finalen Polieren.', role: 'Beide', actionLabel: 'Rekonstruktion sichten', actionType: 'chat' },
      
      { id: 're4t1', phase: 4, title: 'Aufbau einer handgeriebenen Schellack-Politur', desc: 'Hauchdünner schichtweiser Auftrag von natürlichem Schellack mit dem Polierballen für seidigen Tiefenglanz.', role: 'Berater' }
    ]
  }
];
