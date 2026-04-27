import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertNominee } from "@shared/schema";

export function useNominees() {
  return useQuery({
    queryKey: [api.nominees.list.path],
    queryFn: async () => {
      const res = await fetch(api.nominees.list.path);
      if (!res.ok) throw new Error("Failed to fetch nominees");
      return api.nominees.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateNominee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertNominee) => {
      const res = await fetch(api.nominees.create.path, {
        method: api.nominees.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create nominee");
      return api.nominees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.nominees.list.path] }),
  });
}

export function useDeleteNominee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.nominees.delete.path, { id });
      const res = await fetch(url, { method: api.nominees.delete.method });
      if (!res.ok) throw new Error("Failed to delete nominee");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.nominees.list.path] }),
  });
}

export function useSetNomineeVotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, votes }: { id: number; votes: number }) => {
      const res = await fetch(`/api/nominees/${id}/votes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      if (!res.ok) throw new Error("Failed to update votes");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.nominees.list.path] }),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch(api.uploads.create.path, {
        method: api.uploads.create.method,
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      return data.url;
    },
  });
}
