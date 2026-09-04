import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️ IMPORTANTE: sostituisci "gymtracker" con il nome ESATTO del tuo
// repository GitHub (es. se il repo è "workout-app", metti "/workout-app/").
// Deve iniziare e finire con "/".
export default defineConfig({
  plugins: [react()],
  base: "/gymtracker/",
});
