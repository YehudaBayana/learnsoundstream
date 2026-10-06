import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login, logout, register } from "../api/auth";
import { getCurrentResponse } from "@/types/global.types";
import { authKeys } from "@/shared/api/keys";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => register(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onError: (error) => {
      console.error("Logout failed:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useGetCurrentUser() {
  return useQuery<getCurrentResponse>({
    queryKey: authKeys.me(),
    queryFn: getCurrentUser,
    retry: false,
  });
}
