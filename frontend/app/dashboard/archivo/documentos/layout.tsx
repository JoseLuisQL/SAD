import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentos | Sistema Integrado de Archivos Digitales',
  description: 'Gestión de documentos digitales - Carga, organización, firma digital y OCR para documentos administrativos con control de versiones.',
  keywords: ['documentos', 'firma digital', 'OCR', 'gestión documental', 'versiones', 'DISA CHINCHEROS'],
};

export default function DocumentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
