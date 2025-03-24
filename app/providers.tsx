"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const browserQueryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={browserQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
