import "bootstrap/dist/css/bootstrap.min.css"
import "./globals.css"
import { AuthProvider } from "./lib/auth"

export const metadata = {
  title: "Loxine - Portal Pencari Kerja",
  description: "Portal antara pencari kerja dan perusahaan",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
