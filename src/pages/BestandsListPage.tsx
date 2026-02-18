import { useState } from "react";
import { useBestands } from "@/hooks/useBestands";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BestandsListPage() {
  const { data: bestands = [], isLoading } = useBestands();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = bestands.filter((b) =>
    b.namn.toLowerCase().includes(search.toLowerCase()) ||
    b.tradslag?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-2xl font-bold">Beståndslista</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök efter namn eller trädslag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p>Laddar...</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Areal (ha)</TableHead>
                <TableHead>Trädslag</TableHead>
                <TableHead>Volym (m³/ha)</TableHead>
                <TableHead>Ålder</TableHead>
                <TableHead>Bonitet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/?bestand=${b.id}`)}
                >
                  <TableCell className="font-medium">{b.namn}</TableCell>
                  <TableCell>{b.areal}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {b.tradslag?.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{b.virkesvolym_per_ha}</TableCell>
                  <TableCell>{b.alder} år</TableCell>
                  <TableCell>{b.bonitet}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {bestands.length === 0 ? "Inga bestånd registrerade ännu." : "Inga träffar."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
