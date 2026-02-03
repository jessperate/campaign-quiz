export interface Resource {
  title: string;
  type: string;
  url: string;
}

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthArea: string;
  spendTimeOptions: string[];
  alternativeCareerOptions: string[];
  secretStrengthOptions: string[];
  resources: Resource[];
}

export const archetypes: Record<string, Archetype> = {
  sprinter: {
    id: "sprinter",
    name: "Sprinter",
    tagline: "Speed is a feature",
    description: "You ship fast and iterate faster. While others are still outlining, you're already on version three. Your philosophy: done is better than perfect, and momentum beats perfection every time.",
    strengths: [
      "Exceptional velocity without sacrificing core quality",
      "Natural ability to prioritize and cut scope effectively",
      "Momentum-driven approach that inspires teams"
    ],
    growthArea: "Building in quality checkpoints that don't slow you down",
    spendTimeOptions: [
      "Racing to hit publish before anyone can add feedback",
      "Optimizing your workflow to shave off 5 more minutes",
      "Juggling 12 content pieces in various states of 'almost done'"
    ],
    alternativeCareerOptions: [
      "Air traffic controller",
      "Short-order cook",
      "Day trader"
    ],
    secretStrengthOptions: [
      "You actually ship while others are still planning",
      "Your 'rough draft' is most people's final",
      "You've learned more from 100 fast failures than 10 slow wins"
    ],
    resources: [
      { title: "Quality checks you can run in under 2 minutes", type: "Guide", url: "#" },
      { title: "Teams shipping fast AND maintaining brand standards", type: "Case Study", url: "#" },
      { title: "AirOps Research: Staying ahead in AI search", type: "Research", url: "https://www.airops.com/report/structuring-content-for-llms" }
    ]
  },
  perfectTen: {
    id: "perfectTen",
    name: "Perfect Ten",
    tagline: "Excellence is non-negotiable",
    description: "You have standards, and you're not apologizing for them. Every piece that leaves your hands is polished, precise, and purposeful. You'd rather ship one exceptional piece than ten mediocre ones.",
    strengths: [
      "Exceptional attention to detail that elevates everything",
      "Strong brand guardian instincts",
      "Quality-driven approach that builds long-term trust"
    ],
    growthArea: "Finding ways to scale quality without bottlenecking",
    spendTimeOptions: [
      "Rewriting the same sentence for the 47th time",
      "Building style guides no one asked for but everyone needs",
      "Explaining why 'good enough' actually isn't"
    ],
    alternativeCareerOptions: [
      "Michelin-star chef",
      "Brain surgeon",
      "Master watchmaker"
    ],
    secretStrengthOptions: [
      "Your 'quick draft' would win awards at other companies",
      "You've trained everyone's taste level up just by existing",
      "Quality is your moat and competitors can't copy it"
    ],
    resources: [
      { title: "Using AI to enforce quality standards at scale", type: "Guide", url: "#" },
      { title: "How top brands maintain quality at 3x output", type: "Case Study", url: "#" },
      { title: "Why Ranking on Page One Isn't Enough", type: "Research", url: "https://www.airops.com/report/structuring-content-for-llms" }
    ]
  },
  trainer: {
    id: "trainer",
    name: "Trainer",
    tagline: "Multiplier of impact",
    description: "Your superpower isn't just doing the work—it's teaching others how to do it. You build systems, document processes, and leave every team better than you found it.",
    strengths: [
      "Natural ability to transfer knowledge at scale",
      "Systems thinking that creates lasting processes",
      "Team multiplication effect that compounds over time"
    ],
    growthArea: "Balancing documentation with direct execution",
    spendTimeOptions: [
      "Documenting the thing you just figured out",
      "Building templates so others don't start from scratch",
      "Explaining the 'why' behind the 'what' for the fifth time today"
    ],
    alternativeCareerOptions: [
      "Professor with a cult following",
      "YouTube tutorial creator with 2M subscribers",
      "The coach who turns underdogs into champions"
    ],
    secretStrengthOptions: [
      "Your team keeps winning even when you're on vacation",
      "You've 10x'd more careers than you realize",
      "Your documentation is actually read (rare)"
    ],
    resources: [
      { title: "Building AI workflows that actually get adopted", type: "Guide", url: "#" },
      { title: "The anatomy of a high-performing content system", type: "Framework", url: "#" },
      { title: "Workflow templates you can steal", type: "Templates", url: "#" }
    ]
  },
  underdog: {
    id: "underdog",
    name: "Underdog",
    tagline: "Hungry and proving it",
    description: "You might not have the biggest budget or the fanciest tools, but you've got hustle and creativity in spades. You're scrappy, resourceful, and constantly punching above your weight.",
    strengths: [
      "Exceptional resourcefulness and creative problem-solving",
      "Resilience that turns constraints into advantages",
      "Hunger that drives continuous improvement"
    ],
    growthArea: "Building foundational skills to level up your toolkit",
    spendTimeOptions: [
      "Finding creative workarounds for tools you can't afford",
      "Proving that scrappy beats fancy",
      "Doing the work of three people and making it look easy"
    ],
    alternativeCareerOptions: [
      "Startup founder on their third pivot",
      "Indie filmmaker who wins at Sundance",
      "The chef who turns bodega ingredients into fine dining"
    ],
    secretStrengthOptions: [
      "Constraints make you more creative, not less",
      "You've built more with less than most do with more",
      "Your hunger is your unfair advantage"
    ],
    resources: [
      { title: "Getting started with AI content workflows", type: "Guide", url: "#" },
      { title: "Content Engineering 101", type: "Course", url: "#" },
      { title: "From Query to Citation: How Snippet Signals Influence AI Search", type: "Research", url: "https://www.airops.com/report/how-snippet-signals-influence-ai-search" }
    ]
  },
  trailblazer: {
    id: "trailblazer",
    name: "Trailblazer",
    tagline: "First to the future",
    description: "You're experimenting with tactics others haven't heard of yet. While the industry debates best practices, you're already testing what's next. Early adopter is an understatement.",
    strengths: [
      "Early pattern recognition for emerging trends",
      "Comfort with ambiguity and experimentation",
      "Thought leadership that shapes industry direction"
    ],
    growthArea: "Documenting and scaling what works for the rest of the team",
    spendTimeOptions: [
      "Testing tools that are still in beta",
      "Explaining your strategy to people who think you're crazy",
      "Reading research papers for fun"
    ],
    alternativeCareerOptions: [
      "Venture capitalist who only backs weird ideas",
      "NASA engineer",
      "The person who invented whatever comes after smartphones"
    ],
    secretStrengthOptions: [
      "You were right about that thing 18 months before everyone else",
      "Your 'experiments' become other people's 'best practices'",
      "You see around corners"
    ],
    resources: [
      { title: "The state of AI search / AEO trends", type: "Research", url: "#" },
      { title: "Advanced AEO tactics for early movers", type: "Guide", url: "#" },
      { title: "Brands winning in AI search right now", type: "Case Study", url: "#" }
    ]
  },
  quarterback: {
    id: "quarterback",
    name: "Quarterback",
    tagline: "Orchestrator of outcomes",
    description: "You see the whole field. Your job isn't just to create—it's to coordinate, align, and make sure every piece of content serves the larger strategy. You turn chaos into execution.",
    strengths: [
      "Strategic vision that connects content to business outcomes",
      "Cross-functional coordination and stakeholder management",
      "Ability to turn chaos into executable plans"
    ],
    growthArea: "Staying connected to hands-on execution as you scale",
    spendTimeOptions: [
      "Aligning stakeholders who didn't know they needed aligning",
      "Turning vague strategy into concrete action plans",
      "Context-switching between 15 different workstreams"
    ],
    alternativeCareerOptions: [
      "NFL offensive coordinator",
      "Air traffic controller but for creative people",
      "UN diplomat specializing in impossible negotiations"
    ],
    secretStrengthOptions: [
      "You see the whole field while others see their lane",
      "Chaos becomes order in your presence",
      "Your team executes because you removed every blocker first"
    ],
    resources: [
      { title: "Revenue impact stories (pipeline, efficiency)", type: "Case Study", url: "#" },
      { title: "Building an AI-native content org", type: "Framework", url: "#" },
      { title: "What top-performing marketing teams are doing differently", type: "Research", url: "#" }
    ]
  },
  pinchHitter: {
    id: "pinchHitter",
    name: "Pinch Hitter",
    tagline: "Whatever it takes",
    description: "Need a blog post? You got it. Landing page? Done. Sales deck, webinar script, product launch? You're already on it. You're the ultimate utility player who fills gaps before anyone notices them.",
    strengths: [
      "Exceptional versatility across content types",
      "Quick learning curve for new tools and formats",
      "Team-first mentality that fills critical gaps"
    ],
    growthArea: "Developing deep expertise in one area while maintaining breadth",
    spendTimeOptions: [
      "Saying 'yes' to projects outside your job description",
      "Learning new tools because someone has to",
      "Being the answer to 'who can help with this?'"
    ],
    alternativeCareerOptions: [
      "Swiss Army knife (if it were a person)",
      "Emergency room doctor",
      "That friend who somehow knows how to fix everything"
    ],
    secretStrengthOptions: [
      "You've forgotten more skills than most people have learned",
      "Gaps don't exist when you're on the team",
      "Your versatility is why the whole thing works"
    ],
    resources: [
      { title: "Content engineering starter kit", type: "Resource Hub", url: "#" },
      { title: "Adapting your approach based on the situation", type: "Guide", url: "#" },
      { title: "The Community Flywheel", type: "Research", url: "https://www.airops.com/report/the-impact-of-ugc-and-community-in-ai-search" }
    ]
  },
  closer: {
    id: "closer",
    name: "Closer",
    tagline: "Revenue is the scoreboard",
    description: "You're obsessed with proving impact. Every piece of content ties back to pipeline, every campaign has attribution, and you can recite your team's contribution to revenue in your sleep.",
    strengths: [
      "Data-driven approach that proves content ROI",
      "Strong business acumen and revenue focus",
      "Ability to speak the language of leadership"
    ],
    growthArea: "Balancing short-term metrics with long-term brand building",
    spendTimeOptions: [
      "Building attribution models that actually attribute",
      "Tying content to pipeline in every executive meeting",
      "Asking 'but did it drive revenue?' about everything"
    ],
    alternativeCareerOptions: [
      "Wall Street trader who only cares about the P&L",
      "Sports agent who gets the max contract",
      "The lawyer who's never lost a case"
    ],
    secretStrengthOptions: [
      "You've made content a revenue center, not a cost center",
      "Executives actually understand your impact (finally)",
      "Your dashboard is the source of truth"
    ],
    resources: [
      { title: "Tying content to revenue (attribution models)", type: "Framework", url: "#" },
      { title: "How leaders proved marketing's impact to the board", type: "Case Study", url: "#" },
      { title: "Motivating your team through AI transformation", type: "Guide", url: "#" }
    ]
  },
  pacesetter: {
    id: "pacesetter",
    name: "Pacesetter",
    tagline: "Building the future org",
    description: "You're not just doing content—you're building an AI-native content operation from scratch. You're setting the pace for what modern content teams look like and everyone else is taking notes.",
    strengths: [
      "Visionary approach to AI-native operations",
      "Change management skills that bring teams along",
      "Industry-leading practices that others will follow"
    ],
    growthArea: "Ensuring the team can sustain innovation after you move on",
    spendTimeOptions: [
      "Redesigning the org chart around AI capabilities",
      "Building workflows that didn't exist six months ago",
      "Explaining to the board why this is the future"
    ],
    alternativeCareerOptions: [
      "Founder of whatever replaces content marketing",
      "The person history books credit for this shift",
      "Chief Everything Officer at an AI-native company"
    ],
    secretStrengthOptions: [
      "You're building the playbook others will copy in 2 years",
      "Your team structure is a competitive advantage",
      "You've already figured out what everyone else is debating"
    ],
    resources: [
      { title: "AI-native content teams and how they operate", type: "Case Study", url: "#" },
      { title: "Where AI search is headed", type: "Research", url: "#" },
      { title: "Staying seen in AI Search", type: "Research", url: "https://www.airops.com/report/how-citations-mentions-impact-visibility-in-ai-search" }
    ]
  }
};

export function getRandomBullets(archetype: Archetype): {
  spendTime: string;
  altCareer: string;
  secretStrength: string;
} {
  const randomIndex = (arr: string[]) => Math.floor(Math.random() * arr.length);

  return {
    spendTime: archetype.spendTimeOptions[randomIndex(archetype.spendTimeOptions)],
    altCareer: archetype.alternativeCareerOptions[randomIndex(archetype.alternativeCareerOptions)],
    secretStrength: archetype.secretStrengthOptions[randomIndex(archetype.secretStrengthOptions)]
  };
}

export function getArchetypeById(id: string): Archetype | undefined {
  return archetypes[id];
}
