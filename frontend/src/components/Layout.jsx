import Header from './Header';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-8">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
