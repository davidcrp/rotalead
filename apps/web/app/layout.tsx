import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RotaLead — Distribuição Inteligente de Leads',
  description: 'Distribua leads entre sua equipe de vendas de forma igualitária e automática.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
