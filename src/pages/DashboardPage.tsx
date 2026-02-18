import { useBestands, useAllAtgarder } from "@/hooks/useBestands";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Ruler, BarChart3, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#22c55e", "#15803d", "#a3e635", "#eab308", "#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#64748b", "#78716c"];

export default function DashboardPage() {
  const { data: bestands = [] } = useBestands();
  const { data: atgarder = [] } = useAllAtgarder();

  const totalAreal = bestands.reduce((s, b) => s + (b.areal || 0), 0);
  const totalVolym = bestands.reduce((s, b) => s + (b.virkesvolym_totalt || 0), 0);
  const planerade = atgarder.filter((a) => a.status === "planerad").length;

  // Trädslag distribution
  const tradslagCount: Record<string, number> = {};
  bestands.forEach((b) => b.tradslag?.forEach((t) => { tradslagCount[t] = (tradslagCount[t] || 0) + 1; }));
  const tradslagData = Object.entries(tradslagCount).map(([name, value]) => ({ name, value }));

  // Volym per bestånd
  const volymData = bestands
    .filter((b) => b.virkesvolym_totalt > 0)
    .slice(0, 15)
    .map((b) => ({ name: b.namn, volym: b.virkesvolym_totalt }));

  // Ålder histogram
  const alderBuckets = [
    { range: "0–20", min: 0, max: 20 },
    { range: "21–40", min: 21, max: 40 },
    { range: "41–60", min: 41, max: 60 },
    { range: "61–80", min: 61, max: 80 },
    { range: "81–100", min: 81, max: 100 },
    { range: "100+", min: 101, max: 9999 },
  ];
  const alderData = alderBuckets.map((b) => ({
    range: b.range,
    antal: bestands.filter((x) => x.alder >= b.min && x.alder <= b.max).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={TreePine} label="Antal bestånd" value={bestands.length} />
        <KPICard icon={Ruler} label="Total areal (ha)" value={totalAreal.toFixed(1)} />
        <KPICard icon={BarChart3} label="Total volym (m³)" value={totalVolym.toFixed(0)} />
        <KPICard icon={CalendarClock} label="Planerade åtgärder" value={planerade} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trädslag */}
        <Card>
          <CardHeader><CardTitle className="text-base">Trädslagsfördelning</CardTitle></CardHeader>
          <CardContent className="h-64">
            {tradslagData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tradslagData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {tradslagData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground pt-10 text-center">Ingen data ännu.</p>
            )}
          </CardContent>
        </Card>

        {/* Volym */}
        <Card>
          <CardHeader><CardTitle className="text-base">Virkesvolym per bestånd (m³)</CardTitle></CardHeader>
          <CardContent className="h-64">
            {volymData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volymData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="volym" fill="hsl(152, 45%, 28%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground pt-10 text-center">Ingen data ännu.</p>
            )}
          </CardContent>
        </Card>

        {/* Ålder */}
        <Card>
          <CardHeader><CardTitle className="text-base">Åldersfördelning</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="antal" fill="hsl(140, 30%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Åtgärder per status */}
        <Card>
          <CardHeader><CardTitle className="text-base">Åtgärder per status</CardTitle></CardHeader>
          <CardContent className="h-64">
            {atgarder.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Planerad", value: atgarder.filter((a) => a.status === "planerad").length },
                      { name: "Pågående", value: atgarder.filter((a) => a.status === "pågående").length },
                      { name: "Slutförd", value: atgarder.filter((a) => a.status === "slutförd").length },
                    ].filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#eab308" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground pt-10 text-center">Inga åtgärder registrerade.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
