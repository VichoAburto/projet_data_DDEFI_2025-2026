import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">About Us</h1>
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
        <div>

          <div className="space-y-6 text-slate-700 leading-relaxed text-justify">
            <p>
              This project was designed as an FX decision-support tool to help users
              decide when it may be most advantageous to exchange their money into
              euros.
            </p>

            <p>
              The main objective is to analyze the behaviour of CLP, BRL, and USD
              against EUR using historical exchange-rate data and machine learning
              models. Rather than simply displaying charts, the app is intended to
              answer a practical question: should the user exchange now, or wait for
              a potentially better day within the next month?
            </p>

            <p>
              To support that decision, the platform combines historical market data
              with predictive models that estimate short-term currency movements.
              The long-term goal is to provide users with a forecasted “best
              predicted day” to convert their money into euros, together with the
              expected exchange-rate advantage compared with exchanging today.
            </p>

            <p>
              In short, the app aims to transform foreign-exchange data into a more
              useful and understandable recommendation for real decision making.
            </p>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <Image
            src="/fx-illustration.png"
            alt="Money exchange illustration"
            width={460}
            height={360}
            className="rounded-2xl bg-white p-3 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}