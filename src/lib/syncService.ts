import { getAllEntries, upsertEntry, Entry } from "./db";

const SYNC_CONFIG_KEY = "tdah_sync_config";

interface SyncConfig {
  scriptUrl: string;
  autoSync: boolean;
  lastSync: string | null;
}

export function getSyncConfig(): SyncConfig {
  const saved = localStorage.getItem(SYNC_CONFIG_KEY);
  return saved ? JSON.parse(saved) : { scriptUrl: "", autoSync: false, lastSync: null };
}

export function saveSyncConfig(config: SyncConfig) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
}

export async function pushToSheets(): Promise<{ success: boolean; message: string }> {
  const config = getSyncConfig();
  if (!config.scriptUrl) return { success: false, message: "URL do Script não configurada" };

  try {
    const entries = await getAllEntries();
    const response = await fetch(config.scriptUrl, {
      method: "POST",
      mode: "no-cors", // Apps Script doPost often requires no-cors if not handling OPTIONS
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entries),
    });

    // With no-cors, we can't see the response body, but we assume success if no error is thrown
    config.lastSync = new Date().toISOString();
    saveSyncConfig(config);
    return { success: true, message: "Dados enviados com sucesso" };
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
    return { success: false, message: "Falha na sincronização" };
  }
}

// Separate function for actual CORS-friendly push if needed, 
// but usually Apps Script redirect makes it tricky without a specialized proxy.
// However, 'no-cors' works for POST without reading response.

export async function pullFromSheets(): Promise<{ success: boolean; message: string; count?: number }> {
  const config = getSyncConfig();
  if (!config.scriptUrl) return { success: false, message: "URL do Script não configurada" };

  try {
    const response = await fetch(config.scriptUrl);
    if (!response.ok) throw new Error("Erro na rede");
    
    const entries: Entry[] = await response.json();
    let count = 0;
    for (const entry of entries) {
      await upsertEntry(entry);
      count++;
    }

    config.lastSync = new Date().toISOString();
    saveSyncConfig(config);
    return { success: true, message: `${count} registros sincronizados`, count };
  } catch (error) {
    console.error("Erro ao baixar dados:", error);
    return { success: false, message: "Falha ao baixar dados" };
  }
}
