function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-slate-800 py-6 text-slate-400">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="text-sm">&copy; {year} MERN App. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
