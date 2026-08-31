"use client";

import { AlertTriangle, TrendingUp, HeartHandshake, ShieldAlert, ArrowRight, CheckCircle2, HelpCircle } from "lucide-react";

export function WhyValuation() {
  const assetChecklist = [
    { title: "What your home is worth", status: "You know", known: true },
    { title: "Your superannuation balance", status: "You know", known: true },
    { title: "Your investment portfolio", status: "You know", known: true },
    { title: "Your mortgage position", status: "You know", known: true },
    { title: "What your business is worth", status: "No idea", known: false },
  ];

  const hardTruthScenarios = [
    {
      title: "An offer lands out of nowhere",
      detail: "Thirty years of work, and a fortnight to decide.",
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "A partner wants out",
      detail: "Yesterday you built it together. Today you're negotiating.",
      icon: <HeartHandshake className="w-6 h-6 text-amber-600" />,
      color: "bg-amber-50 border-amber-200",
    },
    {
      title: "A marriage ends",
      detail: "The business is on the table, and nobody knows what it's worth.",
      icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
      color: "bg-rose-50 border-rose-200",
    },
    {
      title: "Health forces your hand",
      detail: "Retirement stops being a plan and becomes a deadline.",
      icon: <AlertTriangle className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
    },
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-16">
      {/* Asset Scorecard Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative">
        <div className="max-w-3xl mb-10">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider block mb-2">
            Your Business Isn't Just A Job
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
            It's One of Your Most Valuable Assets
          </h2>
          <p className="text-gray-300 text-sm sm:text-base mt-4 leading-relaxed">
            Your business represents years of hard work, sacrifice, risk and investment. It isn't just something you work in — it's an asset you're building. And like any asset, understanding its value helps you make smarter financial decisions.
          </p>
        </div>

        {/* Scorecard Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-white/10 flex justify-between">
            <span>Asset You Track Every Year</span>
            <span>Your Knowledge</span>
          </div>
          <div className="divide-y divide-white/10">
            {assetChecklist.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <span className={`text-sm sm:text-base font-medium ${!item.known ? "text-amber-300 font-bold" : "text-gray-200"}`}>
                  {item.title}
                </span>
                <div className="flex items-center gap-2">
                  {item.known ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-500/50 animate-pulse">
                      <HelpCircle className="w-3.5 h-3.5" /> {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Hard Truth Section */}
      <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm">
        <div className="max-w-3xl mb-10">
          <span className="text-rose-600 text-xs font-bold uppercase tracking-wider block mb-2">
            The Hard Truth
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Nobody plans for the day they need to know their business value
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
            These moments arrive without warning, and they never wait for you to get organised. The best outcomes don't go to the biggest businesses — they go to the owners who already knew their business value.
          </p>
        </div>

        {/* 4 Hard Truth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hardTruthScenarios.map((card, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border ${card.color} transition-all duration-200 hover:shadow-md`}>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-xs">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
