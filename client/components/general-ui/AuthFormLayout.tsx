import Image from "next/image";
import { ReactNode } from "react";

export default function AuthFormLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-linear-to-b from-sky-200 via-blue-50 to-cyan-100">
      <section className="max-w-[80vw] md:max-w-[45vw] w-full p-3">
        <header className="flex flex-col gap-y-1 mb-10">
          <Image src="/intaleks.png" alt="Intaleks Logo" width={500} height={50} className="self-center" />
          <p className="text-center text-black font-normal text-xl">{title}</p>
        </header>

        <div className="flex flex-col gap-y-4 py-10">{children}</div>
      </section>
    </div>
  );
}
