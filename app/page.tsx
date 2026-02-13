import Link from "next/link";
import HomeRecentPlayers from "@/components/HomeRecentPlayers";

export default function Home() {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #00CE50 0%, #00250E 31.25%)' }}>

      {/* Hero background illustration — pinned to top, centered */}
      <img
        src="/images/hero-illustration.avif"
        alt=""
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1135px',
          height: '1135px',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      />

      <div className="relative">
        {/* Hero Section */}
        <section className="relative pt-24 md:pt-36 pb-16 px-6 overflow-hidden">

          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-white/80 text-[24px] md:text-[36px] lg:text-[42px] mb-2 leading-tight" style={{ fontFamily: 'Serrif, serif' }}>
              Get your player card
            </p>
            <h1 className="text-[52px] md:text-[90px] lg:text-[120px] text-white mb-6 tracking-tight leading-[0.9] uppercase text-center mx-auto" style={{ fontFamily: 'Knockout-91, Knockout, sans-serif' }}>
              WHAT'S YOUR<br />MARKETYPE?
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

        {/* Recent Players & Leaderboard */}
        <HomeRecentPlayers />



      </div>
    </div>
  );
}
