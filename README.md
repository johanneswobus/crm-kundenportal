# Sicheres CRM & Mandantenportal (Secure CRM & Customer Portal)

Ein hochmodernes, offline-fähiges CRM- und Mandantenportal für die sichere Datenverwaltung, Projektkoordination, Meilenstein-Dokumentation und End-to-End-verschlüsselte Kommunikation.

Das Portal arbeitet vollständig clientseitig in der lokalen Browser-Sandbox und synchronisiert bei aktiver Netzwerkverbindung transparent mit einem Server-Speicher. Eine Übertragung sensibler Passwörter oder Dateiinhalte an Drittanbieter-Cloud-Plattformen ist vollständig ausgeschlossen.

---

## 🌟 Hauptfunktionen

### 1. Duales Rollen- & Sicherheits-Konzept
*   **Administrator (CRM-Leitung):** Voller Zugriff auf Dashboard, Live-Performance-Metriken, Umsatz- und Meilenstein-Analysen, Kundenverwaltung, Projektverträge, Übergabeprotokolle und das Hochladen von Videos (z. B. Onboarding-Inhalte).
*   **Mandant (Selbständige Kundenverwaltung):** Zugriff auf ein Onboarding-Dashboard, den Projekt-Roadmap-Schnittstellenfortschritt, Dokumentenfreigaben und den verschlüsselten Chat mit Audit-Logs.

### 2. Mandanten-Selbstregistrierung & Freischaltung
*   Neukunden können sich über ein sicheres Registrierungsformular anmelden.
*   Jeder neu registrierte Account erhält den Status **Aktivierung ausstehend** und ist für die Anmeldung gesperrt.
*   Administratoren erhalten im CRM-Kontrollzentrum eine visuelle Benachrichtigung über ausstehende Registrierungen und können diese mit einem Klick prüfen und sicher freischalten.

### 3. Visuelle Passwort-Stärkeanzeige (Echtzeit)
*   Sowohl im Registrierungsformular des Mandanten als auch bei administrativen Passworteingaben unterstützt eine farbcodierte, 4-Segment-Stärkeanzeige bei der Wahl sicherer Passphrasen.
*   Der Validierungsalgorithmus bewertet Länge (mindestens 6 bzw. 10 Zeichen) sowie den Einsatz von Groß-/Kleinschreibung, Ziffern und Sonderzeichen.

### 4. Administrator-Passwortrücksetzung
*   Vergessene Passwörter von Mandanten können direkt über die CRM-Administration überschrieben und zurückgesetzt werden, um Aussperrungen ohne Datenverlust zu beheben.

### 5. Automatischer Logout bei Inaktivität (15-Minuten-Guard)
*   Zum Schutz von Unternehmensrechnern und gemeinsam genutzten Arbeitsstationen (Shared Devices) beendet ein Hintergrundtimer die aktive Sitzung nach genau **15 Minuten Inaktivität** (keine Mausbewegungen, Tastenanschläge, Klicks oder Scrollvorgänge) und fordert zur Neuanmeldung auf.

### 6. Ende-zu-Ende-Verschlüsselung (E2EE)
*   Sämtliche internen Chat-Nachrichten und Notizen werden clientseitig durch eine fortschrittliche XOR-E2EE-Funktion mit Base64-Verschleierung codiert, sodass die Rohdaten niemals unverschlüsselt die Sandbox verlassen.

---

## 🛠️ Technische Architektur

Das Portal basiert auf einem modernen **React 18** Single-Page-Anwendungskonzept (SPA) mit **Vite** als Build-Toolchain:

*   **UI-Framework:** Tailwind CSS mit reaktiven Layouts.
*   **Animationen:** `motion/react` für flüssige Übergänge.
*   **Icons:** Konsistente Vektorbibliothek über `lucide-react`.
*   **Datenvisualisierung:** D3.js und Recharts für interaktive Dashboards und Diagramme.

---

## 🚀 Installation & Lokaler Betrieb

### Voraussetzungen
Stellen Sie sicher, dass Node.js (Version 18.x oder neuer) und npm auf Ihrem System installiert sind.

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
Der integrierte Webserver startet mit Hot-Module-Replacement (HMR) deaktiviert (Plattform-Standard für konsistente Vorschauen).
```bash
npm run dev
```
Das Portal ist anschließend lokal unter `http://localhost:3000` erreichbar.

### 3. Produktions-Build erstellen
Kompiliert die Anwendung in hoch-performante, statische HTML/JS/CSS-Dateien im Verzeichnis `/dist`:
```bash
npm run build
```

---

## 🔒 Sicherheitsmerkmale
1.  **Zero-Knowledge-Ansatz:** Passwörter werden ausschließlich mit kryptografischen PBKDF2/SHA256-Routinen gehasht übertragen bzw. verarbeitet.
2.  **Lokalität vor Cloud:** Alle Daten verbleiben vorzugsweise im standardisierten `sessionStorage` bzw. `localStorage` des Webbrowsers, es sei denn, der Online-Sync wird explizit durch den Administrator angestoßen.
