import Image from "next/image";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatValue } from "@/lib/utils";

interface StatContainerProps {
  title: string;
  imageIcon: string;
  value: number;
  increase: boolean;
  currency?: boolean;
  changePercent?: number;
}

export default function StatContainer({ title, imageIcon, value, increase, currency = true, changePercent = 10 }: StatContainerProps) {
  const Trend = increase ? TrendingUp : TrendingDown;
  const formattedValue = formatValue(value, { currency });

  return (
    <div className="bg-(--light-gray-bg) h-[140px] rounded-sm flex flex-col p-2.5 justify-between items-start shrink-0 shadow">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-bold text-sm">{title}</h3>
        <Image src={imageIcon} alt={imageIcon} width={16} height={16} />
      </div>

      <h1 className="font-bold text-3xl">{formattedValue}</h1>

      <div className="flex items-center gap-x-1 text-sm">
        <Trend size={14} className={increase ? "text-green-600" : "text-red-500"} />
        <span className="text-[10px]">
          {changePercent}% {increase ? "INCREASE" : "DECREASE"} FROM LAST MONTH
        </span>
      </div>
    </div>
  );
}
