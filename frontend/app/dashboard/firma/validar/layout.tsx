import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Validación de Firma Digital | SAD',
  description: 'Centro integral de verificación de firmas digitales. Valide la autenticidad, integridad y estado de las firmas electrónicas de sus documentos con herramientas internas y acceso al validador oficial de Firma Perú.',
};

export default function ValidarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
