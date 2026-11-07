"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { get, ref } from "firebase/database";
import { getDb, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { Btn, Field } from "@/components/ui/kit";

export interface ControlUser {
  label: string;
  signOut: (() => void) | null;
}

// Operators sign in with a Firebase account listed under admins/<uid> = true.
// The database rules enforce the same thing. Sign-in persists on the device,
// so a signed-in laptop keeps working offline. Local mode needs no login.
export function ControlGate({ children }: { children: (user: ControlUser) => React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setIsAdmin(null);
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    let cancelled = false;
    // remember the admin check so a reload while offline doesn't lock us out
    const key = `hxm:admin:${user.uid}`;
    if (localStorage.getItem(key) === "1") setIsAdmin(true);
    get(ref(getDb(), `admins/${user.uid}`))
      .then((snap) => {
        if (cancelled) return;
        const ok = snap.val() === true;
        localStorage.setItem(key, ok ? "1" : "");
        setIsAdmin(ok);
      })
      .catch(() => !cancelled && setIsAdmin(localStorage.getItem(key) === "1"));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!isFirebaseConfigured) return <>{children({ label: "Local mode (no Firebase)", signOut: null })}</>;

  const out = () => signOut(getFirebaseAuth());
  if (user === undefined || (user && isAdmin === null)) return <Frame><p className="text-ui-muted">Checking account…</p></Frame>;
  if (!user) return <Frame><LoginForm /></Frame>;
  if (!isAdmin)
    return (
      <Frame>
        <p className="text-[17px] font-medium">{user.email} isn’t an operator.</p>
        <p className="mt-2 text-[14px] text-ui-muted">Add its uid under admins/ in the database, or sign in with the operator account.</p>
        <Btn onClick={out} size="lg" className="mt-6 w-full">Sign out</Btn>
      </Frame>
    );
  return <>{children({ label: user.email ?? "Signed in", signOut: out })}</>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="ui flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[20px] bg-ui-s1 p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/hackx/logo-on-dark.png" alt="hackX" className="mb-8 h-12" />
        <h1 className="ui-display mb-6 text-[40px]">Media control</h1>
        {children}
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        } catch {
          setError("Wrong email or password (or offline).");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" required />
      <Field type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" required />
      {error && <p className="text-[13px] text-[#ff6b5e]">{error}</p>}
      <Btn type="submit" variant="primary" size="lg" disabled={busy} className="w-full">
        {busy ? "Signing in…" : "Sign in"}
      </Btn>
    </form>
  );
}
