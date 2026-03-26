import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

export default function CustomDatePicker({ value, onChange, onClose }: CustomDatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date(value + 'T12:00:00'));
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectDay = (day: number) => {
    const selected = new Date(year, month, day);
    const formatted = selected.toISOString().split('T')[0];
    onChange(formatted);
    onClose();
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isSelected = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0] === value;
  };

  const isToday = (day: number) => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0] === today;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[320px] bg-background border border-border shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Selecionar Data</span>
            <span className="text-sm font-bold uppercase tracking-tight">{monthNames[month]} {year}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/10">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex gap-1">
             <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-tighter" onClick={() => setCurrentDate(new Date())}>
                Hoje
             </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Calendar */}
        <div className="p-4 pt-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
              <div key={d} className="h-8 flex items-center justify-center text-[9px] uppercase font-bold text-muted-foreground/60">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(i => (
              <div key={`b-${i}`} className="h-10" />
            ))}
            {days.map(d => (
              <button
                key={d}
                onClick={() => selectDay(d)}
                className={cn(
                  "h-10 flex flex-col items-center justify-center rounded border transition-all relative",
                  isSelected(d) 
                    ? "bg-foreground border-foreground text-background font-bold" 
                    : "border-transparent hover:border-border text-sm font-medium hover:bg-muted",
                  isToday(d) && !isSelected(d) && "border-foreground/20 text-foreground"
                )}
              >
                {d}
                {isToday(d) && (
                  <span className={cn(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    isSelected(d) ? "bg-background" : "bg-foreground"
                  )} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/5 flex justify-end">
           <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest h-8" onClick={onClose}>
             Cancelar
           </Button>
        </div>
      </div>
    </div>
  );
}
