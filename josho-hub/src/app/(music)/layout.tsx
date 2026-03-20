import { Header } from "@/components/layout/header";

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
