import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
