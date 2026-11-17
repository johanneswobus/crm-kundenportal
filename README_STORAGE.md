# 💾 Dokumentation der Speicher-Architektur (Local Server Storage)

Dieses Dokument beschreibt im Detail die robuste, auditsichere Speicher-Architektur unseres **Sicheren CRM & Mandantenportals**. 

Aus datenschutzrechtlichen und datensicherheitstechnischen Gründen arbeitet dieses System mit einer **mandantenisolierten, vollständig lokalen Serverdatenbank** im Dateisystem des Containers und vermeidet experimentelle, unsichere Client-Only-Modelle im Browser.

---

## 📁 1. Das dedizierte Datenverzeichnis: `/data/crm_data.json`

Alle Kanzlei- und Kundendaten, Verträge, verschlüsselte Chat-Dialoge, Logdateien, Warenbestände der Warenwirtschaft (WWS) und Rechnungsmodule werden in einer einzigen, strukturierten JSON-Datenbank direkt auf dem Server persistiert.

*   **Der absolute Container-Pfad:** `/data/crm_data.json`
*   **Kein Browser-Storage für Core-Daten:** Das Frontend synchronisiert sämtliche Mutationsschritte (Hinzufügen eines Kunden, Signieren von Verträgen, Senden von Nachrichten) unverzüglich an den Express-Server, welcher diese direkt im lokalen `data`-Ordner auf die Festplatte schreibt.
*   **Automatischer Migrationsschutz:** 
    Beim Anfahren des Node.js-Dienstes (`server.ts`) wird im Stammverzeichnis geprüft, ob eine veraltete Datei `crm_data.json` existiert. Wenn ja, wird diese automatisch und ohne Datenverlust nach `/data/crm_data.json` transferiert, und die alte Datei wird aus dem Root-Verzeichnis gelöscht.

---

## 🔄 2. Dual-Synchronisation & Statusüberwachung

Um trotz Internet-Verbindungsabbrüchen extreme Performance und Ausfallsicherheit zu garantieren, nutzt die Anwendung ein duales System:

1.  **Immer-Bereit Cache (Client-Caching):** Änderungen werden für schnelles lokales Rendern im `localStorage` gehalten.
2.  **Verbindlicher Server-Sync:** Sobald das System eine Änderung registriert und "Online" ist, wird im Hintergrund ein `POST`-Request an das Express-Backend (`/api/crm-data`) gefeuert, das die JSON auf dem Server überschreibt.
3.  **📡 Sidebar-Visualisierung (Speicherzeitpunkt):**
    Die Sidebar enthält ein Wächter-Modul, das den exakten Zustand anzeigt:
    *   🟢 **Server-Sync:** Alle Daten sind erfolgreich mit `/data/crm_data.json` abgeglichen. Der genaue Zeitstempel (z. B. `15:42:10`) wird im Sekundentakt aktualisiert.
    *   🟡 **Sichern...:** Eine Datenübertragung wird gerade im Hintergrund abgewickelt.
    *   🔴 **Sync-Fehler:** Die Daten konnten nicht auf dem Server abgelegt werden (z. B. Verbindungsabbruch oder geschützte Dateiberechtigungen).

---

## 📥 3. Anleitung zur manuellen Datensicherung (Backups)

Da das System im lokalen Ordner `/data` auf dem Server speichert, haben Sie als Administrator die vollständige physikalische Kontrolle über Ihre Datenbestände.

### Methode A: Physisches Kopieren des Server-Ordners (Empfohlen)
Da es sich um eine Standard-JSON-Datei handelt, können Sie ein Backup ganz einfach auf Datei-Ebene erstellen:
1. Verbinden Sie sich per SSH, SFTP oder verwenden Sie das Terminal im Administrator-Panel.
2. Kopieren Sie den gesamten Ordner `data` an einen sicheren Ort:
   ```bash
   cp -r ./data ./data_backup_$(date +%F)
   ```
3. Zur Wiederherstellung stoppen Sie den Server, kopieren die Backup-Datei zurück nach `/data/crm_data.json` und starten den Server neu.

### Methode B: Kryptographisch verschlüsseltes JSON-Backup (Admin-Dashboard)
Für Anwender, die keinen direkten SSH-Zugriff haben, bietet das Admin-Dashboard im **Integritätsbereich** einen geschützten Export:
1. Navigieren Sie im Admin-Bereich zum Tab **Dashboard / Einstellungen**.
2. Klicken Sie auf **"Sicheres Backup"**.
3. Geben Sie ein Passwort (Passphrase) ein. Die Datei wird mittels SHA-256 kryptographisch verschlüsselt auf Ihren lokalen Computer heruntergeladen (`crm_datenbank_secure_backup_YYYY-MM-DD.json`).
4. **Wiederherstellung:** Über den Datei-Importor können Sie die verschlüsselte Datei hochladen. Das Portal fordert Sie automatisch zur Eingabe der Passphrase auf. Ist diese korrekt, wird das Backup transparent entschlüsselt, auf Konsistenz geprüft und direkt in `/data/crm_data.json` auf den Server geschrieben.

---

## 🔍 4. Datenintegritätsprüfung

Vor jedem Backup oder großen Release empfiehlt sich die Durchführung der **Integritätsprüfung** im Admin-Dashboard:
*   Ein Klick analysiert alle relationalen Beziehungen in der Datei `/data/crm_data.json`.
*   Das System prüft, ob Kunden, signierte Verträge, Rechnungsdatensätze und System-Nachrichten fehlerfrei geladen und den korrekten Mandanten zugewiesen sind.
*   Nach erfolgreicher Verifizierung wird Ihnen ein detaillierter Bericht mit sämtlichen validierten Datensätzen und Feldern als Bestätigung angezeigt.
