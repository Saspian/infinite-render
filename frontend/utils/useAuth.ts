"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type AuthGuardResult = {
  token: string | null;
};

type JWTPayload = {
  exp?: number;
  [key: string]: unknown;
};

function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
 
    // A valid JWT always has exactly 3 dot-separated parts
    if (parts.length !== 3) return null;
 
    // The payload is the second part, base64url-encoded
    const base64 = parts[1]
      .replace(/-/g, "+")   // base64url → base64
      .replace(/_/g, "/");
 
    const json = atob(base64);
    const parsed = JSON.parse(json);
 
    // Must be a plain object, not an array / primitive
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
 
    return parsed as JWTPayload;
  } catch {
    // atob or JSON.parse failed — token is garbage
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJWTPayload(token);
 
  if (!payload) return false;
 
  // If `exp` exists, check it hasn't passed (exp is in seconds)
  if (typeof payload.exp === "number") {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (nowInSeconds >= payload.exp) return false;
  }
 
  return true;
}

export function useAuth(options: { protected: boolean }): AuthGuardResult {
  const router = useRouter();
  const pathname = usePathname();

  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("_t");
    }
    return null;
  });

  const valid = token !== null && isTokenValid(token);

  if (!valid && token !== null) {
    localStorage.removeItem("_t");
    localStorage.removeItem("loggedIn")
  }


  useEffect(() => {
    if (options.protected) {
      // Protected route
      if (!valid) {
        router.replace("/login");
      }
    } else {
      // Guest-only route
      if (valid) {
        router.replace("/task");
      }
    }
  }, [valid, pathname, options.protected, router]);

  return { token };
}
