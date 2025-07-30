import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <h3 className="text-2xl font-bold text-foreground">Nexaverse</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Membangun masa depan reputasi digital yang terdesentralisasi.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Github />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 col-span-1 md:col-span-2 lg:col-span-3">
          <div>
            <h4 className="font-semibold mb-3">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Jelajahi Kursus
                </Link>
              </li>
              <li>
                <Link
                  href="#creators"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Untuk Kreator
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Perusahaan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto py-4 px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nexaverse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
