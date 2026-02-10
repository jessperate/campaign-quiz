import type { ArchetypeId, Role } from "./quiz-data";

export interface Resource {
  title: string;
  type: string;
  url: string;
  ogImage?: string;
}

export interface RoleContent {
  tagline: string;
  winningPlay: string;
  whereToFocus: string;
  mostLikelyTo: string;
  spendTime: string;
  favoritePhrase: string;
  resources: Resource[];
  levelUpUrl: string;
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  shortName: string;
  roleContent: Record<Role, RoleContent>;
}

export const archetypes: Record<ArchetypeId, Archetype> = {
  vision: {
    id: "vision",
    name: "Vision",
    shortName: "VISION",
    roleContent: {
      ic: {
        tagline: "You see the big picture.",
        winningPlay: "Strategic vision. You see the full picture and help align projects to business goals. You make sure everyone knows the \"why.\"",
        whereToFocus: "You know what needs to happen, but execution at scale is your next frontier. Build systems that translate strategy into repeatable plays.",
        mostLikelyTo: "Have opinions about the roadmap",
        spendTime: "Connecting all the dots",
        favoritePhrase: "\"But have we considered\u2026\"",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer" },
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You see the big picture.",
        winningPlay: "Strategic vision. You set direction and your team understands how their work connects to business outcomes.",
        whereToFocus: "Strategy scales through systems. Build an autonomous team that executes your vision without constant direction.",
        mostLikelyTo: "Turn Slack threads into strategic initiatives",
        spendTime: "Finding signal through noise",
        favoritePhrase: "\"OK, here\u2019s how we\u2019ll proceed\"",
        resources: [
          { title: "Content Engineering for Growth Orgs", type: "Guide", url: "https://www.airops.com/blog/content-engineering-growth-org" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You see the big picture.",
        winningPlay: "Strategic vision. You own the vision and understand how content connects to revenue and competitive advantage.",
        whereToFocus: "Strategy scales through systems and talent. Build an organization that executes at scale without your daily involvement.",
        mostLikelyTo: "Drop hot takes on org design at happy hour",
        spendTime: "White-boarding (so satisfying)",
        favoritePhrase: "\"I\u2019ll socialize this with leadership\"",
        resources: [
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" },
          { title: "Content Engineering for Growth Orgs", type: "Guide", url: "https://www.airops.com/blog/content-engineering-growth-org" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  glue: {
    id: "glue",
    name: "Glue",
    shortName: "GLUE",
    roleContent: {
      ic: {
        tagline: "You turn chaos into systems.",
        winningPlay: "Building systems and enabling others. You create the workflows and processes that make everyone better. You\u2019re a force multiplier.",
        whereToFocus: "Don\u2019t over-engineer at the expense of momentum. Learn when to ship fast and iterate rather than wait for perfect execution.",
        mostLikelyTo: "Be everyone\u2019s onboarding buddy",
        spendTime: "Keeping people in the loop",
        favoritePhrase: "\"I have a doc for that\"",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You turn chaos into systems.",
        winningPlay: "Building systems and enabling your team. You create infrastructure that makes everyone better and more effective.",
        whereToFocus: "Don\u2019t let process slow progress. Build feedback loops that tell you when systems help vs. hinder.",
        mostLikelyTo: "Turn retros into actual process improvements",
        spendTime: "Building projects and assigning tasks",
        favoritePhrase: "\"Let\u2019s document as we go\"",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You turn chaos into systems.",
        winningPlay: "Building systems and enabling your team. You\u2019ve built the operating model and created an impressive content machine.",
        whereToFocus: "You\u2019re great at creating systems. Now get great at creating system-builders.",
        mostLikelyTo: "Have read Measure What Matters twice",
        spendTime: "Explaining frameworks vs SOPs",
        favoritePhrase: "\"Let\u2019s make this a playbook\"",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" },
          { title: "Harvard Business Publishing and AirOps", type: "Case Study", url: "https://www.airops.com/blog/harvard-business-publishing-and-airops" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  trendsetter: {
    id: "trendsetter",
    name: "Maverick",
    shortName: "MAVERICK",
    roleContent: {
      ic: {
        tagline: "You experiment while others hesitate.",
        winningPlay: "Spotting what\u2019s next and setting the trend. You experiment with new tools and approaches before they\u2019re obvious to everyone else.",
        whereToFocus: "Your experiments are gold, but isolated wins don\u2019t scale. Systematize your discoveries into repeatable frameworks.",
        mostLikelyTo: "Be first-name basis with product teams",
        spendTime: "Reading industry reports nobody else has time for",
        favoritePhrase: "\"I\u2019ve been experimenting with...\"",
        resources: [
          { title: "2025 SEO Research with Kevin Indig", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-2025-research-kevin-indig" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You experiment while others hesitate.",
        winningPlay: "Spotting what\u2019s next and moving early. Your team experiments and isn\u2019t afraid to try new approaches.",
        whereToFocus: "Experimentation needs guardrails. Create frameworks that balance speed with accountability.",
        mostLikelyTo: "Reorganize teams around new opportunities",
        spendTime: "Running pilots",
        favoritePhrase: "\"Trust me on this one\"",
        resources: [
          { title: "2025 SEO Research with Kevin Indig", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-2025-research-kevin-indig" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You experiment while others hesitate.",
        winningPlay: "Spotting what\u2019s next and moving early. You move fast and your content operation stays ahead of competition.",
        whereToFocus: "Experimentation needs ROI discipline. Build frameworks that let you move fast without losing sight of what works.",
        mostLikelyTo: "Know every founder in your zip code",
        spendTime: "Reading TechCrunch with morning coffee",
        favoritePhrase: "\"I\u2019ve been saying this for months\"",
        resources: [
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  tastemaker: {
    id: "tastemaker",
    name: "Craft",
    shortName: "CRAFT",
    roleContent: {
      ic: {
        tagline: "You make it shine.",
        winningPlay: "Craft and quality. Your work has voice, style, and polish. In a world of AI slop, you help your brand stand out.",
        whereToFocus: "Your standards are an asset, but perfection can slow progress. Learn to balance high quality with shipping velocity.",
        mostLikelyTo: "Ship at 11:59 PM (wasn\u2019t ready at 11:58)",
        spendTime: "Peer-reviewing your own work",
        favoritePhrase: "\"Let\u2019s take one more pass\"",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You make it shine.",
        winningPlay: "Craft and quality. You set the bar high and your team\u2019s work is consistently excellent.",
        whereToFocus: "Quality matters, but perfectionism can paralyze. Learn to distinguish \"must be perfect\" from \"good enough.\"",
        mostLikelyTo: "Believe \"it\u2019s fine\" means \"not good enough\"",
        spendTime: "Reading copy out loud",
        favoritePhrase: "\"How can we push this further?\"",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You make it shine.",
        winningPlay: "Craft and quality. You protect brand reputation and your content is consistently excellent. You\u2019re not shipping until it\u2019s right.",
        whereToFocus: "Quality takes resources and time. Ensure your investment correlates to business outcomes without missing market moments.",
        mostLikelyTo: "Change the font in the board deck",
        spendTime: "Explaining what \"elevated\" means",
        favoritePhrase: "\"Can we make it more [gestures vaguely] us?\"",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  goGoGoer: {
    id: "goGoGoer",
    name: "Spark",
    shortName: "SPARK",
    roleContent: {
      ic: {
        tagline: "You\u2019re the momentum.",
        winningPlay: "Execution and delivery. You ship fast, hit deadlines, and get it done under pressure. You\u2019re the yes person who makes it happen.",
        whereToFocus: "Speed is your superpower, but sustainable pace matters. Build checkpoints so you catch issues and quality dips before they become problems.",
        mostLikelyTo: "Ship before anyone says \"wait, should we...\"",
        spendTime: "Executing (iterate later)",
        favoritePhrase: "\"I\u2019ll have it to you by EOD\"",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You\u2019re the momentum.",
        winningPlay: "Execution and delivery. Your team ships under pressure and you\u2019ve built a culture of getting it done.",
        whereToFocus: "Momentum is contagious, but burnout spreads faster. Monitor team velocity and wellbeing.",
        mostLikelyTo: "Hit quarterly goals by month two",
        spendTime: "Unblocking",
        favoritePhrase: "\"Ship now, iterate later\"",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You\u2019re the momentum.",
        winningPlay: "Execution and delivery. You\u2019re execution-focused and your content operation delivers results that move the needle.",
        whereToFocus: "Sustainable growth requires balance. Build systems that maintain velocity without sacrificing people or quality.",
        mostLikelyTo: "Turn \"EOQ\" into \"EOW\"",
        spendTime: "Refreshing analytics dashboards",
        favoritePhrase: "\"Up and to the right!\"",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  clutch: {
    id: "clutch",
    name: "Flex",
    shortName: "FLEX",
    roleContent: {
      ic: {
        tagline: "You thrive in the gray areas.",
        winningPlay: "Versatility. You\u2019re great at many things and can fill any gap. You adapt to whatever the team needs, which is key in the age of AI.",
        whereToFocus: "Your ability to juggle might be blocking your growth. Identify the 20% that moves the needle and set aside (or automate) the rest.",
        mostLikelyTo: "Be the person who \"knows a trick\"",
        spendTime: "Collecting hats",
        favoritePhrase: "\"Yeah, I can take that on\"",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You thrive in the gray areas.",
        winningPlay: "Versatility. You lead through adaptability and your team trusts you to jump in wherever needed.",
        whereToFocus: "Your team learns from what you do. If you do everything, they wait for direction. Specialize and teach ownership.",
        mostLikelyTo: "Solve problems nobody saw coming",
        spendTime: "Saving the day",
        favoritePhrase: "\"What does the team need right now?\"",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You thrive in the gray areas.",
        winningPlay: "Versatility. You\u2019ve diversified your content operation across channels and aren\u2019t reliant on one approach.",
        whereToFocus: "Diversification is resilience, but can obscure ROI. Get disciplined about which initiatives drive value vs nice-to-have.",
        mostLikelyTo: "Have a calendar that makes people concerned",
        spendTime: "Context switching between completely different initiatives",
        favoritePhrase: "\"It depends\" (on literally everything)",
        resources: [
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  },

  heart: {
    id: "heart",
    name: "Heart",
    shortName: "HEART",
    roleContent: {
      ic: {
        tagline: "You make the work feel like purpose.",
        winningPlay: "Hunger and potential. You\u2019re learning fast and getting better every day. You\u2019re coachable, scrappy, and full of passion.",
        whereToFocus: "Teams love working with you. Next step: showing leadership how your work moves the needle.",
        mostLikelyTo: "Watch tutorials at 2x speed",
        spendTime: "Asking questions others are scared to ask",
        favoritePhrase: "\"I\u2019ll take a crack at it\"",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/cohort"
      },
      manager: {
        tagline: "You make the work feel like purpose.",
        winningPlay: "Hunger and potential. You\u2019re building something great and your team believes in your commitment to growth.",
        whereToFocus: "Build your team on systems, not just personality. The practices you establish now define how you scale.",
        mostLikelyTo: "Have the most loyal team",
        spendTime: "Proving management is about progress, not perfection",
        favoritePhrase: "\"Let\u2019s see what happens\"",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" },
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      },
      executive: {
        tagline: "You make the work feel like purpose.",
        winningPlay: "Hunger and potential. You\u2019re building your function and proving content\u2019s value with commitment to doing it right.",
        whereToFocus: "Establish foundation on systems and data, not improvisation. The practices you build now determine how you scale.",
        mostLikelyTo: "Become everyone\u2019s favorite executive",
        spendTime: "Learning from your direct reports",
        favoritePhrase: "\"Let\u2019s experiment!\"",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study" },
          { title: "Harvard Business Publishing and AirOps", type: "Case Study", url: "https://www.airops.com/blog/harvard-business-publishing-and-airops" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering" }
        ],
        levelUpUrl: "https://www.airops.com/book-a-call"
      }
    }
  }
};

export function getBullets(archetype: Archetype, role: Role): {
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
} {
  const content = archetype.roleContent[role];
  return {
    mostLikelyTo: content.mostLikelyTo,
    typicallySpending: content.spendTime,
    favoritePhrase: content.favoritePhrase
  };
}

// Keep backwards compatibility alias
export const getRandomBullets = getBullets;

export function getArchetypeById(id: string): Archetype | undefined {
  return archetypes[id as ArchetypeId];
}
