import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { fetchCurrentUser } from "../api";
import { useUserStore } from "../store/user-store";

export const AuthBootstrapper = () => {
  const tokens = useUserStore((state) => state.tokens);
  const profile = useUserStore((state) => state.profile);
  const setAuth = useUserStore((state) => state.setAuth);
  const logout = useUserStore((state) => state.logout);

  const isFetching = useRef(false);

  useEffect(() => {
    if (!tokens || profile || isFetching.current) {
      return;
    }

    isFetching.current = true;

    fetchCurrentUser()
      .then((user) => {
        setAuth(user, tokens);
      })
      .catch((error) => {
        console.error("Failed to bootstrap auth", error);
        toast.error("Your session expired, please sign in again");
        logout();
      })
      .finally(() => {
        isFetching.current = false;
      });
    // setAuth and logout are stable functions from zustand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, profile]);

  return null;
};
