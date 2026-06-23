import Image from "next/image";

export function CountriesWeService() {
  const countries = [
    { name: "Australia", code: "au" },
    { name: "United States", code: "us" },
    { name: "United Kingdom", code: "gb" },
    { name: "Canada", code: "ca" },
    { name: "China", code: "cn" },
    { name: "Indonesia", code: "id" },
  ];

  return (
    <section className="py-12 text-gray-900 px-4">
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Local data, local accuracy</h2>
        <p className="mt-2 text-sm text-gray-400 italic max-w-2xl mx-auto text-center">Industry multiples and benchmarks tailored to your market — so your appraisal reflects where your business actually trades, not a generic global average.</p>
      </div>

      <div className="mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-4">
          {countries.map((country) => (
            <div key={country.name} className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-md px-2 py-2 w-[130px] hover:shadow-md transition-shadow duration-300">
              <div className="relative w-[80px] h-[54px] shrink-0">
                <Image src={`https://flagcdn.com/w80/${country.code}.png`} fill alt={`${country.name} flag`} className="rounded-sm object-cover shadow-sm" />
              </div>
              <span className="text-sm font-medium text-gray-700">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
