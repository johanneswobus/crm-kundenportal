# 🔐 CRM Beratung – Sicheres CRM- & Mandantenportal

Ein modernes, **offline-fähiges CRM- und Mandantenportal** auf Basis von **React 19**, **Express** und einer vollständig integrierten **SQLite-Datenbank (`/data/crm.db`)**. Entwickelt für Beratungsunternehmen, Kanzleien und Agenturen zur sicheren Verwaltung von Mandanten, Projekten, Dokumenten, Verträgen (inkl. digitaler Signatur), Rechnungen, Warenwirtschaft (WWS) und Ende-zu-Ende-verschlüsselter Kommunikation.

---

## Inhaltsverzeichnis

1. [Funktionsumfang im Überblick](#-funktionsumfang-im-überblick)
2. [Systemvoraussetzungen](#-systemvoraussetzungen)
3. [Installationsanleitung (Lokal & Produktiv)](#-installationsanleitung-lokal--produktiv)
4. [Standard-Zugangsdaten](#-standard-zugangsdaten)
5. [SQLite-Datenbank & Datensicherung](#-sqlite-datenbank--datensicherung)
6. [Sicherheit & Tastaturkürzel](#-sicherheit--tastaturkürzel)
7. [API-Endpunkte](#-api-endpunkte)
8. [Ausführliches HTML-Handbuch](#-ausführliches-html-handbuch)

---

## 🌟 Funktionsumfang im Überblick

### Administrator-Bereich (CRM-Leitung)
- **Management Dashboard:** Live-Übersicht zu Mandanten, **Neuanmeldungen**, **Dokumenten-Speicherverbrauch**, offenen Rechnungen, **24h-Login-Monitoring** (Flächendiagramm mit Brute-Force-Erkennung & Simulator), **SQLite-Kontrollzentrum** und **Daten-Integritätsprüfung**.
- **Benutzer-Aktionen (Chronologisches Audit-Log):** Eigene Tab-Ansicht aller System- und Benutzerereignisse als kalendertag-gruppierte **chronologische Zeitleiste** oder **Tabellenansicht** – inkl. KPI-Karten, Status-/Benutzer-/Volltextfilter, Sortierumkehr, CSV-Export und Protokoll-Bereinigung.
- **Kundenverwaltung:** Anlegen, Bearbeiten, Freischalten selbstregistrierter Neukunden, Passwort-Zurücksetzung, Statusfilter (*Neukunde*, *Aktiv*, *Stammkunde*, *Inaktiv*), Sortierung nach Registrierungsdatum sowie **CSV- und JSON-Export/Import** der Kundenliste.
- **Kunden-Projekte & Fahrplan-Schablonen:** 5-Phasen-Projektfahrplan (Roadmap) pro Mandant, eigener **Schablonen-Builder**, digitales **Übergabeprotokoll** und Onboarding-Daten.
- **Warenwirtschaft (WWS):** Artikelstamm mit SKU/Lagerort, Mindestbestands-Warnung, Lagerbewegungen, Lieferantenverwaltung und Bestellwesen.
- **Dokumenten-Zentrale & DGM-Signatur:** Verwaltung hochgeladener Verträge, PDFs und Medien inkl. kryptografischer Signaturprüfung (HMAC-SHA256).
- **Direktnachrichten (DMs):** Direkter Chat mit Mandanten inklusive Dateianhängen und optionaler E2EE-Verschlüsselung.
- **Termine & Planung:** Zentrale Terminverwaltung mit Status- und Mandantenzuordnung.
- **Finanzen & Rechnungen:** Rechnungserstellung mit Einzelposten, automatischer Brutto/Netto/USt.-Berechnung (19 % USt. sowie steuerfreie Courtagen nach § 4 Nr. 11 UStG) und **Steuerbüro-CSV-Export**.
- **KI-Bot Training:** Lokale, kostenfreie NLP-Keyword-Engine mit Trigger-Verwaltung und Auswertung unbeantworteter Kundenfragen (*Unresolved Queries*).

### Mandantenportal (Kundenansicht)
- **Kunden-Dashboard & Echtzeit-Fahrplan:** Transparente Darstellung der aktuellen Projektphase und Aufgaben.
- **Vertragsübersicht & DGM-Signatur:** Verträge digital prüfen und direkt im Browser rechtssicher zeichnen.
- **Dokumente & Uploads / Warenbestand (WWS) / Meine Rechnungen / Termine / DMs / Profil / Hilfe.**

---

## 💻 Systemvoraussetzungen

| Komponente | Mindestanforderung | Hinweis |
| :--- | :--- | :--- |
| **Node.js** | **v22.5.0 oder neuer** (empfohlen: **Node 22 LTS**) | Zwingend erforderlich für das integrierte Modul `node:sqlite` (`DatabaseSync`) |
| **npm** | v10+ | Wird mit Node.js mitgeliefert |
| **Betriebssystem** | Linux, macOS oder Windows | Getestet unter Linux (x64/ARM64) |
| **Port** | `3000` (Standard) | Konfigurierbar im Server |

> **Wichtig:** Prüfen Sie vor der Installation Ihre Node-Version mit `node -v`. Ältere Versionen (z. B. Node 18 oder Node 20) enthalten `node:sqlite` noch nicht!

---

## 🚀 Installationsanleitung (Lokal & Produktiv)

### Schritt 1: Projektdateien bereitstellen
Klonen Sie das Repository oder entpacken Sie das Projektarchiv in ein Verzeichnis Ihrer Wahl und wechseln Sie in den Projektordner:

```bash
git clone <REPOSITORY-URL> crm-beratung
cd crm-beratung
```

### Schritt 2: Node.js-Version prüfen
Stellen Sie sicher, dass Node.js ≥ 22.5 aktiv ist:

```bash
node -v
# Erwartete Ausgabe z. B.: v22.23.2
```

### Schritt 3: Abhängigkeiten installieren
Installieren Sie alle benötigten Pakete:

```bash
npm install
```

### Schritt 4: Umgebungsvariablen konfigurieren (optional)
Kopieren Sie bei Bedarf die Vorlage `.env.example` nach `.env` und passen Sie Werte (z. B. `APP_URL` oder optional `GEMINI_API_KEY`) an:

```bash
cp .env.example .env
```

*(Für den reinen Offline-/SQLite-CRM-Betrieb sind keine externen API-Schlüssel erforderlich.)*

### Schritt 5: Anwendung starten

#### Variante A – Entwicklungsmodus (mit Vite Middleware)
```bash
npm run dev
```
Der Server startet auf `http://0.0.0.0:3000` (lokal erreichbar unter **`http://localhost:3000`**).
Beim ersten Start wird automatisch das Verzeichnis `./data/` sowie die SQLite-Datenbank `./data/crm.db` erstellt.

#### Variante B – Produktionsbetrieb (Build + Node-Server)
1. Frontend und Server kompilieren:
   ```bash
   npm run build
   ```
   *(Erstellt das statische Frontend in `dist/` und das Server-Bundle `dist/server.cjs`.)*

2. TypeScript-Prüfung (optional zur Verifikation):
   ```bash
   npm run lint
   ```

3. Produktions-Server starten:
   ```bash
   NODE_ENV=production npm start
   ```
   *(Führt `node dist/server.cjs` aus und stellt die App sowie alle APIs auf Port `3000` bereit.)*

#### Hinweise für den Dauerbetrieb (PM2 / systemd)
Für einen Server-Dauerbetrieb empfiehlt sich ein Prozessmanager wie **PM2**:
```bash
npm install -g pm2
NODE_ENV=production pm2 start dist/server.cjs --name crm-beratung
pm2 save
```

---

## 🔑 Standard-Zugangsdaten

Beim ersten Start stehen vorkonfigurierte Demo-Konten zur Verfügung:

| Rolle | Benutzername | Passwort | Hinweis |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | **Nach dem ersten Login umgehend im Admin-Profil ändern!** |
| **Mandant (Demo 1)** | `max.muster` | `kunde123` | Stammkunde „Max Mustermann (Muster GmbH)“ |
| **Mandant (Demo 2)** | `anna.schmidt` | `kunde123` | Neukunde „Anna Schmidt (Schmidt AG)“ |

Neue Mandanten können sich über den Registrierungslink auf der Anmeldeseite selbst anmelden (inkl. Passwort-Generator und Echtzeit-Stärkeprüfung). Neu registrierte Konten bleiben aus Sicherheitsgründen gesperrt, bis ein Administrator sie in der **Kundenverwaltung** freischaltet.

---

## 💾 SQLite-Datenbank & Datensicherung

Die gesamte Anwendung wird vollständig über eine relationale **SQLite-Datenbank** im **WAL-Modus** (`Write-Ahead Logging`) unter **`/data/crm.db`** persistiert:

- **15 Tabellen:** `app_state`, `admin_profile`, `customers`, `files`, `messages`, `appointments`, `bot_rules`, `unresolved_queries`, `invoices`, `custom_templates`, `inventory_products`, `suppliers`, `stock_movements`, `supplier_orders`, `audit_logs`.
- **Automatische Migration:** Liegt beim Serverstart eine ältere `/data/crm_data.json` vor, importiert der Server diese automatisch und verlustfrei in `crm.db`.
- **Dualer Offline-Schutz:** Änderungen werden im Browser (`localStorage`) zwischengespeichert und bei aktiver Server-Verbindung automatisch mit SQLite synchronisiert. Der aktuelle Status (`SQLite-Sync`, `Sichern...`, `Sync-Fehler`) sowie der letzte Zeitstempel sind dauerhaft in der Sidebar sichtbar.
- **Backup-Optionen im Admin-Dashboard:**
  1. **SQLite `.db`-Datei herunterladen** (`GET /api/sqlite/download`) & wieder importieren (`POST /api/sqlite/import-db`).
  2. **SQLite-Stand als JSON exportieren** (`GET /api/sqlite/export-json`) für menschenlesbare lokale Sicherungen.
  3. **Passphrasen-geschütztes E2EE-Backup** (SHA-256 Stream-Cipher im Browser) inklusive Wiederherstellungs-Assistent.
  4. **Kundenliste einzeln als CSV oder JSON** direkt aus der Kundenverwaltung exportieren.

---

## 🛡️ Sicherheit & Tastaturkürzel

- **Brute-Force-Schutz:** Nach 5 fehlgeschlagenen Login-Versuchen greift automatisch eine 30-sekündige Anmeldesperre; jeder Fehlversuch wird im Audit-Log vermerkt.
- **Inaktivitäts-Abmeldung:** Nach 15 Minuten Inaktivität erfolgt ein automatischer Logout; 60 Sekunden vorher warnt ein Countdown-Modal mit 1-Klick-Verlängerung.
- **Passwort-Hashing:** SHA-256-Hashing im Client vor Speicherung.
- **Tastaturkürzel (im eingeloggten Portal):**
  - `Strg + D` / `Cmd + D`: Direkt zum **Dashboard** wechseln
  - `Strg + K` / `Cmd + K`: Globale **Kunden- bzw. Produktsuche** öffnen

---

## 🔌 API-Endpunkte

| Methode | Pfad | Beschreibung |
| :--- | :--- | :--- |
| `GET` | `/api/crm-data` | Lädt den kompletten CRM-Datenbestand aus SQLite |
| `POST` | `/api/crm-data` | Speichert den gesamten CRM-Bestand transaktional in SQLite |
| `GET` | `/api/sqlite/status` | Liefert DB-Pfad, Dateigröße, WAL-Modus und Zeilenzahlen aller Tabellen |
| `GET` | `/api/sqlite/download` | Lädt die binäre SQLite-Datei (`crm_datenbank_YYYY-MM-DD.db`) herunter |
| `GET` | `/api/sqlite/export-json` | Exportiert den aktuellen SQLite-Stand als JSON (`crm_sqlite_backup_YYYY-MM-DD.json`) |
| `POST` | `/api/sqlite/import-db` | Importiert eine hochgeladene `.db`-Datei (Base64) und ersetzt den aktiven Datenbestand |
| `GET` / `POST` | `/api/sqlite/settings/:key` | Liest/schreibt Schlüssel-Wert-Einstellungen in `app_state` |
| `POST` | `/api/debug-log` | Protokolliert Client-Fehler in `/data/client_debug.json` |
| `GET` | `/handbuch.html` | Öffnet das vollständige HTML-Handbuch im Browser |

---

## 📘 Ausführliches HTML-Handbuch

Eine umfassende, eigenständige und druckfähige HTML-Dokumentation mit allen Modulen, Architekturdiagramm, API-Referenz, Backup-Leitfaden und Schritt-für-Schritt-Installationsanleitung liegt im Stammverzeichnis:

👉 **[`HANDBUCH.html`](./HANDBUCH.html)** *(direkt im Browser öffnen oder bei laufendem Server unter `http://localhost:3000/handbuch.html` aufrufen)*
