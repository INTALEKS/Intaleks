export function CountriesWeService() {
  const countries = [
    { name: "Australia", flag: "🇦🇺" },
    { name: "United States", flag: "🇺🇸" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "China", flag: "🇨🇳" },
    { name: "Indonesia", flag: "🇮🇩" },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Countries We Service</span>
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded">NEW</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {countries.map((country) => (
            <div key={country.name} className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm min-w-[100px]">
              <span className="text-4xl">{country.flag}</span>
              <span className="text-sm font-medium text-gray-700">{country.name}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-400 italic">Valuation multiples and industry data tailored to each local market</p>
      </div>
    </section>
  );
}
