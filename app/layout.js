export const metadata = {
  title: 'MINERVA AI — Critical Mineral Intelligence Platform',
  description: 'AI-powered uranium and critical mineral supply chain intelligence. Monitor mining, conversion, enrichment and fabrication in real time. See disruptions 47 days early.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#050810' }}>
        {children}
      </body>
    </html>
  );
}
