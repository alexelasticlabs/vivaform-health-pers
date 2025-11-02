import { useEffect, useRef } from "react";

import { me } from "../api/auth";
import { useUserStore } from "../store/user-store";

export const AuthBootstrapper = () => {
  const { tokens, profile, setSession, clearSession } = useUserStore((state) => ({
    tokens: state.tokens,
    profile: state.profile,
    setSession: state.setSession,
    clearSession: state.clearSession
  }));

  const isFetching = useRef(false);

  useEffect(() => {
    if (!tokens || profile || isFetching.current) {
      return;
    }

    isFetching.current = true;

    me()
      .then((user) => {
        if (tokens) {
          setSession(user, tokens);
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        isFetching.current = false;
      });
  }, [tokens, profile, setSession, clearSession]);

  return null;
};