import { useState } from "react";
import { useBestand, useUpsertBestand, useAtgarder, useUpsertAtgard, useDeleteAtgard } from "@/hooks/useBestands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Trash2 } from "lucide-react";
import { TRADSLAG_OPTIONS, ATGARD_TYPER, ATGARD_STATUS } from "@/types/bestand";
import type { Atgard } from "@/types/bestand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  bestandId: string;
  onClose: () => void;
}

export default function BestandPanel({ bestandId, onClose }: Props) {
  const { data: bestand, isLoading } = useBestand(bestandId);
  const { data: atgarder = [] } = useAtgarder(bestandId);
  const upsertBestand = useUpsertBestand();
  const upsertAtgard = useUpsertAtgard();
  const deleteAtgard = useDeleteAtgard();
  const [showAddAtgard, setShowAddAtgard] = useState(false);

  if (isLoading || !bestand) {
    return <div className="p-6">Laddar...</div>;
  }

  const updateField = (field: string, value: any) => {
    upsertBestand.mutate({ id: bestand.id, [field]: value });
  };

  const toggleTradslag = (t: string) => {
    const current = bestand.tradslag || [];
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t];
    updateField("tradslag", next);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-display text-lg font-bold">Beståndsinformation</h2>
        <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div>
          <Label>Namn</Label>
          <Input
            value={bestand.namn}
            onChange={(e) => updateField("namn", e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Areal (ha)</Label>
            <Input value={bestand.areal} readOnly className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Ålder (år)</Label>
            <Input
              type="number"
              value={bestand.alder}
              onChange={(e) => updateField("alder", parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Volym (m³/ha)</Label>
            <Input
              type="number"
              value={bestand.virkesvolym_per_ha}
              onChange={(e) => updateField("virkesvolym_per_ha", parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Volym totalt (m³)</Label>
            <Input
              type="number"
              value={bestand.virkesvolym_totalt}
              onChange={(e) => updateField("virkesvolym_totalt", parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Bonitet</Label>
            <Input
              value={bestand.bonitet}
              onChange={(e) => updateField("bonitet", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Slutenhet</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={bestand.slutenhet}
              onChange={(e) => updateField("slutenhet", parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Trädslag</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {TRADSLAG_OPTIONS.map((t) => (
              <Badge
                key={t}
                variant={bestand.tradslag?.includes(t) ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => toggleTradslag(t)}
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Åtgärder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Åtgärder</h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddAtgard(true)} className="gap-1 h-7 text-xs">
              <Plus className="h-3 w-3" /> Lägg till
            </Button>
          </div>

          {showAddAtgard && (
            <AtgardForm
              bestandId={bestandId}
              onSave={(a) => { upsertAtgard.mutate(a); setShowAddAtgard(false); }}
              onCancel={() => setShowAddAtgard(false)}
            />
          )}

          <div className="space-y-2 mt-2">
            {atgarder.map((a) => (
              <div key={a.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.typ}</span>
                  <div className="flex items-center gap-1">
                    <Badge variant={a.status === "slutförd" ? "default" : a.status === "pågående" ? "secondary" : "outline"} className="text-xs">
                      {a.status}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => deleteAtgard.mutate({ id: a.id, bestandId })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {a.tidsram && <p className="text-muted-foreground">{a.tidsram}</p>}
                {a.anteckningar && <p className="text-muted-foreground">{a.anteckningar}</p>}
              </div>
            ))}
            {atgarder.length === 0 && !showAddAtgard && (
              <p className="text-xs text-muted-foreground">Inga åtgärder registrerade.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AtgardForm({
  bestandId,
  onSave,
  onCancel,
}: {
  bestandId: string;
  onSave: (a: Partial<Atgard> & { bestand_id: string }) => void;
  onCancel: () => void;
}) {
  const [typ, setTyp] = useState(ATGARD_TYPER[0]);
  const [tidsram, setTidsram] = useState("");
  const [status, setStatus] = useState<string>("planerad");
  const [anteckningar, setAnteckningar] = useState("");

  return (
    <div className="rounded-md border border-border p-3 space-y-2 bg-muted/30">
      <div>
        <Label className="text-xs">Typ</Label>
        <Select value={typ} onValueChange={setTyp}>
          <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ATGARD_TYPER.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Tidsram</Label>
        <Input value={tidsram} onChange={(e) => setTidsram(e.target.value)} placeholder="t.ex. om 5 år" className="h-8 text-xs mt-0.5" />
      </div>
      <div>
        <Label className="text-xs">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ATGARD_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Anteckningar</Label>
        <Textarea value={anteckningar} onChange={(e) => setAnteckningar(e.target.value)} className="text-xs mt-0.5" rows={2} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs" onClick={() => onSave({ bestand_id: bestandId, typ, tidsram, status: status as 'planerad' | 'pågående' | 'slutförd', anteckningar })}>
          Spara
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>Avbryt</Button>
      </div>
    </div>
  );
}
