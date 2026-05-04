import { redirect } from 'next/navigation';

export default async function EgresadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Este layout ya no necesita verificar auth.me porque el layout principal ya lo hace
  // Solo redirigir si llegamos aquí sin autenticación (caso edge)
  return <>{children}</>;
}
