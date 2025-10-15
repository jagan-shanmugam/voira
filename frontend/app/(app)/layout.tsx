import { Header } from "@/components/header";
import { RootLayout } from "@/components/root-layout";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: RootLayoutProps) {
  return (
    <RootLayout className="bg-background">
      <Header />
      <main className="pt-16">{children}</main>
    </RootLayout>
  );
}
