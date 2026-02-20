interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className = "" }: SectionHeaderProps) {
  return <div className={`bg-[#0a82ff] text-white py-2 px-4 rounded-t-md text-sm font-medium ${className}`}>{title}</div>;
}
