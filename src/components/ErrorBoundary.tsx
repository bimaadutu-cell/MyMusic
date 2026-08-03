"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("MyMusik recovered from UI error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-dvh place-items-center bg-[#030303] px-6 text-white">
          <section className="max-w-md rounded-3xl bg-[#121212] p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">Anti Crash</p>
            <h1 className="mt-3 text-3xl font-bold">MyMusik tetap aman</h1>
            <p className="mt-3 text-zinc-400">Terjadi error kecil pada tampilan. Muat ulang untuk melanjutkan.</p>
            <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-[#ff0000] px-6 py-3 font-semibold">
              Reload Aplikasi
            </button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
