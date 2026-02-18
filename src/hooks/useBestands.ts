import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Bestand, Atgard } from "@/types/bestand";

export function useBestands() {
  return useQuery({
    queryKey: ["bestands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bestands").select("*").order("namn");
      if (error) throw error;
      return data as unknown as Bestand[];
    },
  });
}

export function useBestand(id: string | null) {
  return useQuery({
    queryKey: ["bestand", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("bestands").select("*").eq("id", id).single();
      if (error) throw error;
      return data as unknown as Bestand;
    },
    enabled: !!id,
  });
}

export function useUpsertBestand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bestand: Partial<Bestand> & { id?: string }) => {
      if (bestand.id) {
        const { data, error } = await supabase.from("bestands").update(bestand as any).eq("id", bestand.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("bestands").insert(bestand as any).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bestands"] }),
  });
}

export function useDeleteBestand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bestands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bestands"] }),
  });
}

export function useAtgarder(bestandId: string | null) {
  return useQuery({
    queryKey: ["atgarder", bestandId],
    queryFn: async () => {
      if (!bestandId) return [];
      const { data, error } = await supabase.from("atgarder").select("*").eq("bestand_id", bestandId).order("created_at");
      if (error) throw error;
      return data as unknown as Atgard[];
    },
    enabled: !!bestandId,
  });
}

export function useAllAtgarder() {
  return useQuery({
    queryKey: ["atgarder-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("atgarder").select("*").order("planerat_datum");
      if (error) throw error;
      return data as unknown as Atgard[];
    },
  });
}

export function useUpsertAtgard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (atgard: Partial<Atgard> & { bestand_id: string }) => {
      if (atgard.id) {
        const { data, error } = await supabase.from("atgarder").update(atgard as any).eq("id", atgard.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("atgarder").insert(atgard as any).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["atgarder", vars.bestand_id] });
      qc.invalidateQueries({ queryKey: ["atgarder-all"] });
    },
  });
}

export function useDeleteAtgard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bestandId }: { id: string; bestandId: string }) => {
      const { error } = await supabase.from("atgarder").delete().eq("id", id);
      if (error) throw error;
      return bestandId;
    },
    onSuccess: (bestandId) => {
      qc.invalidateQueries({ queryKey: ["atgarder", bestandId] });
      qc.invalidateQueries({ queryKey: ["atgarder-all"] });
    },
  });
}
