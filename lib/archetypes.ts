export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  spendTimeOptions: string[];
  alternativeCareerOptions: string[];
  secretStrengthOptions: string[];
}

export const archetypes: Record<string, Archetype> = {
  sprinter: {
    id: "sprinter",
    name: "Sprinter",
    tagline: "Speed is a feature",
    description: "You ship fast and iterate faster. While others are still outlining, you're already on version three. Your philosophy: done is better than perfect, and momentum beats perfection every time.",
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
    ]
  },
  perfectTen: {
    id: "perfectTen",
    name: "Perfect Ten",
    tagline: "Excellence is non-negotiable",
    description: "You have standards, and you're not apologizing for them. Every piece that leaves your hands is polished, precise, and purposeful. You'd rather ship one exceptional piece than ten mediocre ones.",
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
    ]
  },
  trainer: {
    id: "trainer",
    name: "Trainer",
    tagline: "Multiplier of impact",
    description: "Your superpower isn't just doing the work—it's teaching others how to do it. You build systems, document processes, and leave every team better than you found it.",
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
    ]
  },
  underdog: {
    id: "underdog",
    name: "Underdog",
    tagline: "Hungry and proving it",
    description: "You might not have the biggest budget or the fanciest tools, but you've got hustle and creativity in spades. You're scrappy, resourceful, and constantly punching above your weight.",
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
    ]
  },
  trailblazer: {
    id: "trailblazer",
    name: "Trailblazer",
    tagline: "First to the future",
    description: "You're experimenting with tactics others haven't heard of yet. While the industry debates best practices, you're already testing what's next. Early adopter is an understatement.",
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
    ]
  },
  quarterback: {
    id: "quarterback",
    name: "Quarterback",
    tagline: "Orchestrator of outcomes",
    description: "You see the whole field. Your job isn't just to create—it's to coordinate, align, and make sure every piece of content serves the larger strategy. You turn chaos into execution.",
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
    ]
  },
  pinchHitter: {
    id: "pinchHitter",
    name: "Pinch Hitter",
    tagline: "Whatever it takes",
    description: "Need a blog post? You got it. Landing page? Done. Sales deck, webinar script, product launch? You're already on it. You're the ultimate utility player who fills gaps before anyone notices them.",
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
    ]
  },
  closer: {
    id: "closer",
    name: "Closer",
    tagline: "Revenue is the scoreboard",
    description: "You're obsessed with proving impact. Every piece of content ties back to pipeline, every campaign has attribution, and you can recite your team's contribution to revenue in your sleep.",
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
    ]
  },
  pacesetter: {
    id: "pacesetter",
    name: "Pacesetter",
    tagline: "Building the future org",
    description: "You're not just doing content—you're building an AI-native content operation from scratch. You're setting the pace for what modern content teams look like and everyone else is taking notes.",
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
