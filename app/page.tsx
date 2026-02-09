import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/ui/Header";
import CardGrid from "@/components/CardGrid";

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#00A642]">
      {/* Full page background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/background-full.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      <div className="relative">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-36 md:pt-44 pb-16 px-6">
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-white/80 text-[32px] md:text-[48px] mb-2 leading-tight" style={{ fontFamily: 'Serrif, serif' }}>
              Do you have what it takes?
            </p>
            <h1 className="text-[60px] md:text-[100px] lg:text-[120px] text-[#75FFB9] mb-4 tracking-tight leading-none whitespace-nowrap" style={{ fontFamily: 'Knockout, sans-serif' }}>
              WIN AI SEARCH
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-6">
              A performance check for CMOs and content leaders navigating AI-driven growth.
            </p>

            <Link
              href="/quiz"
              className="inline-flex items-center px-6 py-3 bg-[#00FF64] text-black rounded-full text-base font-bold hover:bg-[#00ff64]/90 transition-all"
            >
              Take the quiz
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <p className="text-[#00FF64]/60 text-[14px] mt-4 uppercase tracking-[0.2em]" style={{ fontFamily: 'SaansMono, monospace' }}>
              Estimated time: 90 seconds (10 data points)
            </p>
          </div>
        </section>

        {/* Winning Section */}
        <section className="relative py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <h2 className="text-[36px] md:text-[56px] lg:text-[64px] text-white leading-[1.1]" style={{ fontFamily: 'Serrif, serif' }}>
                  Winning isn&apos;t just about speed.
                </h2>
              </div>
              <div>
                <p className="text-white/70 text-base md:text-lg mb-6">
                  This quiz helps you understand whether your content operation is built to compete in the next era, or still training for it.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex items-center px-6 py-3 bg-[#00FF64] text-black rounded-full text-base font-bold hover:bg-[#00ff64]/90 transition-all"
                >
                  Take the quiz
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="text-text-muted text-sm mt-3" style={{ fontFamily: 'SaansMono, monospace' }}>
                  Estimated time: 90 seconds (10 data points)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Champion Cards - Horizontal Scroll */}
        <section className="relative py-8 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex justify-center gap-4 md:gap-6 px-6 min-w-max pb-4">
              <Image
                src="/images/champion-cards.png"
                alt="Champion cards showing marketing leaders who win AI search"
                width={1920}
                height={400}
                className="h-[320px] md:h-[400px] lg:h-[480px] w-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Player Cards Grid */}
        <CardGrid />

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

        {/* Footer */}
        <footer className="relative bg-[#0a0a0a] py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-8 mb-10">
              <div className="flex gap-6 text-sm text-white">
                <a href="#" className="hover:text-[#00FF64]">Platform</a>
                <a href="#" className="hover:text-[#00FF64]">Careers</a>
                <a href="#" className="hover:text-[#00FF64]">Resources</a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-sm mb-12">
              <div>
                <h4 className="text-white font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="#" className="hover:text-white">Insights</a></li>
                  <li><a href="#" className="hover:text-white">Action</a></li>
                  <li><a href="#" className="hover:text-white">Platform</a></li>
                  <li><a href="#" className="hover:text-white">Grids</a></li>
                  <li><a href="#" className="hover:text-white">Workflows</a></li>
                  <li><a href="#" className="hover:text-white">Knowledge Bases</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Solutions</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="#" className="hover:text-white">Content & SEO</a></li>
                  <li><a href="#" className="hover:text-white">Teams</a></li>
                  <li><a href="#" className="hover:text-white">Marketing Agencies</a></li>
                  <li><a href="#" className="hover:text-white">Content Refresh</a></li>
                  <li><a href="#" className="hover:text-white">Content Creation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">General</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                  <li><a href="#" className="hover:text-white">Documentation</a></li>
                  <li><a href="#" className="hover:text-white">Affiliate</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="#" className="hover:text-white">Academy</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">AirOps Research</a></li>
                  <li><a href="#" className="hover:text-white">AEO Analysis</a></li>
                  <li><a href="#" className="hover:text-white">AI Growth Plays</a></li>
                  <li><a href="#" className="hover:text-white">AI Search Hub</a></li>
                  <li><a href="#" className="hover:text-white">Prompts</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-text-muted">
                  <li><a href="#" className="hover:text-white">Talk to Us</a></li>
                  <li><a href="#" className="hover:text-white">Community</a></li>
                  <li><a href="#" className="hover:text-white">AirOps Job Board</a></li>
                  <li><a href="#" className="hover:text-white">Experts</a></li>
                </ul>
              </div>
            </div>

            {/* Large logo */}
            <div className="py-8">
              <h2 className="text-[80px] md:text-[120px] lg:text-[160px] font-bold text-white/10 leading-none tracking-tight">
                air<span className="text-[#00FF64]/20">O</span>ps
              </h2>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-text-muted uppercase tracking-wider">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Careers</a>
              <a href="#" className="hover:text-white">Resources</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
