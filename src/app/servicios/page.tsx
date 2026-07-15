import type { Metadata } from "next";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Servicios de venta mayorista, logística y soporte para empresas.",
};

export default function ServiciosPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main
        className="mx-auto max-w-4xl px-6 pb-24 lg:px-10"
        style={{ paddingTop: siteConfig.headerHeight + 48 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Servicios</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Ofrecemos venta mayorista con precios preferenciales, logística propia y soporte
          técnico dedicado para empresas de todos los tamaños.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { title: "Venta mayorista", desc: "Precios diferenciales por volumen de compra." },
            { title: "Logística propia", desc: "Entregas coordinadas a todo el país." },
            { title: "Soporte técnico", desc: "Asesoramiento antes y después de la compra." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
