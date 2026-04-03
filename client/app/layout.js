import '../src/index.css';

export const metadata = {
  title: 'AyurVAID',
  description: 'Premium Ayurvedic Health Intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
