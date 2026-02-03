import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/ui/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background laurel wreath image */}
        <div className="absolute inset-x-0 top-0 h-[600px] md:h-[700px] lg:h-[800px] pointer-events-none overflow-hidden">
          <Image
            src="/images/laurel-hero.png"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-white/80 text-[40px] md:text-[56px] mb-4 leading-tight" style={{ fontFamily: 'Serrif, serif' }}>
            Do you have what it takes?
          </p>
          <h1 className="text-[72px] md:text-[120px] text-[#75FFB9] mb-6 tracking-tight leading-none whitespace-nowrap" style={{ fontFamily: 'Knockout, sans-serif' }}>
            WIN AI SEARCH
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            A performance check for CMOs and content leaders navigating AI-driven growth.
          </p>

          <Link
            href="/quiz"
            className="inline-flex items-center px-8 py-4 bg-green text-black rounded-full text-lg font-bold hover:bg-green-dark transition-all btn-glow"
          >
            Take the quiz
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <p className="text-green/60 text-[16px] mt-4 uppercase tracking-widest" style={{ fontFamily: 'SaansMono, monospace' }}>
            Estimated time: 90 seconds (5 data points)
          </p>
        </div>
      </section>

      {/* Bottom Section with Background */}
      <div className="relative">
        {/* Bottom background image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/bottom.png"
            alt=""
            fill
            className="object-cover object-top"
          />
        </div>

        {/* Second Section */}
        <section className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-[48px] md:text-[72px] text-white leading-tight mb-6" style={{ fontFamily: 'Serrif, serif' }}>
                  Winning isn&apos;t just about speed.
                </h2>
              </div>
              <div>
                <p className="text-white/70 text-lg mb-6">
                  This quiz helps you understand whether your content operation is built to compete in the next era, or still training for it.
                </p>
                <Link
                  href="/quiz"
                  className="inline-flex items-center px-6 py-3 bg-green text-black rounded-full font-bold hover:bg-green-dark transition-all btn-glow"
                >
                  Take the quiz
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <p className="text-text-muted text-sm mt-3">
                  Estimated time: 90 seconds (90 data points)
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Champion Cards - Horizontal Scroll */}
        <section className="relative py-8 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide px-6">
            <div className="flex gap-6 min-w-max pb-4">
              <Image
                src="/images/champion-cards.png"
                alt="Champion cards showing marketing leaders who win AI search"
                width={1920}
                height={400}
                className="h-[350px] md:h-[420px] w-auto object-contain"
              />
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-card-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
            Get in leader,<br />we&apos;re driving growth.
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Work directly with our expert team to create your content game plan.
            We&apos;ll help you build the systems and train your team to succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="email"
              placeholder="Enter your work email"
              className="w-full sm:w-80 px-6 py-4 bg-green/20 border border-green/30 rounded-full text-white placeholder-green/50 focus:outline-none focus:border-green"
            />
            <button className="inline-flex items-center px-6 py-4 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-colors">
              Book a Demo
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-8 mb-12">
            <div className="flex gap-6 text-sm text-white">
              <a href="#" className="hover:text-green">Platform</a>
              <a href="#" className="hover:text-green">Careers</a>
              <a href="#" className="hover:text-green">Resources</a>
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
            <h2 className="text-6xl md:text-8xl font-bold text-white/10">
              air<span className="text-green/20">O</span>ps
            </h2>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-text-muted">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Careers</a>
            <a href="#" className="hover:text-white">Resources</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
