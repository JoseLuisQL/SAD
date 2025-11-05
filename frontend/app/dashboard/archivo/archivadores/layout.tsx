import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archivadores | Sistema Integrado de Archivos Digitales',
  description: 'Gestión de archivadores digitales - Organice expedientes por área, período o criterio administrativo con trazabilidad completa.',
  keywords: ['archivadores', 'gestión documental', 'archivo digital', 'expedientes', 'DISA CHINCHEROS'],
};

export default function ArchivadoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
