# Sicheres CRM & Mandantenportal (Secure CRM & Customer Portal)

Ein hochmodernes, offline-fähiges CRM- und Mandantenportal für die sichere Datenverwaltung, Projektkoordination, Meilenstein-Dokumentation und End-to-End-verschlüsselte Kommunikation.

Das Portal arbeitet vollständig clientseitig in der lokalen Browser-Sandbox und synchronisiert bei aktiver Netzwerkverbindung transparent mit einem Server-Speicher. Eine Übertragung sensibler Passwörter oder Dateiinhalte an Drittanbieter-Cloud-Plattformen ist vollständig ausgeschlossen.

---

## 🌟 Hauptfunktionen & Neuerungen

### 1. Duales Rollen- & Sicherheits-Konzept
*   **Administrator (CRM-Leitung):** Voller Zugriff auf Dashboard, Live-Performance-Metriken, Umsatz- und Meilenstein-Analysen, Kundenverwaltung, Projektverträge, Übergabeprotokolle und das Hochladen von Videos (z. B. Onboarding-Inhalte).
*   **Mandant (Selbständige Kundenverwaltung):** Zugriff auf ein Onboarding-Dashboard, den Projekt-Roadmap-Schnittstellenfortschritt, Dokumentenfreigaben und den verschlüsselten Chat mit Audit-Logs.

### 2. Mandanten-Selbstregistrierung & Freischaltung
*   Neukunden können sich über ein sicheres Registrierungsformular anmelden.
*   Jeder neu registrierte Account erhält den Status **Aktivierung ausstehend** und ist für die Anmeldung gesperrt.
*   Administratoren erhalten im CRM-Kontrollzentrum eine visuelle Benachrichtigung über ausstehende Registrierungen und können diese mit einem Klick prüfen und sicher freischalten.

### 3. Passwort-Generierung & Interaktive Stärke-Checkliste
*   **Echtzeit-Anforderungs-Checkliste:** Das Registrierungsformular wurde um eine Echtzeit-Anforderungs-Checkliste erweitert. Der Benutzer sieht sofort, welche Kriterien (Länge, Sonderzeichen, Großbuchstaben, Kleinbuchstaben, Zahlen) bereits erfüllt sind.
*   **Automatische Passwortgenerierung:** Ein integrierter Zufallsgenerator erstellt mit einem Klick ein starkes, kryptografisch sicheres Passwort, fügt es direkt in das Passwortfeld ein und kopiert es in die Zwischenablage.
*   **Klartext-Umschalter:** Benutzer können Passwörter über ein Augensymbol temporär im Klartext anzeigen lassen.

### 4. Admin-Login-Panel mit reaktivem Feedback
*   Der primäre Anmeldebutton (`#btn-submit`) im Admin-Login-Panel wurde mit sanften Micro-Interaktionen aufgebessert:
    *   **Smooth Hover Transition:** Ein sanfter Skalierungseffekt (`scale-[1.015]`), ein weicher Übergang des Hintergrunds zu einem lebendigen Blau und ein dezenter Schattenwurf vermitteln dem Benutzer interaktive Tiefe.
    *   **Active Click Animation:** Beim Drücken schrumpft das Element minimal (`scale-[0.98]`), um ein klares haptisches Schalt-Feedback zu simulieren.

### 5. Globale Tastatur-Kurzbefehle (Hotkeys)
Für extrem schnelles Navigieren und Arbeiten stehen dem angemeldeten Benutzer globale Tastenkombinationen zur Verfügung:
*   `Strg + D` / `Cmd + D`: Direkter Wechsel aus jeder Ansicht zum Haupt-**Dashboard**.
*   `Strg + K` / `Cmd + K`: Öffnet sofort die **Suche**:
    *   *Administrator:* Wechselt zur **Mandantenverwaltung** (Katalogsicht) und fokussiert automatisch das Suchfeld, um den Cursor sofort startklar zu machen.
    *   *Mandant:* Wechselt zum **WWS-Warenbestand** und fokussiert das Produktsuchfeld für eine blitzschnelle Filterung von Lizenzen und Hardware.

### 6. Login-Sicherheitszähler & Automatisierte Backup-Erinnerung
*   Das System erfasst die Anzahl erfolgreicher Anmeldungen des Administrators im Hintergrund (`admin_login_count` im LocalStorage).
*   Nach jeweils **3 Anmeldungen ohne Sicherung** erscheint am oberen Rand des Management-Dashboards ein optisch unaufdringlicher, animierter Sicherheits-Hinweis.
*   Dieser erinnert den Administrator daran, dass das System standardmäßig in einer gekapselten Sandbox läuft, und schützt vor unbeabsichtigter Cache-Löschung durch Browser-Updates:
    *   *Sofort-Backup:* Ein Klick exportiert die komplette CRM-Datenbank als strukturierte JSON-Schnittstellendatei.
    *   *Intervall-Reset:* Über "Später erinnern" lässt sich der Warnhinweis bis zum nächsten Zyklus stummschalten.

### 7. Vollwertiges JSON-Datenbank-Management (Export & Import)
Das administrative "System zurücksetzen"-Menü wurde zu einem vollwertigen **Datenmanagement-Zentrum** erweitert:
*   **Backup exportieren:** Erstellt ein vollständiges, maschinenlesbares Abbild des aktuellen Kanzleibestands (alle Kunden, Verträge, Notizen, Chat-Verläufe, Termine) in Form einer JSON-Backup-Datei.
*   **Backup einspielen (Restore):** Ermöglicht das Wiederherstellen eines älteren Systemstands. Vor dem Einspielen prüft das System die JSON-Struktur auf Konsistenz und bittet den Administrator um eine Bestätigung, um versehentliches Überschreiben von Echtdaten auszuschließen.

### 8. Ende-zu-Ende-Verschlüsselung (E2EE)
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

---

## ⚠️ WICHTIGER RECHTLICHER HINWEIS / DISCLAIMER
*(Keine Haftung für irgendetwas, Nutzung auf eigene Gefahr)*

1. **Keine Gewährleistung (As-Is):** Diese Applikation wird im vorliegenden Zustand ("as-is" oder "wie besehen") bereitgestellt. Es wird keinerlei Garantie oder Versicherung – weder ausdrücklich noch stillschweigend – für die Funktionsfähigkeit, Richtigkeit, Vollständigkeit, Stabilität, Datensicherheit oder Eignung für einen bestimmten Zweck dieser Software übernommen.
2. **Haftungsausschluss:** Die Entwickler und Bereitsteller dieser Software haften in keinem Fall für jegliche direkten, indirekten, zufälligen, besonderen oder Folgeschäden. Dies gilt insbesondere für Schäden aus Datenverlust (z.B. durch das Löschen des Caches, Browser-Updates oder unsachgemäßen Datenbank-Import), entgangenem Gewinn, Betriebsunterbrechungen oder sonstige wirtschaftliche Verluste, die durch die Nutzung oder Unfähigkeit zur Nutzung der Applikation entstehen.
3. **Eigenverantwortung bei Backups:** Da das CRM-System primär dezentral in der lokalen Browser-Sandbox (`localStorage` & `sessionStorage`) operiert, obliegt die regelmäßige Sicherung der Daten (über die integrierte Backup-Exportfunktion) vollständig der alleinigen Verantwortung des Administrators. Verlorene lokale Daten können bei Cache-Leerung des Benutzers nicht serverseitig wiederhergestellt werden, sofern kein Backup lokal vorgehalten wird.
4. **Keine Rechts- oder Steuerberatung:** Die bereitgestellten Vorlagen für Dienstleistungsverträge, NDAs, Kostenvoranschläge und Rechnungsmodule sind reine Demo-Beispiele. Sie ersetzen keine qualifizierte Rechts- oder Steuerberatung. Für die rechtliche Gültigkeit von im Portal vorgenommenen digitalen Signaturen wird keine Gewähr übernommen.
