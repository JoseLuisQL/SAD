import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expedientes | Sistema Integrado de Archivos Digitales',
  description: 'Gestión de expedientes administrativos - Agrupe y organice documentos relacionados con trazabilidad y control completo.',
  keywords: ['expedientes', 'gestión documental', 'trámites', 'folio', 'documentos', 'DISA CHINCHEROS'],
};

export default function ExpedientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
