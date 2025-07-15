import "@/app/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import Providers from "./providers"; // ⬅️ langsung import

export const metadata = { title: "Nexaverse" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Providers>
          <div className="flex min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
