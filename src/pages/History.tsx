import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Pencil, Trash2, Loader2, 
  Download, Upload 
} from "lucide-react";
import * as XLSX from "xlsx";
import { getAllEntries, deleteEntry, Entry, importData } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

function sectionAvg(entry: Entry, keys: (keyof Entry)[]): number {
  const vals = keys.map((k) => (entry[k] as number) ?? 0);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

function scoreBadge(avg: number, max = 3) {
  const ratio = avg / max;
  if (ratio <= 0.33) return <Badge variant="success">{avg}</Badge>;
  if (ratio <= 0.66) return <Badge variant="warning">{avg}</Badge>;
  return <Badge variant="destructive">{avg}</Badge>;
}

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const data = await getAllEntries();
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Excluir este registro?")) return;
    await deleteEntry(id);
    toast("Registro excluído");
    load();
  }

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-muted-foreground/50" size={20} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold tracking-tight uppercase">Histórico</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest leading-none">
            {entries.length} registro{entries.length !== 1 && "s"} 
          </p>
        </div>
      </div>

      {!entries.length ? (
        <div className="flex flex-col items-center justify-center gap-6 pt-24 text-center">
          <FileText size={40} className="text-muted-foreground/30" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-tight text-sm">Base de dados vazia</p>
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest">Inicie um registro ou importe um backup.</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline" className="text-[10px] h-8 uppercase font-bold tracking-widest">Novo Registro</Button>
        </div>
      ) : (
        entries.map((entry, index) => {
          const s1 = sectionAvg(entry, ["s1_attention", "s1_organize", "s1_restless", "s1_impulsive"]);
          const s2 = sectionAvg(entry, ["s2_mindnonstop", "s2_thoughts", "s2_multithink", "s2_brainfog"]);
          const s3 = sectionAvg(entry, ["s3_blunting", "s3_creativity", "s3_appetite", "s3_fatigue", "s3_irritable", "s3_sleep"]);
          return (
            <Card 
              key={entry.id} 
              className="border-border/60 hover:border-border transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-4 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight">{formatDateDisplay(entry.entry_date)}</p>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      {entry.dose_mg ? (
                        <span className="flex items-center gap-1">
                          {entry.dose_mg}mg
                        </span>
                      ) : (
                        <span>S/Dose</span>
                      )}
                      {entry.taken_at && (
                        <span className="flex items-center gap-1 border-l border-border/50 pl-2">
                          {entry.taken_at}
                        </span>
                      )}
                      {entry.sleep_hours && (
                        <span className="flex items-center gap-1 border-l border-border/50 pl-2">
                          {entry.sleep_hours}H
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 border border-border/40" onClick={() => navigate(`/diario/${entry.entry_date}`)}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive border border-border/40" onClick={() => handleDelete(entry.id!)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/70">Foco:</span>
                    {scoreBadge(s1)}
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-border/30 pl-3">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/70">Fluxo:</span>
                    {scoreBadge(s2)}
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-border/30 pl-3">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/70">Efeitos:</span>
                    {scoreBadge(s3)}
                  </div>
                </div>

                {entry.notes && (
                  <div className="border-t border-border/30 pt-3">
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2">"{entry.notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
