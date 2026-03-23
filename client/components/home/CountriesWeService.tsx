export function CountriesWeService() {
  const countries = [
    { name: "Australia", flag: "🇦🇺" },
    { name: "United States", flag: "🇺🇸" },
    { name: "United Kingdom", flag: "🇬🇧" },
    { name: "Canada", flag: "🇨🇦" },
    { name: "China", flag: "🇨🇳" },
    // { name: "Indonesia", flag: "🇮🇩" },
  ];

  return (
    <section className="py-12 text-gray-900 px-4">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Countries We Service</h2>
      </div>

      <div className="mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-4">
          {countries.map((country) => (
            <div key={country.name} className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-2 w-[130px] hover:shadow-md transition-shadow duration-300">
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
