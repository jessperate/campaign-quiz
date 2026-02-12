import Link from "next/link";
import ChampionCardFan from "@/components/ChampionCardFan";
import HomeRecentPlayers from "@/components/HomeRecentPlayers";

export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #00CE50 0%, #00250E 31.25%)' }}>

      <div className="relative">
        {/* Header Navigation */}
        <header className="relative z-10 px-4 md:px-10 pt-4 md:pt-6">
          <img
            src="/images/header-nav.svg"
            alt="AirOps Navigation"
            style={{ width: '100%', maxWidth: '1400px', height: 'auto', margin: '0 auto', display: 'block' }}
          />
        </header>

        {/* Hero Section */}
        <section className="relative pt-12 md:pt-20 pb-16 px-6 overflow-hidden">
          {/* Hero background illustration — centered behind text */}
          <img
            src="/images/hero-illustration.avif"
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '1135px',
              height: '1135px',
              pointerEvents: 'none',
              opacity: 0.4,
            }}
          />

          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-white/80 text-[24px] md:text-[36px] lg:text-[42px] mb-2 leading-tight" style={{ fontFamily: 'Serrif, serif' }}>
              Get your player card
            </p>
            <h1 className="text-[52px] md:text-[90px] lg:text-[120px] text-white mb-6 tracking-tight leading-[0.9] uppercase text-center mx-auto" style={{ fontFamily: 'Knockout-91, Knockout, sans-serif' }}>
              HOW DO YOU<br />WIN AI SEARCH?
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Serrif, serif' }}>
              AI search has changed the game, but winning is easy with AirOps. Take the quiz to uncover your unique player archetype, see your best plays (and where to keep training), and get personalized resources to level up your game.
            </p>

            <Link
              href="/quiz"
              className="inline-flex items-center px-8 py-4 bg-[#00FF64] text-black rounded-full text-base font-bold hover:bg-[#00ff64]/90 transition-all"
            >
              Take the quiz
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <p className="text-[#00FF64] text-[13px] mt-6 uppercase tracking-[0.25em]" style={{ fontFamily: 'SaansMono, monospace' }}>
              Estimated time: 90 seconds
            </p>
          </div>
        </section>

        {/* Champion Cards Fan */}
        <ChampionCardFan />

        {/* Recent Players & Leaderboard */}
        <HomeRecentPlayers />

        {/* CTA Section */}
        <section className="relative py-20 md:py-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-[36px] md:text-[56px] lg:text-[64px] text-white mb-6 leading-[1.1]" style={{ fontFamily: 'Serrif, serif' }}>
              Get in leader,<br />we&apos;re driving growth.
            </h2>
            <p className="text-white/70 text-base md:text-lg mb-8 max-w-lg mx-auto">
              Work directly with our expert team to create your content game plan. We&apos;ll help you build the systems and train your team to succeed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full sm:flex-1 px-5 py-3 bg-[#00FF64]/20 border border-[#00FF64]/40 rounded-full text-white placeholder-[#00FF64]/60 focus:outline-none focus:border-[#00FF64] text-sm"
              />
              <button className="inline-flex items-center px-5 py-3 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors text-sm whitespace-nowrap">
                Book a Demo
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
