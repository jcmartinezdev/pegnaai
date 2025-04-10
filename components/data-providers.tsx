"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SyncDataProvider } from "@/components/sync-data-provider";

const browserQueryClient = new QueryClient();

export default function DataProviders({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  return (
    <QueryClientProvider client={browserQueryClient}>
      <SyncDataProvider userId={userId}>{children}</SyncDataProvider>
    </QueryClientProvider>
  );
}
