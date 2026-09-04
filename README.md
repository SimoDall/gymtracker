# GymTracker — Guida al deploy su GitHub Pages

App di tracking allenamenti (stile Hevy) in italiano, con salvataggio locale
nel browser e backup/ripristino via file Excel (.xlsx).

## 0. Requisiti
- Node.js installato (verifica con `node -v`; se manca, scaricalo da nodejs.org)
- Un account GitHub gratuito (github.com)

## 1. Crea il repository su GitHub
1. Vai su github.com → **New repository**.
2. Nome repo, es. `gymtracker` (puoi cambiarlo, basta poi aggiornare `vite.config.js`).
3. Lascialo **pubblico** (i repo privati su GitHub Pages gratuito non pubblicano il sito).
4. Non aggiungere README/gitignore da GitHub (li hai già qui).

## 2. Aggiorna `vite.config.js`
Apri `vite.config.js` in questa cartella e cambia `base: "/gymtracker/"` mettendo
il nome ESATTO del tuo repository, tra gli slash. Es. se il repo si chiama
`workout-app`: `base: "/workout-app/"`.

## 3. Installa le dipendenze
Apri il terminale in questa cartella e lancia:
```bash
npm install
```

## 4. Prova in locale (facoltativo ma consigliato)
```bash
npm run dev
```
Apri l'indirizzo mostrato (es. http://localhost:5173) e verifica che l'app funzioni.
Premi Ctrl+C per fermarla quando hai finito.

## 5. Collega la cartella al repository GitHub
```bash
git init
git add .
git commit -m "Prima versione GymTracker"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/gymtracker.git
git push -u origin main
```
(Sostituisci `TUO-USERNAME` e `gymtracker` con i tuoi.)

## 6. Deploy su GitHub Pages
```bash
npm run deploy
```
Questo comando builda l'app e la pubblica automaticamente sul branch `gh-pages`
del repository (grazie al pacchetto `gh-pages` già incluso).

## 7. Attiva GitHub Pages
1. Sul repository GitHub, vai su **Settings → Pages**.
2. In "Build and deployment" → Source: **Deploy from a branch**.
3. Branch: seleziona **gh-pages** / cartella **/ (root)** → Save.
4. Dopo 1-2 minuti l'URL apparirà in cima alla pagina, tipo:
   `https://tuo-username.github.io/gymtracker/`

## 8. Installala sul tuo iPhone
1. Apri quell'URL con **Safari** (non Chrome — l'installazione PWA su iOS
   funziona solo da Safari).
2. Tocca l'icona **Condividi** (il quadrato con la freccia in su).
3. Scorri e tocca **"Aggiungi alla schermata Home"**.
4. Trovi l'icona di GymTracker in Home: apre l'app a schermo intero, come una vera app.

## 9. Aggiornare l'app in futuro
Ogni volta che vuoi pubblicare una modifica:
```bash
npm run deploy
```
Poi su iPhone: chiudi l'app da Safari/Home e riaprila (a volte serve
ricaricare una volta la pagina per scaricare la nuova versione).

## Backup dei tuoi dati (importante!)
I dati vivono nel browser di questo specifico dispositivo/URL. Usa
**Progressi → Backup Excel → Esporta** dopo ogni allenamento (o una volta a
settimana) e salva il file su iCloud Drive. Se reinstalli l'app o cambi
telefono, apri l'app e usa **Importa** per recuperare tutto lo storico.

## Nota sull'import scheda da PDF/foto
In questa build statica il riconoscimento automatico della scheda da PDF/foto
è disattivato (richiederebbe una chiave API dietro un server, che GitHub
Pages da solo non fornisce). Puoi comunque:
- usare **"Carica scheda d'esempio"** nella tab Routine come base di partenza;
- creare/modificare le routine a mano dall'editor (icona matita);
- oppure, se vuoi riattivare il riconoscimento automatico, chiedimi la guida
  per aggiungere una funzione serverless (es. su Vercel) con la tua chiave
  Anthropic API.
