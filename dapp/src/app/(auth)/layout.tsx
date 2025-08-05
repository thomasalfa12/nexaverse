// src/app/(auth)/layout.tsx

// Layout ini SANGAT ringan. Ia tidak memuat provider Web3.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
