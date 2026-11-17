# 📖 Administrator- & Mandantenportal: Das Handbuch der Datenpflege & Systemsicherheit

Willkommen im offiziellen Handbucheintrag für Ihr **Sicheres CRM & Mandantenportal**. Dieses Handbuch dient Ihnen als umfassender Leitfaden zur optimalen Pflege Ihrer Datenbestände, zum Verständnis der doppelten Datenspeicherung und zur Konfiguration der kritischen Systemsicherheitskomponenten.

---

## 💾 1. Neue Speicher-Architektur & Speicherort im System

Um maximale Zuverlässigkeit, Datensouveränität und Transparenz zu gewährleisten, arbeitet dieses Portal mit einem **Dualen Offline-First-Speicherkonzept**, welches nun durch eine strukturierte Server-Dokumentenverwaltung abgerundet wird.

### 📁 Der neue Speicherort im Dateiverzeichnis: `/data/crm_data.json`
Zuvor wurden die Serverdaten direkt im Root-Ordner platziert. Für eine saubere Strukturierung und einfache Auffindbarkeit im File-Explorer des Servers wurde das System umgestellt:
*   **Ausschließlicher Speicherpfad:** `/data/crm_data.json`
*   **Sicherheitsvorteil:** Alle Kanzleidaten, Kundendatensätze, Verträge, verschlüsselte Chat-Protokolle, Inventare und Logdateien liegen gekapselt in diesem Ordner.
*   **Automatische Migration:** Das System prüft beim Booten selbstständig, ob eine alte `crm_data.json` im Stammverzeichnis existiert, verschiebt diese verlustfrei in den neuen Ordner `/data/` und bereinigt das Hauptverzeichnis.

### 🔄 Wie die Synchronisation (Dualer Sync) funktioniert
Das Portal greift auf ein intelligentes Zusammenspiel zu:
1.  **Clientseitige Sandbox (Browser LocalStorage):** Damit das Portal auch bei Verbindungsabbrüchen blitzschnell reagiert und voll offline-fähig bleibt, werden alle Änderungen sofort im sicheren `localStorage` des Browsers des jeweiligen Benutzers abgelegt.
2.  **Serverseitiger Sync:** Bei bestehender Internetverbindung synchronisiert das Frontend im Hintergrund transparent direkt mit der JSON-Datenbank unter `/data/crm_data.json`.
3.  **Fehlerschutz:** Sollte der Browser-Cache geleert werden, lädt das System die validierten Daten beim nächsten Login direkt wieder vom Server.

---

## 🛡️ 2. Erweiterte Sicherheitsfunktionen & Echtzeit-Monitoring

### 📊 Visualisierung fehlgeschlagener Logins (24h-Audit-Überwachung)
Unter dem Tab **'Audit Logs'** im Admin-Dashboard befindet sich eine eigens implementierte, interaktive Echtzeit-Grafik:
*   **Aggregierter Stundenverlauf:** Ein flüssiges Area-Chart (Flächendiagramm) visualisiert Minute für Minute alle fehlerhaften Login-Versuche der letzten 24 Stunden.
*   **Automatische IP-Erfassung & Anomalie-Erkennung:** Versucht ein Angreifer, sich mit falschem Passwort anzumelden, wird dies sofort mit IP-Adresse, Benutzername und Zeitstempel registriert. Das System berechnet das Bedrohungslevel in drei Stufen:
    *   🟢 **Nennenswert Sicher:** 0 Fehlversuche.
    *   🟡 **Warnung:** Weniger als 5 Fehlversuche (einzelne Vertipper).
    *   🔴 **Kritisch (Brute-Force):** Ab 5 Fehlversuchen innerhalb des Zeitfensters wird die Bedrohung eskaliert und rot pulsierend hervorgehoben.
*   **Simulationstaster ("Fehler simulieren"):** Dem Administrator steht ein Testschalter zur Verfügung, mit dem zufällige, realistische Brute-Force-Angriffsversuche simuliert werden können, um die Reaktionsfähigkeit des Systems live zu testen.

### ⏱️ Inaktivitäts-Abmeldung & 60-Sekunden Countdown-Dialog
Zum Schutz von Mandantendaten auf öffentlichen oder geteilten Endgeräten ist ein **Inaktivitäts-Wächter** aktiv:
*   **Das Standardlimit:** Nach 15 Minuten absoluter Inaktivität (keine Mausbewegungen, Klicks, Tastatureingaben) wird der Benutzer automatisch ausgeloggt.
*   **Der Vorwarn-Dialog:** Genau **60 Sekunden** vor dem geplanten automatischen Logout öffnet sich ein unübersehbarer, weich animierter Countdown-Dialog auf dem Bildschirm.
*   **Sitzung verlängern:** Ein auffälliger, blauer Taster **"Aktiv bleiben & Sitzung verlängern"** setzt den Systemtimer mit einem einzigen Klick wieder auf das volle Limit zurück.
*   **Manueller Sofort-Logout:** Über die sekundäre Schaltfläche "Jetzt abmelden" kann der Benutzer die Sitzung sofort geordnet und sicher beenden.

### 🔐 Verschlüsselungsstandards (Ende-zu-Ende XOR-E2EE)
Sämtliche internen Direktnachrichten und vertraulichen Notizen werden im Frontend codiert, bevor sie an den Server gesendet werden. Ein Auslesen der Rohdaten aus der Datei `/data/crm_data.json` ist ohne den clientseitigen Sitzungsschlüssel technisch unmöglich.

---

## 📥 3. Datenimport, Export & Notfall-Datenrettung

### 🔍 A. Integritätsprüfung (Daten-Konsistenz-Zentrum)
Die neu integrierte **Integritätsprüfung** im Admin-Dashboard bietet dem Benutzer eine blitzschnelle, vollumfängliche Validierung aller geladenen Datensätze direkt aus dem Serverordner `/data/crm_data.json`:
*   **Strukturelle Verifizierung:** Es wird die physische Existenz und formale Repräsentanz aller registrierten Kunden, Dokumente, Transaktionen und Chat-Protokolle geprüft.
*   **Bestätigungszentrale:** Bei erfolgreicher Prüfung erhält der Administrator ein hochauflösendes Statusprotokoll als Dialog. Es bestätigt, dass keinerlei beschädigte Felder oder verwaiste Verknüpfungen vorliegen.

### 📡 B. Visualisierter Daten-Sicherungsstatus (Sidebar)
Um maximale Transparenz über den lokalen Speicherzustand zu gewährleisten, verfügt die Sidebar über ein permanentes Wächter-Modul:
*   **Echtzeit-Feedback:** Es zeigt den exakten dateigeprüften Speicherort (`/data/crm_data.json`) sowie den genauen **Zeitstempel** des letzten erfolgreichen Server-Sicherungsvorgangs an.
*   **Zustandserkennung:**
    *   🟢 **Server-Sync:** Alle lokal vorgenommenen Änderungen wurden verlustfrei und dauerhaft auf den Server übertragen.
    *   🟡 **Sichern...:** Daten-Aufbereitung läuft, der Speichertausch mit der Festplatte wird abgewickelt.
    *   🔴 **Sync-Fehler:** Verbindungsproblem oder Dateizugriff blockiert.

### 🔐 C. Verschlüsselte Offline-Datensicherung (Backups)
*   **Verschlüsselter Export:** Der Taster "Sicheres Backup" ermöglicht es dem Administrator, die gesamten CRM-Bestände als hochgradig verschlüsselte JSON-Datei herunterzuladen. Der Administrator bestimmt beim Export eine **Passphrase**. Das Paket wird anschließend im Browser mithilfe eines SHA-256 Stream-Ciphers codiert. Ohne dieses Passwort ist das Lesen der Datei absolut ausgeschlossen (End-to-End-Schutz für Kanzleigeheimnisse).
*   **Transparente Wiederherstellung:** Beim Einspielen einer solchen Backupdatei erkennt der Import-Assistent die Verschlüsselung automatisch und fragt den Administrator nach der zugehörigen Passphrase. Bei korrekter Eingabe wird die Mappe entschlüsselt, verifiziert und verlustfrei eingespielt. Gelingt die Entschlüsselung nicht, wird der Import sicherheitsgesperrt.

### 📋 Fehlerbehebung im Notfall
| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| **Änderungen werden nach Page-Reload nicht angezeigt** | Browser sperrt LocalStorage-Zugriff in Sandbox-Frames. | Öffnen Sie das Portal über die Option "In neuem Tab öffnen", um uneingeschränkten Zugriff auf lokale Storages zu gewährleisten. |
| **Sitzung warnt ununterbrochen vor Ablauf** | Der Countdown-Dialog bleibt hängen. | Klicken Sie auf "Sitzung verlängern". Sollte dies nicht helfen, führen Sie einen sicheren Logout durch und loggen Sie sich neu ein. |
| **Die Datei `/data/crm_data.json` fehlt** | Erster Systemstart bzw. Serverneustart. | Keine Sorge! Beim ersten Seitenaufruf wird die Datei mit dem Standard-Kanzleibestand automatisch neu im Ordner `/data/` angelegt. |

---

*Dieses Handbuch ist Bestandteil der internen Kanzlei-Dokumentation für das Administrator- und Mandantenportal. Halten Sie Ihre Zugangsdaten stets geheim und führen Sie wöchentlich Backups durch.*
