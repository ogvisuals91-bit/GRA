import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertSponsor } from "@shared/schema";

export function useSponsors() {
  return useQuery({
    queryKey: [api.sponsors.list.path],
    queryFn: async () => {
      const res = await fetch(api.sponsors.list.path);
      if (!res.ok) throw new Error("Failed to fetch sponsors");
      return res.json();
    },
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSponsor) => {
      const res = await fetch(api.sponsors.create.path, {
        method: api.sponsors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create sponsor");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sponsors.list.path] }),
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.sponsors.delete.path, { id });
      const res = await fetch(url, { method: api.sponsors.delete.method });
      if (!res.ok) throw new Error("Failed to delete sponsor");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sponsors.list.path] }),
  });
}
