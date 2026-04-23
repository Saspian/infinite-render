"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtVerify } from "jose";
import { clearLocalStorage } from "./logout";


export function useAuth() {
  const router = useRouter();
  const [authenticating, isLoading] = useState(true);
  const redirected = useRef(false);
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("_t");
    }
    return null;
  });

  useEffect(() => {
    const verify = async () => {
      if (redirected.current) return;
      const _id = localStorage.getItem("_id");

      if (!token) {
        redirected.current = true;
        router.replace("/login");
        return;
      }

      try {
        const secret = new TextEncoder().encode(
          process.env.NEXT_PUBLIC_TOKEN_SECRET!,
        );

        const { payload } = await jwtVerify(token, secret);

        if (_id !== payload._id) {
          redirected.current = true;
          router.replace("/login");
          return;
        }
        isLoading(false);
      } catch (error) {
        console.log("JWT Error:", error);

        clearLocalStorage();
        redirected.current = true;
        router.replace("/login");
      }
    };

    verify();
  }, []);

  return { token, authenticating };
}
