function Page({ title }) {
  return (
    <div className="mx-auto min-h-[400px] max-w-6xl rounded-lg bg-white px-6 py-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-800">{title}</h1>
    </div>
  );
}

export default Page;
