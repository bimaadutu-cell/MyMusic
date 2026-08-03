"use client";

import { useState } from "react";

type Account = { name: string; email: string };

const readAccounts = (): Account[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("mymusik-google-accounts") ?? "[]") as Account[];
  } catch {
    return [];
  }
};

export default function GoogleChooserPage() {
  const [accounts, setAccounts] = useState<Account[]>(readAccounts());
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const choose = (account: Account) => {
    localStorage.setItem("mymusik-google-accounts", JSON.stringify([account, ...accounts.filter((a) => a.email !== account.email)]));
    localStorage.setItem("mymusik-auth", JSON.stringify(account));
    window.opener?.postMessage({ type: "mymusik-auth", user: account }, "*");
    window.close();
  };

  const addAccount = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) return;
    const account = { name: clean.split("@")[0].replace(/[._]/g, " "), email: clean };
    setAccounts((items) => [account, ...items]);
    setAdding(false);
    choose(account);
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[#121212] p-6 text-white">
      <section className="w-full max-w-sm rounded-3xl bg-white p-6 text-zinc-800 shadow-2xl">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5Z" />
            <path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2Z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48Z" />
          </svg>
          <span className="text-lg font-medium">Pilih akun</span>
        </div>
        <p className="mt-2 text-sm text-zinc-600">untuk melanjutkan ke MyMusik</p>
        <div className="mt-5 space-y-1">
          {accounts.map((account) => (
            <button key={account.email} onClick={() => choose(account)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-zinc-100">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff0000] text-sm font-bold text-white">{account.name[0]?.toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium capitalize">{account.name}</span>
                <span className="block truncate text-xs text-zinc-500">{account.email}</span>
              </span>
            </button>
          ))}
          {adding ? (
            <form onSubmit={addAccount} className="rounded-xl border border-zinc-200 p-3">
              <input autoFocus value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@gmail.com" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#4285F4]" />
              <button className="mt-2 w-full rounded-lg bg-[#1a73e8] py-2 text-sm font-semibold text-white">Lanjutkan</button>
            </form>
          ) : (
            <button onClick={() => setAdding(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#1a73e8] transition hover:bg-zinc-100">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 text-lg text-zinc-500">+</span>
              Gunakan akun lain
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
