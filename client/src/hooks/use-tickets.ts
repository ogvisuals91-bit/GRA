import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TicketPurchase } from "@shared/schema";

export const TICKET_TYPES = [
  { name: "Early Bird", price: 3500, description: "Limited to 50 spots only", limited: true, limit: 50, color: "from-amber-500 to-yellow-400" },
  { name: "Standard", price: 5000, description: "General admission ticket", limited: false, color: "from-slate-500 to-slate-400" },
  { name: "VIP (for 3)", price: 30000, description: "Premium access for 3 guests", limited: false, color: "from-purple-600 to-purple-400" },
  { name: "Bronze Sponsors Table", price: 300000, description: "Reserved table for sponsors", limited: false, color: "from-amber-700 to-amber-500" },
  { name: "Silver Sponsors Table", price: 500000, description: "Premium sponsors table", limited: false, color: "from-gray-400 to-gray-300" },
  { name: "Gold Sponsors Table", price: 700000, description: "Elite sponsors table", limited: false, color: "from-yellow-500 to-yellow-300" },
  { name: "Diamond Sponsors Table", price: 1000000, description: "Top-tier exclusive table", limited: false, color: "from-cyan-500 to-blue-400" },
] as const;

export function useTicketAvailability() {
  return useQuery<{ earlyBirdSold: number; earlyBirdRemaining: number }>({
    queryKey: ["/api/tickets/availability"],
    refetchInterval: 30000,
  });
}

export function useMyTickets() {
  return useQuery<TicketPurchase[]>({
    queryKey: ["/api/tickets/my"],
  });
}

export function useAdminTicketPurchases() {
  return useQuery<(TicketPurchase & { userEmail?: string; username?: string })[]>({
    queryKey: ["/api/admin/ticket-purchases"],
  });
}

export function useAdminUsers() {
  return useQuery<{ id: number; email: string; username: string; phoneNumber: string; createdAt: string }[]>({
    queryKey: ["/api/admin/users"],
  });
}

export function usePurchaseTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { ticketType: string; quantity: number; amountPaid: number; proofImageUrl: string; reference: string }) =>
      apiRequest("POST", "/api/tickets/purchase", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/tickets/my"] });
      qc.invalidateQueries({ queryKey: ["/api/tickets/availability"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/ticket-purchases"] });
    },
  });
}

export function useUpdateTicketPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, virtualTicketUrl, ticketCode }: { id: number; status: string; virtualTicketUrl?: string; ticketCode?: string }) =>
      apiRequest("PATCH", `/api/admin/ticket-purchases/${id}`, { status, virtualTicketUrl, ticketCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/ticket-purchases"] }),
  });
}

export function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`;
}
