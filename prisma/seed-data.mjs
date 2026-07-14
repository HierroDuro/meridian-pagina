/**
 * Seed catalog data — ~40 original, fictitious B2B products across three
 * categories. Names, SKUs and brands are invented for this project (not
 * copied from any real catalog); only the *page layout* of this project
 * was inspired by a reference screenshot, per the project brief.
 */

export const categories = [
  { name: "Tecnología", slug: "tecnologia" },
  { name: "Resmas", slug: "resmas" },
  { name: "Gráfica", slug: "grafica" },
];

/** @type {Array<{sku:string,name:string,description:string,brand:string,categorySlug:string,price:number,stock:number,isFeatured:boolean,isOnSale:boolean,galleryImages?:string[]}>} */
export const products = [
  // ── Tecnología ────────────────────────────────────────────────
  { sku: "KST-MF210", name: "Multifunción InkTank KST-MF210", description: "Impresora multifunción con sistema de tinta continua, ideal para alto volumen de impresión en oficina.", brand: "Kestrel", categorySlug: "tecnologia", price: 189999, stock: 14, isFeatured: true, isOnSale: false },
  { sku: "KST-MF430", name: "Multifunción InkTank KST-MF430 WiFi", description: "Impresora multifunción con conectividad WiFi, impresión dúplex automática y bandeja de 250 hojas.", brand: "Kestrel", categorySlug: "tecnologia", price: 249999, stock: 9, isFeatured: true, isOnSale: false, galleryImages: ["/placeholders/KST-MF210.png", "/placeholders/KST-SC800.png"] },
  { sku: "KST-SC800", name: "Escáner de documentos KST-SC800", description: "Escáner dúplex de alta velocidad, hasta 40 páginas por minuto, alimentador automático de 50 hojas.", brand: "Kestrel", categorySlug: "tecnologia", price: 312000, stock: 5, isFeatured: false, isOnSale: false },
  { sku: "KST-SC1250", name: "Escáner portátil KST-SC1250 Wireless", description: "Escáner portátil inalámbrico con batería recargable, compacto y liviano para uso móvil.", brand: "Kestrel", categorySlug: "tecnologia", price: 198500, stock: 0, isFeatured: false, isOnSale: false },
  { sku: "IFL-BT5001C", name: "Botella de tinta InkFlow Cyan 70ml", description: "Botella de tinta original cian de alto rendimiento, compatible con impresoras de sistema continuo.", brand: "InkFlow", categorySlug: "tecnologia", price: 8900, stock: 120, isFeatured: false, isOnSale: true },
  { sku: "IFL-BT5001M", name: "Botella de tinta InkFlow Magenta 70ml", description: "Botella de tinta original magenta de alto rendimiento, compatible con impresoras de sistema continuo.", brand: "InkFlow", categorySlug: "tecnologia", price: 8900, stock: 98, isFeatured: false, isOnSale: true },
  { sku: "IFL-BT5001Y", name: "Botella de tinta InkFlow Amarillo 70ml", description: "Botella de tinta original amarilla de alto rendimiento, compatible con impresoras de sistema continuo.", brand: "InkFlow", categorySlug: "tecnologia", price: 8900, stock: 87, isFeatured: false, isOnSale: false },
  { sku: "IFL-BT5001K", name: "Botella de tinta InkFlow Negro 70ml", description: "Botella de tinta original negra de alto rendimiento, compatible con impresoras de sistema continuo.", brand: "InkFlow", categorySlug: "tecnologia", price: 7900, stock: 140, isFeatured: false, isOnSale: false },
  { sku: "BCR-TN2400", name: "Tóner ByteCore TN-2400 Negro", description: "Cartucho de tóner original, rendimiento de hasta 3.000 páginas al 5% de cobertura.", brand: "ByteCore", categorySlug: "tecnologia", price: 45000, stock: 32, isFeatured: false, isOnSale: false },
  { sku: "MRL-KB100", name: "Teclado ergonómico Marlin KB-100", description: "Teclado de oficina con reposamuñecas integrado y switches silenciosos.", brand: "Marlin Tech", categorySlug: "tecnologia", price: 34500, stock: 60, isFeatured: false, isOnSale: false },
  { sku: "MRL-MS220", name: "Mouse inalámbrico Marlin MS-220", description: "Mouse inalámbrico de 6 botones con sensor óptico de 1600 DPI y batería de larga duración.", brand: "Marlin Tech", categorySlug: "tecnologia", price: 22900, stock: 75, isFeatured: false, isOnSale: true },
  { sku: "MRL-WC50", name: "Webcam Full HD Marlin WC-50", description: "Webcam 1080p con micrófono integrado y corrección automática de luz, ideal para videollamadas.", brand: "Marlin Tech", categorySlug: "tecnologia", price: 56000, stock: 18, isFeatured: true, isOnSale: false, galleryImages: ["/placeholders/MRL-KB100.png", "/placeholders/MRL-MS220.png"] },
  { sku: "BCR-UPS1500", name: "UPS ByteCore 1500VA", description: "Estabilizador y batería de respaldo de 1500VA con 6 tomas protegidas, ideal para equipos de oficina.", brand: "ByteCore", categorySlug: "tecnologia", price: 178000, stock: 11, isFeatured: false, isOnSale: false },
  { sku: "BCR-HD2TB", name: "Disco externo ByteCore 2TB USB 3.0", description: "Disco rígido externo portátil de 2TB con conexión USB 3.0 de alta velocidad.", brand: "ByteCore", categorySlug: "tecnologia", price: 95000, stock: 0, isFeatured: false, isOnSale: false },

  // ── Resmas ────────────────────────────────────────────────────
  { sku: "PGP-A4-75", name: "Resma A4 75g PagePro", description: "Resma de papel A4 blanco de 75 gramos, 500 hojas, uso general de oficina.", brand: "PagePro", categorySlug: "resmas", price: 6200, stock: 300, isFeatured: true, isOnSale: false },
  { sku: "PGP-A4-80", name: "Resma A4 80g PagePro Premium", description: "Resma de papel A4 blanco de 80 gramos de alta opacidad, 500 hojas, calidad premium.", brand: "PagePro", categorySlug: "resmas", price: 7400, stock: 240, isFeatured: false, isOnSale: false },
  { sku: "PGP-A3-80", name: "Resma A3 80g PagePro", description: "Resma de papel A3 blanco de 80 gramos, 500 hojas, ideal para planos e impresiones grandes.", brand: "PagePro", categorySlug: "resmas", price: 13800, stock: 85, isFeatured: false, isOnSale: false },
  { sku: "PGP-OF75", name: "Resma Oficio 75g PagePro", description: "Resma de papel tamaño oficio de 75 gramos, 500 hojas, formato tradicional argentino.", brand: "PagePro", categorySlug: "resmas", price: 6900, stock: 150, isFeatured: false, isOnSale: false },
  { sku: "PGP-COLOR", name: "Resma A4 Color Pastel PagePro", description: "Resma de papel A4 de colores pastel surtidos, 100 hojas, ideal para presentaciones.", brand: "PagePro", categorySlug: "resmas", price: 9500, stock: 40, isFeatured: false, isOnSale: true },
  { sku: "PGP-COLORF", name: "Resma A4 Color Fuerte PagePro", description: "Resma de papel A4 de colores intensos surtidos, 100 hojas, alta visibilidad.", brand: "PagePro", categorySlug: "resmas", price: 9900, stock: 35, isFeatured: false, isOnSale: false },
  { sku: "CHW-CART180", name: "Cartulina Blanca 180g ChromaWorks", description: "Paquete de cartulina blanca de 180 gramos, 50 hojas A4, para impresión y manualidades.", brand: "ChromaWorks", categorySlug: "resmas", price: 8200, stock: 60, isFeatured: false, isOnSale: false },
  { sku: "CHW-FOTOA4", name: "Papel Fotográfico Glossy A4 ChromaWorks", description: "Papel fotográfico brillante A4 de 200g, 20 hojas, para impresión de fotos de alta calidad.", brand: "ChromaWorks", categorySlug: "resmas", price: 11500, stock: 55, isFeatured: true, isOnSale: false },
  { sku: "CHW-TERM80", name: "Rollo Papel Térmico 80mm ChromaWorks", description: "Pack x10 rollos de papel térmico de 80mm para impresoras fiscales y tickets.", brand: "ChromaWorks", categorySlug: "resmas", price: 15400, stock: 0, isFeatured: false, isOnSale: false },
  { sku: "CHW-RECIC80", name: "Resma A4 Reciclada 80g ChromaWorks", description: "Resma de papel A4 reciclado de 80 gramos, 500 hojas, opción ecológica certificada.", brand: "ChromaWorks", categorySlug: "resmas", price: 8100, stock: 95, isFeatured: false, isOnSale: false },
  { sku: "PGP-ADHES", name: "Papel Autoadhesivo A4 PagePro", description: "Pack x25 hojas de papel autoadhesivo A4 blanco mate, para etiquetas e impresión directa.", brand: "PagePro", categorySlug: "resmas", price: 7800, stock: 70, isFeatured: false, isOnSale: false },
  { sku: "CHW-BLOCKA4", name: "Block de Notas A4 Rayado ChromaWorks", description: "Block de notas A4 rayado de 80 hojas, encuadernado superior, tapa dura.", brand: "ChromaWorks", categorySlug: "resmas", price: 4200, stock: 200, isFeatured: false, isOnSale: true },
  { sku: "PGP-SULFA4", name: "Papel Sulfito A4 PagePro", description: "Resma de papel sulfito A4 de 50 gramos, 500 hojas, ideal para moldes y patrones.", brand: "PagePro", categorySlug: "resmas", price: 5600, stock: 45, isFeatured: false, isOnSale: false },

  // ── Gráfica ───────────────────────────────────────────────────
  { sku: "GRL-VIN-BR", name: "Rollo Vinilo Adhesivo Brillante GraphLine", description: "Rollo de vinilo adhesivo brillante de 1.06m x 25m, ideal para cartelería e impresión digital.", brand: "GraphLine", categorySlug: "grafica", price: 68000, stock: 22, isFeatured: true, isOnSale: false },
  { sku: "GRL-VIN-MT", name: "Rollo Vinilo Adhesivo Mate GraphLine", description: "Rollo de vinilo adhesivo mate de 1.06m x 25m, terminación sin brillo para interiores y exteriores.", brand: "GraphLine", categorySlug: "grafica", price: 68000, stock: 18, isFeatured: false, isOnSale: false },
  { sku: "GRL-LONA440", name: "Lona Frontlit 440g GraphLine", description: "Rollo de lona frontlit de 440 gramos, 1.60m x 20m, para banners y gigantografías.", brand: "GraphLine", categorySlug: "grafica", price: 94000, stock: 12, isFeatured: false, isOnSale: false },
  { sku: "GRL-BANNER", name: "Rollo Banner Satinado GraphLine", description: "Rollo de papel banner satinado de 1.27m x 30m para impresión de gran formato.", brand: "GraphLine", categorySlug: "grafica", price: 76000, stock: 9, isFeatured: false, isOnSale: true },
  { sku: "CHW-CUTTER", name: "Cutter de Precisión ChromaWorks", description: "Cutter profesional de precisión con mango ergonómico y repuestos de hojas incluidos.", brand: "ChromaWorks", categorySlug: "grafica", price: 8900, stock: 65, isFeatured: false, isOnSale: false },
  { sku: "CHW-TABCORTE", name: "Tabla de Corte A2 Autocurable ChromaWorks", description: "Tabla de corte autocurable tamaño A2 con grilla impresa, doble cara.", brand: "ChromaWorks", categorySlug: "grafica", price: 24500, stock: 30, isFeatured: false, isOnSale: false },
  { sku: "CHW-MARC24", name: "Set Marcadores Profesionales x24 ChromaWorks", description: "Set de 24 marcadores profesionales de doble punta para diseño e ilustración.", brand: "ChromaWorks", categorySlug: "grafica", price: 32000, stock: 40, isFeatured: false, isOnSale: false },
  { sku: "GRL-SUBTIN", name: "Tinta de Sublimación CMYK GraphLine", description: "Set de 4 botellas de tinta de sublimación CMYK de 100ml cada una, alta definición de color.", brand: "GraphLine", categorySlug: "grafica", price: 58000, stock: 25, isFeatured: false, isOnSale: false },
  { sku: "GRL-TRANSF", name: "Papel Transfer Textil A4 GraphLine", description: "Pack x50 hojas de papel transfer para tela clara, compatible con impresión láser y sublimación.", brand: "GraphLine", categorySlug: "grafica", price: 19800, stock: 50, isFeatured: false, isOnSale: false },
  { sku: "CHW-LAMIN", name: "Laminadora A3 ChromaWorks Pro", description: "Laminadora de rodillos en caliente y frío, formato A3, encendido rápido en 3 minutos.", brand: "ChromaWorks", categorySlug: "grafica", price: 145000, stock: 6, isFeatured: true, isOnSale: false, galleryImages: ["/placeholders/CHW-GUILL.png", "/placeholders/CHW-TABCORTE.png"] },
  { sku: "CHW-GUILL", name: "Guillotina A3 ChromaWorks", description: "Guillotina de palanca para formato A3 con regla métrica y sujeción de seguridad.", brand: "ChromaWorks", categorySlug: "grafica", price: 89000, stock: 8, isFeatured: false, isOnSale: false },
  { sku: "GRL-CALOR", name: "Pistola de Calor GraphLine 2000W", description: "Pistola de calor de 2000W con dos velocidades, ideal para vinilos y termocontraíble.", brand: "GraphLine", categorySlug: "grafica", price: 41000, stock: 15, isFeatured: false, isOnSale: false },
  { sku: "GRL-PRENSA", name: "Prensa Térmica GraphLine 38x38", description: "Prensa térmica manual de 38x38cm para estampado textil, control digital de tiempo y temperatura.", brand: "GraphLine", categorySlug: "grafica", price: 285000, stock: 0, isFeatured: false, isOnSale: false },
];
