import Link from "next/link";
import { US, BR, CL, EU } from "country-flag-icons/react/3x2";
import PageHeader from "@/components/PageHeader";

const pairs = [
  {
    pair: "EURUSD",
    title: "USD → EUR",
    description: "Explore how the US Dollar moves against the Euro.",
    flag: US,
  },
  {
    pair: "EURBRL",
    title: "BRL → EUR",
    description: "Analyze Brazilian Real exchange-rate behaviour versus the Euro.",
    flag: BR,
  },
  {
    pair: "EURCLP",
    title: "CLP → EUR",
    description: "Track Chilean Peso movements to identify favorable conversion windows.",
    flag: CL,
  },
];

export default function HomePage() {
  return (
    <div className="py-12 md:py-20">
      <section className="mb-16">
        <div className="max-w-4xl">
          <PageHeader
            eyebrow="FX Decision Support"
            title="Find the best predicted day to exchange your money into euros."
            description="This app helps users decide when it may be most favorable, within the next month, to convert CLP, BRL, or USD into EUR using historical exchange-rate data and machine learning forecasts."
            actions={
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/planner"
                  className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
                >
                  Open Planner
                </Link>

                <Link
                  href="/pair/EURUSD"
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:border-slate-400 hover:text-slate-900 transition"
                >
                  Explore FX Pairs
                </Link>

                <Link
                  href="/about"
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:border-slate-400 hover:text-slate-900 transition"
                >
                  About the Project
                </Link>
              </div>
            }
          />
        </div>
      </section>

      <section className="mb-16">
        <Link
          href="/planner"
          className="block rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm hover:shadow-md transition"
        >
          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700 mb-3">
                Planner
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Calculate the best predicted date to exchange into EUR
              </h2>

              <p className="text-slate-600 leading-relaxed max-w-2xl mb-5">
                Use the planner to estimate the most favorable day within the
                next 30 days to convert your local currency into euros.
              </p>

              <div className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-white font-medium">
                Go to Planner
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <US className="w-10 h-7 mx-auto mb-3 rounded-sm" />
                <div className="text-sm font-semibold text-slate-900">USD</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <BR className="w-10 h-7 mx-auto mb-3 rounded-sm" />
                <div className="text-sm font-semibold text-slate-900">BRL</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <CL className="w-10 h-7 mx-auto mb-3 rounded-sm" />
                <div className="text-sm font-semibold text-slate-900">CLP</div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="mb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {pairs.map((item) => (
            <Link
              key={item.pair}
              href={`/pair/${item.pair}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
                <div className="flex items-center gap-1">
                  <item.flag className="w-8 h-6 rounded-sm" />
                </div>
                {item.title}
                <div className="flex items-center gap-1">
                  <EU className="w-8 h-6 rounded-sm" />
                </div>
              </div>

              <div className="text-slate-600 mb-4">{item.description}</div>

              <div className="text-sm font-medium text-teal-700">
                Open chart →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Historical analysis
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Inspect how exchange rates evolved over time and compare
                short-term and long-term trends across major currency pairs.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Monthly decision support
              </h2>
              <p className="text-slate-600 leading-relaxed">
                The goal is to help users estimate the most favorable day,
                within the next month, to exchange their local currency into
                euros.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Machine learning forecasts
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Predictive models are used to explore short-term FX behaviour
                and support smarter exchange timing decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}