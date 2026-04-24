"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearLocalStorage } from "./logout";

export function useAuth() {
  const router = useRouter();
  const redirected = useRef(false);
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("_t");
    }
    return null;
  });

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        redirected.current = true;
        clearLocalStorage();
        router.replace("/login");
        return;
      }
    };

    verify();
  }, []);

  return { token };
}
