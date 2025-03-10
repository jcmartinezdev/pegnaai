import Sidebar from "@/components/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-dvh bg-background text-foreground">
      <Sidebar />
      {children}
    </div>
  );
}
