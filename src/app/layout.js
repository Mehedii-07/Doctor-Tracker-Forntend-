import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Doctor Tracker - Administrative Portal',
  description: 'Enterprise healthcare portal for managing doctors, patients, and real-time medical analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
