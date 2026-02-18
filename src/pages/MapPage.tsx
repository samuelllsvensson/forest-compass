import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { useBestands, useUpsertBestand, useDeleteBestand } from "@/hooks/useBestands";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, Save, X, Layers } from "lucide-react";
import BestandPanel from "@/components/BestandPanel";
import type { Bestand } from "@/types/bestand";
import area from "@turf/area";

const DEFAULT_CENTER: [number, number] = [15.5, 59.3]; // Central Sweden
const DEFAULT_ZOOM = 8;

export default function MapPage() {
  const { data: token, isLoading: tokenLoading } = useMapboxToken();
  const { data: bestands = [], isLoading: bestandsLoading } = useBestands();
  const upsertBestand = useUpsertBestand();
  const deleteBestand = useDeleteBestand();

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [selectedBestand, setSelectedBestand] = useState<string | null>(null);
  const [satellite, setSatellite] = useState(false);

  // Init map
  useEffect(() => {
    if (!token || !mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: satellite
        ? "mapbox://styles/mapbox/satellite-streets-v12"
        : "mapbox://styles/mapbox/outdoors-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [token]);

  // Toggle style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(
      satellite
        ? "mapbox://styles/mapbox/satellite-streets-v12"
        : "mapbox://styles/mapbox/outdoors-v12"
    );
  }, [satellite]);

  // Draw bestands polygons on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      // Clean up old sources
      bestands.forEach((_, i) => {
        if (map.getLayer(`bestand-fill-${i}`)) map.removeLayer(`bestand-fill-${i}`);
        if (map.getLayer(`bestand-line-${i}`)) map.removeLayer(`bestand-line-${i}`);
        if (map.getSource(`bestand-${i}`)) map.removeSource(`bestand-${i}`);
      });

      // Also clean any leftover sources from previous renders
      const style = map.getStyle();
      if (style?.layers) {
        style.layers.forEach((layer) => {
          if (layer.id.startsWith("bestand-")) map.removeLayer(layer.id);
        });
      }
      if (style?.sources) {
        Object.keys(style.sources).forEach((src) => {
          if (src.startsWith("bestand-")) map.removeSource(src);
        });
      }

      bestands.forEach((b, i) => {
        const geom = b.geometry;
        if (!geom?.coordinates?.length || !geom.coordinates[0]?.length) return;

        map.addSource(`bestand-${i}`, {
          type: "geojson",
          data: { type: "Feature", geometry: geom, properties: { id: b.id, namn: b.namn } },
        });

        const isSelected = b.id === selectedBestand;
        map.addLayer({
          id: `bestand-fill-${i}`,
          type: "fill",
          source: `bestand-${i}`,
          paint: {
            "fill-color": isSelected ? "#4ade80" : "#22c55e",
            "fill-opacity": isSelected ? 0.45 : 0.25,
          },
        });
        map.addLayer({
          id: `bestand-line-${i}`,
          type: "line",
          source: `bestand-${i}`,
          paint: {
            "line-color": isSelected ? "#16a34a" : "#15803d",
            "line-width": isSelected ? 3 : 1.5,
          },
        });

        map.on("click", `bestand-fill-${i}`, () => {
          setSelectedBestand(b.id);
        });
        map.on("mouseenter", `bestand-fill-${i}`, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", `bestand-fill-${i}`, () => {
          map.getCanvas().style.cursor = "";
        });
      });
    };

    if (map.isStyleLoaded()) {
      onStyleLoad();
    }
    map.on("style.load", onStyleLoad);
    return () => { map.off("style.load", onStyleLoad); };
  }, [bestands, selectedBestand]);

  // Drawing mode: place points
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !editMode) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const point: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setDrawingPoints((prev) => [...prev, point]);
    };

    map.on("click", onClick);
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", onClick);
      map.getCanvas().style.cursor = "";
    };
  }, [editMode]);

  // Draw temporary polygon for drawing mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old drawing layer
    if (map.getLayer("drawing-fill")) map.removeLayer("drawing-fill");
    if (map.getLayer("drawing-line")) map.removeLayer("drawing-line");
    if (map.getSource("drawing")) map.removeSource("drawing");

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (drawingPoints.length < 2) return;

    const coords = [...drawingPoints, drawingPoints[0]];
    map.addSource("drawing", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
        properties: {},
      },
    });
    map.addLayer({
      id: "drawing-fill",
      type: "fill",
      source: "drawing",
      paint: { "fill-color": "#facc15", "fill-opacity": 0.3 },
    });
    map.addLayer({
      id: "drawing-line",
      type: "line",
      source: "drawing",
      paint: { "line-color": "#eab308", "line-width": 2, "line-dasharray": [2, 2] },
    });

    // Add draggable markers
    drawingPoints.forEach((pt, idx) => {
      const el = document.createElement("div");
      el.className = "w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600 cursor-grab";
      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(pt)
        .addTo(map);
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setDrawingPoints((prev) => prev.map((p, i) => (i === idx ? [lngLat.lng, lngLat.lat] : p)));
      });
      markersRef.current.push(marker);
    });
  }, [drawingPoints]);

  const handleSaveDrawing = useCallback(async () => {
    if (drawingPoints.length < 3) return;
    const coords = [...drawingPoints, drawingPoints[0]];
    const polygon: GeoJSON.Polygon = { type: "Polygon", coordinates: [coords] };
    const areaM2 = area({ type: "Feature", geometry: polygon, properties: {} });
    const areaHa = Math.round(areaM2 / 10000 * 100) / 100;

    await upsertBestand.mutateAsync({
      namn: `Bestånd ${bestands.length + 1}`,
      geometry: polygon,
      areal: areaHa,
    });

    setEditMode(false);
    setDrawingPoints([]);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, [drawingPoints, bestands.length, upsertBestand]);

  const handleCancelDrawing = () => {
    setEditMode(false);
    setDrawingPoints([]);
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  };

  const handleDeleteSelected = async () => {
    if (!selectedBestand) return;
    await deleteBestand.mutateAsync(selectedBestand);
    setSelectedBestand(null);
  };

  if (tokenLoading || bestandsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!editMode ? (
            <>
              <Button size="sm" onClick={() => setEditMode(true)} className="gap-1.5 shadow-lg">
                <Plus className="h-4 w-4" /> Nytt bestånd
              </Button>
              {selectedBestand && (
                <Button size="sm" variant="destructive" onClick={handleDeleteSelected} className="gap-1.5 shadow-lg">
                  <Trash2 className="h-4 w-4" /> Radera
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleSaveDrawing}
                disabled={drawingPoints.length < 3}
                className="gap-1.5 shadow-lg"
              >
                <Save className="h-4 w-4" /> Spara ({drawingPoints.length} punkter)
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelDrawing} className="gap-1.5 shadow-lg bg-background">
                <X className="h-4 w-4" /> Avbryt
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSatellite(!satellite)}
            className="shadow-lg bg-background"
            title={satellite ? "Terrängvy" : "Satellitvy"}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {editMode && (
          <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-md px-4 py-2 text-sm text-muted-foreground shadow">
            Klicka på kartan för att placera punkter. Dra punkter för att justera. Minst 3 punkter krävs.
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedBestand && (
        <div className="w-96 border-l border-border bg-background overflow-auto">
          <BestandPanel bestandId={selectedBestand} onClose={() => setSelectedBestand(null)} />
        </div>
      )}
    </div>
  );
}
