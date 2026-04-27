import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UserSession {
  loggedIn: boolean;
  id?: number;
  email?: string;
  username?: string;
  phoneNumber?: string;
}

export function useUserAuth() {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<UserSession>({
    queryKey: ["/api/user/me"],
  });

  const signupMutation = useMutation({
    mutationFn: (data: { email: string; username: string; phoneNumber: string; password: string }) =>
      apiRequest("POST", "/api/user/signup", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/user/me"] }),
  });

  const loginMutation = useMutation({
    mutationFn: (data: { emailOrUsername: string; password: string }) =>
      apiRequest("POST", "/api/user/login", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/user/me"] }),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/logout"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/user/me"] });
      qc.invalidateQueries({ queryKey: ["/api/tickets/my"] });
    },
  });

  return { user, isLoading, signupMutation, loginMutation, logoutMutation };
}
