import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { getSyncConfig, saveSyncConfig, pushToSheets, pullFromSheets } from "@/lib/syncService";
import { getAllEntries, importData, Entry } from "@/lib/db";
import * as XLSX from "xlsx";
import { 
  Cloud, CloudUpload, CloudDownload, 
  Settings as SettingsIcon, Download, Upload,
  Database
} from "lucide-react";

export default function Settings() {
  const [config, setConfig] = useState(getSyncConfig());
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveSyncConfig(config);
  }, [config]);

  const handleExport = async () => {
    try {
      const entries = await getAllEntries();
      if (!entries.length) {
        toast("Nenhum dado para exportar", "error");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(entries);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Diário TDAH");
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `backup_tdah_${timestamp}.xlsx`);
      toast("Planilha exportada ✓");
    } catch (err) {
      console.error(err);
      toast("Erro ao exportar", "error");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as Entry[];

        if (!data.length) throw new Error("Arquivo vazio");

        await importData(data);
        toast("Dados importados com sucesso ✓");
      } catch (err) {
        console.error(err);
        toast("Erro ao importar planilha. Verifique o arquivo.", "error");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // Reset
  };

  const handlePush = async () => {
    setSyncing(true);
    const result = await pushToSheets();
    setSyncing(false);
    toast(result.message, result.success ? "success" : "error");
    if (result.success) setConfig(getSyncConfig());
  };

  const handlePull = async () => {
    setSyncing(true);
    const result = await pullFromSheets();
    setSyncing(false);
    toast(result.message, result.success ? "success" : "error");
    if (result.success) setConfig(getSyncConfig());
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight transition-all">
          <SettingsIcon size={24} className="text-muted-foreground" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">Gerencie sua sincronização em nuvem.</p>
      </header>

      <Card className="border-border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2 uppercase">
            <Cloud size={16} />
            Google Sheets Sync
          </CardTitle>
          <CardDescription>
            Conecte seu diário ao Google Sheets para acesso multiplataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="scriptUrl" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              URL do Script (Apps Script)
            </Label>
            <Input
              id="scriptUrl"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={config.scriptUrl}
              onChange={(e) => setConfig({ ...config, scriptUrl: e.target.value })}
              className="bg-muted/50 focus-visible:ring-1 border-border/50 text-sm h-11"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="autoSync"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="w-4 h-4 rounded border-border text-foreground focus:ring-1 focus:ring-foreground accent-foreground"
            />
            <Label htmlFor="autoSync" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider cursor-pointer">
              Sincronizar automaticamente ao salvar
            </Label>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full flex items-center justify-center gap-2 h-11 bg-foreground text-background hover:bg-foreground/90 transition-all font-semibold rounded"
              onClick={handlePush}
              disabled={syncing || !config.scriptUrl}
            >
              <CloudUpload size={18} />
              {syncing ? "Sincronizando..." : "Enviar Dados para Nuvem"}
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11 border-border/50 text-foreground hover:bg-accent transition-all font-semibold rounded"
              onClick={handlePull}
              disabled={syncing || !config.scriptUrl}
            >
              <CloudDownload size={18} />
              {syncing ? "Sincronizando..." : "Baixar Dados da Nuvem"}
            </Button>
          </div>

          {config.lastSync && (
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Último Sync: {new Date(config.lastSync).toLocaleString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2 uppercase">
            <Database size={16} />
            Backup Local (Excel)
          </CardTitle>
          <CardDescription>
            Exporte ou importe seus dados manualmente via planilha Excel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 h-11 border-border/50 text-foreground hover:bg-accent transition-all font-semibold rounded"
            onClick={handleExport}
          >
            <Download size={18} />
            Exportar Backup (.xlsx)
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 h-11 border-border/50 text-foreground hover:bg-accent transition-all font-semibold rounded"
            onClick={handleImportClick}
          >
            <Upload size={18} />
            Importar Backup (.xlsx)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm bg-muted/20 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
        <CardContent className="pt-6">
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            <strong>Dica:</strong> Após configurar o Apps Script no Google Sheets, cole a URL de implantação acima. 
            Todas as alterações salvas localmente podem ser enviadas manualmente clicando em "Enviar Dados".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
