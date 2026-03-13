export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-center text-sm text-slate-500">
        © {year} FX Predictor
      </div>
    </footer>
  );
}