import { Header, BottomNav } from "@/components/layout";
import { DemoWelcomeModal, DemoStickyBar } from "@/components/ui";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col pb-16">
      <Header />
      <DemoStickyBar />

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>

      <BottomNav />

      <DemoWelcomeModal />
    </div>
  );
}
