import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subset: ['latin'] });

export const metadata = {
  title: "My Journal App",
  description: "My journal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* {header} */}
        <main>{children}</main>
      </body>
    </html>
  );
}
