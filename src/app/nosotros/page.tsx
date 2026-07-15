import type { Metadata } from "next";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description: `Conocé a ${siteConfig.name}, tu proveedor B2B de confianza.`,
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main
        className="mx-auto max-w-4xl px-6 pb-24 lg:px-10"
        style={{ paddingTop: siteConfig.headerHeight + 48 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nosotros</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          En {siteConfig.name} conectamos empresas con el mejor catálogo de tecnología, resmas y
          artículos gráficos, con stock actualizado y atención personalizada.
        </p>
      </main>
      <Footer />
    </div>
  );
}
