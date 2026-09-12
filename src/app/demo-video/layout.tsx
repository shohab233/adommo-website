import type { Metadata } from 'next';

export const metadata: Metadata = {
  referrer: 'strict-origin-when-cross-origin',
};

export default function DemoVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
