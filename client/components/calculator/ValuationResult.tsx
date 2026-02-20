interface ValuationResultProps {
  title: string;
  value: string;
}

export function ValuationResult({ title, value }: ValuationResultProps) {
  return (
    <div className="bg-gray-100 rounded-lg py-6 px-8 text-center mt-6">
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
