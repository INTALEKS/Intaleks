import Image from "next/image";

export function CountriesWeService() {
  const countries = [
    { name: "Australia", code: "au" },
  ];

  return (
    <section className="py-12 text-gray-900 px-4">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Australian Market Data &amp; Benchmarks</h2>
        <p className="mt-2 text-sm text-gray-600 italic max-w-2xl mx-auto text-center">Industry multiples and benchmarks tailored specifically to the Australian market — so your appraisal reflects where your business actually trades.</p>
      </div>

      <div className="mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-4">
          {countries.map((country) => (
            <div key={country.name} className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-3 w-[150px] shadow-sm">
              <div className="relative w-[80px] h-[54px] shrink-0">
                <Image src={`https://flagcdn.com/w80/${country.code}.png`} fill alt={`${country.name} flag`} className="rounded-sm object-cover shadow-sm" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
