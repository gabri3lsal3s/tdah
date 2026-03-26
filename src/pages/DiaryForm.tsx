import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";
import { upsertEntry, getEntryByDate, Entry } from "@/lib/db";
import { today, formatDateDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

const SECTION1 = [
  { key: "s1_attention", label: "Dificuldade para manter a atenção em tarefas chatas ou repetitivas" },
  { key: "s1_organize", label: "Dificuldade para organizar tarefas e começar o que precisa ser feito" },
  { key: "s1_restless", label: "Sensação de inquietação física ou necessidade de se mexer" },
  { key: "s1_impulsive", label: "Interrompeu os outros ou agiu por impulso" },
] as const;

const SECTION2 = [
  { key: "s2_mindnonstop", label: "Achei difícil ficar sem pensar em nada (mente não parou)" },
  { key: "s2_thoughts", label: "Meus pensamentos estavam em movimento o tempo todo" },
  { key: "s2_multithink", label: "Tive dois ou mais pensamentos diferentes ocorrendo ao mesmo tempo" },
  { key: "s2_brainfog", label: 'Tive dificuldade de pensar de forma clara (cabeça "confusa" ou "neblina")' },
] as const;

const SECTION3 = [
  { key: "s3_blunting", label: 'Sensação de estar "robótico", apático ou sem emoções (Embotamento)' },
  { key: "s3_creativity", label: 'Perda de criatividade, espontaneidade ou ausência da "voz interna"' },
  { key: "s3_appetite", label: "Perda de apetite ou problemas estomacais" },
  { key: "s3_fatigue", label: "Fadiga, sonolência diurna ou cansaço excessivo" },
  { key: "s3_irritable", label: "Irritabilidade ou ansiedade" },
  { key: "s3_sleep", label: "Problemas para pegar no sono ou sono interrompido" },
] as const;

type ScoreKey = string;

function defaultEntry(date: string): Entry {
  return {
    entry_date: date, dose_mg: null, taken_at: "", sleep_hours: null, ate_well: 0,
    s1_attention: 0, s1_organize: 0, s1_restless: 0, s1_impulsive: 0,
    s2_mindnonstop: 0, s2_thoughts: 0, s2_multithink: 0, s2_brainfog: 0,
    s3_blunting: 0, s3_creativity: 0, s3_appetite: 0, s3_fatigue: 0, s3_irritable: 0, s3_sleep: 0,
    notes: "",
  };
}

function RadioGroup({ value, onChange, scale }: { value: number; onChange: (v: number) => void; scale: string[] }) {
  return (
    <div className="flex gap-1.5">
      {scale.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`flex-1 py-1.5 rounded border transition-all text-[11px] font-medium ${
            value === i
              ? "bg-foreground border-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const scale03 = ["0", "1", "2", "3"];
const scaleEffect = ["Ausente", "Leve", "Mod.", "Intenso"];

export default function DiaryForm() {
  const { date: paramDate } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const entryDate = paramDate ?? today();
  const [form, setForm] = useState<Entry>(defaultEntry(entryDate));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getEntryByDate(entryDate).then((existing) => {
      setForm(existing ?? defaultEntry(entryDate));
      setLoading(false);
    });
  }, [entryDate]);

  function set<K extends keyof Entry>(key: K, value: Entry[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setScore(key: string, value: number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsertEntry(form);
      toast("Entrada salva com sucesso ✓");
      if (!paramDate) navigate("/historico");
    } catch {
      toast("Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-lg font-bold tracking-tight uppercase">Registro Diário</h1>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{formatDateDisplay(entryDate)}</p>
      </div>

      {/* Meta */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Data</Label>
              <Input type="date" className="h-8 text-xs" value={form.entry_date} onChange={(e) => set("entry_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Dose (mg)</Label>
              <Input type="number" className="h-8 text-xs" placeholder="Ex: 10" value={form.dose_mg ?? ""} onChange={(e) => set("dose_mg", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Horário</Label>
              <Input type="time" className="h-8 text-xs" value={form.taken_at} onChange={(e) => set("taken_at", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Sono (h)</Label>
              <Input type="number" step="0.5" className="h-8 text-xs" placeholder="Ex: 7.5" value={form.sleep_hours ?? ""} onChange={(e) => set("sleep_hours", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Alimentou-se bem hoje?</Label>
            <RadioGroup value={form.ate_well} onChange={(v) => set("ate_well", v)} scale={["Não", "Sim"]} />
          </div>
        </CardContent>
      </Card>

      {/* Section 1 */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Seção 1 — Sintomas-Alvo</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground/60 italic">ASRS-18 · 0: nenhum · 3: severo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {SECTION1.map(({ key, label }) => (
            <div key={key} className="space-y-2 border-l-2 border-border/30 pl-3">
              <p className="text-xs font-medium leading-tight">{label}</p>
              <RadioGroup value={(form as any)[key]} onChange={(v) => setScore(key, v)} scale={scale03} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Seção 2 — Fluxo de Pensamentos</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground/60 italic">MEWS · 0: nenhum · 3: severo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {SECTION2.map(({ key, label }) => (
            <div key={key} className="space-y-2 border-l-2 border-border/30 pl-3">
              <p className="text-xs font-medium leading-tight">{label}</p>
              <RadioGroup value={(form as any)[key]} onChange={(v) => setScore(key, v)} scale={scale03} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Seção 3 — Efeitos Colaterais</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground/60 italic">Protocolos CADDRA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {SECTION3.map(({ key, label }) => (
            <div key={key} className="space-y-2 border-l-2 border-border/30 pl-3">
              <p className="text-xs font-medium leading-tight">{label}</p>
              <RadioGroup value={(form as any)[key]} onChange={(v) => setScore(key, v)} scale={scaleEffect} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Seção 4 — Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="text-xs min-h-[100px] border-border/60"
            placeholder="Observações pertinentes..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-10 text-xs font-bold uppercase tracking-widest" size="lg">
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        {saving ? "Processando…" : "Finalizar Registro"}
      </Button>
    </div>
  );
}
