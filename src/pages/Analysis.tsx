import { useState, useEffect } from "react";
import { getAllEntries, countEntries, Entry } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

function avg(entry: Entry, keys: (keyof Entry)[]): number {
  const vals = keys.map((k) => Number(entry[k]) ?? 0);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

function Insight({ title, children, kind }: { title: string; children: React.ReactNode; kind: "good" | "warn" | "neutral" }) {
  const colors = { 
    good: "border-border bg-foreground/5", 
    warn: "border-border/60 bg-foreground/3", 
    neutral: "border-border/40 bg-transparent" 
  };
  const icons = { 
    good: <CheckCircle2 size={14} className="text-foreground shrink-0" />, 
    warn: <AlertTriangle size={14} className="text-foreground/70 shrink-0" />, 
    neutral: null 
  };
  return (
    <div className={`rounded border p-4 space-y-1.5 transition-all ${colors[kind]}`}>
      <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider">{icons[kind]}{title}</div>
      <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{children}</p>
    </div>
  );
}

export default function Analysis() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllEntries(), countEntries()]).then(([data, n]) => {
      setEntries(data);
      setCount(n);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-muted-foreground/50" size={20} /></div>;

  if (count < 3) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 pt-24 text-center">
        <BarChart3 size={40} className="text-muted-foreground/30" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-tight text-sm">Dados insuficientes</p>
          <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest">
            Mínimo de 3 registros necessário ({count}/3)
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data (chronological)
  const chartData = [...entries].reverse().map((e) => ({
    date: formatDateDisplay(e.entry_date),
    "S1": avg(e, ["s1_attention", "s1_organize", "s1_restless", "s1_impulsive"]),
    "S2": avg(e, ["s2_mindnonstop", "s2_thoughts", "s2_multithink", "s2_brainfog"]),
    "S3": avg(e, ["s3_blunting", "s3_creativity", "s3_appetite", "s3_fatigue", "s3_irritable", "s3_sleep"]),
  }));

  const overallS1 = chartData.reduce((a, b) => a + b["S1"], 0) / chartData.length;
  const overallS2 = chartData.reduce((a, b) => a + b["S2"], 0) / chartData.length;
  const overallS3 = chartData.reduce((a, b) => a + b["S3"], 0) / chartData.length;
  const overallSleep = entries.reduce((a, b) => a + (Number(b.sleep_hours) || 0), 0) / entries.filter((e) => e.sleep_hours).length;

  const radarData = [
    { metric: "Foco", value: Math.round((1 - overallS1 / 3) * 100) },
    { metric: "Fluxo", value: Math.round((1 - overallS2 / 3) * 100) },
    { metric: "Efeitos", value: Math.round((1 - overallS3 / 3) * 100) },
    { metric: "Sono", value: Math.min(100, Math.round((overallSleep / 9) * 100)) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold tracking-tight uppercase">Análise</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest leading-none">
            Relatório baseado em {count} registros
          </p>
        </div>
        <Badge variant="secondary" className="text-[9px] h-5 uppercase font-bold tracking-widest">{count >= 7 ? "7d+ v" : `${count} dias`}</Badge>
      </div>

      {/* Timeline */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Evolução Clínica</CardTitle>
          <CardDescription className="text-[9px] text-muted-foreground/50 font-medium leading-none">Escala 0 (melhor) a 3 (pior)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "currentColor", opacity: 0.5 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 3]} tick={{ fontSize: 9, fill: "currentColor", opacity: 0.5 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "2px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}
                itemStyle={{ padding: "0" }}
              />
              <Legend iconSize={6} wrapperStyle={{ fontSize: "9px", fontWeight: "bold", paddingTop: "15px", textTransform: "uppercase", letterSpacing: "0.1em" }} />
              <Line type="monotone" name="S1 Foco" dataKey="S1" stroke="currentColor" strokeWidth={2} dot={{ r: 2, fill: "currentColor" }} activeDot={{ r: 4 }} />
              <Line type="monotone" name="S2 Fluxo" dataKey="S2" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" name="S3 Efeitos" dataKey="S3" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Resumo de Saúde (% Positivo)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fontWeight: "bold", fill: "currentColor", opacity: 0.6 }} />
              <Radar name="Status" dataKey="value" stroke="currentColor" fill="currentColor" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Interpretação Baseada em Protocolos</h2>

        {overallS1 <= 1 ? (
          <Insight title="Controle de Sintomas" kind="good">
            A média de S1 ({overallS1.toFixed(1)}) indica controle efetivo nas funções executivas e foco.
          </Insight>
        ) : (
          <Insight title="Sintomas Elevados" kind="warn">
            Score S1 de {overallS1.toFixed(1)} sugere que a desatenção ou hiperatividade ainda impacta o cotidiano.
          </Insight>
        )}

        {overallS2 <= 0.5 && overallS3 >= 1.5 ? (
          <Insight title="Análise de Embotamento" kind="warn">
            Fluxo mental muito baixo ({overallS2.toFixed(1)}) associado a efeitos colaterais ({overallS3.toFixed(1)}): risco de inibição excessiva. Discutir com psiquiatra.
          </Insight>
        ) : overallS3 >= 2 ? (
          <Insight title="Tolerância Adversa" kind="warn">
            Score S3 ({overallS3.toFixed(1)}) indica efeitos colaterais moderados a intensos. Monitorar tendência.
          </Insight>
        ) : (
          <Insight title="Perfil de Tolerância" kind="good">
            Efeitos adversos (S3 {overallS3.toFixed(1)}) dentro de níveis clinicamente toleráveis.
          </Insight>
        )}

        {!isNaN(overallSleep) && (
          <Insight title={`Sono médio: ${overallSleep.toFixed(1)}h`} kind={overallSleep >= 7 ? "good" : "warn"}>
            {overallSleep >= 7
              ? "Boa higiene do sono. Continue assim."
              : "Sono insuficiente pode agravar sintomas de TDAH e reduzir a eficácia da medicação."}
          </Insight>
        )}

        {count < 7 && (
          <Insight title="Continue registrando" kind="neutral">
            Com {7 - count} dias a mais de dados (total 7), a análise ficará ainda mais precisa para levar ao psiquiatra.
          </Insight>
        )}
      </div>
    </div>
  );
}
