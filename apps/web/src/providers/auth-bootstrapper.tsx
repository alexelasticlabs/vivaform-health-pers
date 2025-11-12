import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import { fetchCurrentUser } from "@/api";
import { useUserStore } from "@/store/user-store";
import { useOfflineStore } from "@/store";

export const AuthBootstrapper = () => {
  const accessToken = useUserStore((state) => state.accessToken);
  const profile = useUserStore((state) => state.profile);
  const setAuth = useUserStore((state) => state.setAuth);
  const logout = useUserStore((state) => state.logout);

  const isFetching = useRef(false);

  useEffect(() => {
    if (!accessToken || profile || isFetching.current) {
      return;
    }

    isFetching.current = true;

    fetchCurrentUser()
      .then((user) => {
        setAuth(user, accessToken);
      })
      .catch((error: AxiosError | any) => {
        console.error("Failed to bootstrap auth", error);
        const status = error?.response?.status;
        if (status === 401) {
          toast.error("Your session expired, please sign in again");
          logout();
        } else {
          // Network/CORS/backend down
          useOfflineStore.getState().setOffline(true);
          toast.warning("Server is unreachable. Some features may be limited offline.");
        }
      })
      .finally(() => {
        isFetching.current = false;
      });
    // setAuth and logout are stable functions from zustand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, profile]);

  return null;
};
