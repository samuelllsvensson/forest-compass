

# Skogsförvaltning — Admin för skoglig planering

## Översikt
En webbaserad admin-applikation för skogsförvaltning med interaktiv karta, beståndsinventering och åtgärdsplanering. Alla texter på svenska.

---

## 1. Interaktiv karta (Mapbox GL)
- Fullskärmskarta med satellit- och terrängläge över det aktuella skogsområdet
- Visa alla registrerade bestånd som färgkodade polygoner på kartan
- Klicka på ett bestånd för att visa snabbinfo (popup med areal, trädslag, volym)

## 2. Redigeringsläge för beståndsgränser
- Knapp "Redigera" som aktiverar ritläge på kartan
- **Skapa nytt bestånd:** Klicka för att placera punkter som bildar en polygon
- **Flytta punkter:** Dra befintliga hörnpunkter för att justera gränser
- **Ta bort bestånd:** Radera ett markerat bestånd
- Spara/avbryt-knappar för att bekräfta ändringar

## 3. Beståndsinformation (sidopanel)
- Vid klick på ett bestånd öppnas en detaljpanel med:
  - **Namn/ID** på beståndet
  - **Areal** (beräknas automatiskt från polygonen)
  - **Trädslag** (tall, gran, björk, etc. — flerval)
  - **Virkesvolym** (m³/ha och totalt)
  - **Ålder** på beståndet
  - **Övriga egenskaper** (bonitet, slutenhet, etc.)
- Redigerbar formulär för att uppdatera alla egenskaper

## 4. Åtgärdsplanering per bestånd
- Lista med planerade åtgärder kopplade till varje bestånd
- Varje åtgärd innehåller:
  - **Typ** (avverkning, gallring, plantering, röjning, etc.)
  - **Planerat datum / tidsram** (t.ex. "om 5 år")
  - **Status** (planerad, pågående, slutförd)
  - **Anteckningar**
- Lägg till, redigera och ta bort åtgärder

## 5. Dashboard med statistiköversikt
- **Nyckeltal (KPI-kort):** Total areal, total virkesvolym, antal bestånd, planerade åtgärder
- **Diagram:**
  - Trädslags­fördelning (cirkeldiagram)
  - Virkesvolym per bestånd (stapeldiagram)
  - Åldersfördelning (histogram)
  - Tidslinje över planerade åtgärder
- **Filtreringsmöjligheter:** Filtrera bestånd efter trädslag, ålder, volym
- **Jämförelse:** Jämför egenskaper mellan utvalda bestånd

## 6. Backend (Lovable Cloud / Supabase)
- **Databas:**
  - `bestands` — polygon-geometri (GeoJSON), namn, areal, trädslag, volym, ålder, bonitet
  - `atgarder` — typ, datum, status, anteckningar, kopplat till bestånd
- Säker lagring av all data med RLS-policies

## 7. Navigation
- Sidnavigation med:
  - **Karta** — huvudvy med interaktiv karta
  - **Dashboard** — statistik och översikt
  - **Bestånds­lista** — tabellvy över alla bestånd med sök och filter

