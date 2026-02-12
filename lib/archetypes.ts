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
  nextStepsCopy: string;
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
        nextStepsCopy: "You\u2019ve got the strategy. Now build the system to execute it. Learn how to turn your vision into a scalable content engine.",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6932e25ebcf2019d2c1e4875_Feature%20Peak-contnt%20eng.avif" },
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68edaceddab2221243f33497_Carta%20Case%20Study.avif" }
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
        nextStepsCopy: "Your team knows the \u201cwhy.\u201d Now give them the infrastructure to win. Our experts can help you build the playbook.",
        resources: [
          { title: "Content Engineering for Growth Orgs", type: "Guide", url: "https://www.airops.com/blog/content-engineering-growth-org", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68d1b63564f22455ef4d8b7b_Feature%20Peak-Content%20Growth%20Org%20(1).avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68edaceddab2221243f33497_Carta%20Case%20Study.avif" }
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
        nextStepsCopy: "You see where the market is going. Let\u2019s build the content operation to get there first.",
        resources: [
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68edaceddab2221243f33497_Carta%20Case%20Study.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" },
          { title: "Content Engineering for Growth Orgs", type: "Guide", url: "https://www.airops.com/blog/content-engineering-growth-org", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68d1b63564f22455ef4d8b7b_Feature%20Peak-Content%20Growth%20Org%20(1).avif" }
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
        nextStepsCopy: "You build systems that make everyone better. Imagine what you could do with an AI-powered content engine behind you.",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" }
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
        nextStepsCopy: "Your team runs on the processes you\u2019ve built. Let\u2019s make them even more powerful with AI-native workflows.",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" }
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
        nextStepsCopy: "You\u2019ve built the machine. Now let\u2019s accelerate it. Talk to our team about scaling your content operation.",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" },
          { title: "Harvard Business Publishing and AirOps", type: "Case Study", url: "https://www.airops.com/blog/harvard-business-publishing-and-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/685218f6d32eb0102e684a16_Frame%201707482181.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" }
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
        nextStepsCopy: "You\u2019re already experimenting. Let\u2019s put the full toolkit in your hands and see what you can do.",
        resources: [
          { title: "2025 SEO Research with Kevin Indig", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-2025-research-kevin-indig", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693b3cc8b363620ec009a555_kevin-indig-Webinar-1920x1080%20(1).avif" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6932e25ebcf2019d2c1e4875_Feature%20Peak-contnt%20eng.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" }
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
        nextStepsCopy: "Your team moves early. Let\u2019s make sure you\u2019re running the right experiments at scale.",
        resources: [
          { title: "2025 SEO Research with Kevin Indig", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-2025-research-kevin-indig", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693b3cc8b363620ec009a555_kevin-indig-Webinar-1920x1080%20(1).avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" }
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
        nextStepsCopy: "You move before the market does. Let\u2019s build the infrastructure to turn that speed into a lasting advantage.",
        resources: [
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68c2f2c8c0b4ccd00d64b5d4_Chime%20Case%20Study%203.avif" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6827958b05f371293f2084f7_Frame%201707482176.avif" },
          { title: "The 10x Content Engineer", type: "Guide", url: "https://www.airops.com/blog/10x-content-engineer", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6932e25ebcf2019d2c1e4875_Feature%20Peak-contnt%20eng.avif" }
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
        nextStepsCopy: "Quality is your edge. Let\u2019s make sure it scales. Learn how to maintain your standards while increasing output.",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6827958b05f371293f2084f7_Frame%201707482176.avif" }
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
        nextStepsCopy: "Your bar is high. Let\u2019s build systems that keep it there as you grow.",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6827958b05f371293f2084f7_Frame%201707482176.avif" }
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
        nextStepsCopy: "Taste is your moat. Let\u2019s build an operation that protects it at scale.",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" },
          { title: "How Lightspeed Increased Content Conversion", type: "Case Study", url: "https://www.airops.com/blog/how-lightspeed-increased-content-conversion", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6827958b05f371293f2084f7_Frame%201707482176.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" }
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
        nextStepsCopy: "You ship fast. Now ship smarter. Learn how to build workflows that match your pace.",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68c2f2c8c0b4ccd00d64b5d4_Chime%20Case%20Study%203.avif" }
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
        nextStepsCopy: "Your team delivers. Let\u2019s make sure velocity and quality scale together.",
        resources: [
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68c2f2c8c0b4ccd00d64b5d4_Chime%20Case%20Study%203.avif" }
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
        nextStepsCopy: "You\u2019re built for speed. Let\u2019s make sure your content operation can sustain it and win.",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" },
          { title: "How Chime Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/chime-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68c2f2c8c0b4ccd00d64b5d4_Chime%20Case%20Study%203.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" }
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
        nextStepsCopy: "You can do everything. Now let\u2019s automate the stuff that\u2019s holding you back so you can focus on what matters.",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" }
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
        nextStepsCopy: "You adapt to everything. Let\u2019s build a system that adapts with you.",
        resources: [
          { title: "How We Use AirOps to Grow AirOps", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" }
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
        nextStepsCopy: "Your operation is diversified. Let\u2019s make sure every initiative is driving real ROI.",
        resources: [
          { title: "How Carta Wins with AirOps", type: "Case Study", url: "https://www.airops.com/blog/carta-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68edaceddab2221243f33497_Carta%20Case%20Study.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" }
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
        nextStepsCopy: "You\u2019re getting better every day. Let\u2019s accelerate that growth with the right tools and training.",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" }
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
        nextStepsCopy: "You\u2019re building something special. Let\u2019s give your team the foundation to scale it.",
        resources: [
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" },
          { title: "The Content Engineer: Growth Hire", type: "Guide", url: "https://www.airops.com/blog/content-engineer-growth-hire", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/693338fd5a23fd1120d766a9_Feature%20Peak-content-ent-hire.avif" },
          { title: "How Xponent21 Scaled Content", type: "Case Study", url: "https://www.airops.com/blog/xponent21-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/696f9f24e62355f798009c1a_XPonent21%20OG%20image.jpg" }
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
        nextStepsCopy: "You\u2019re proving content\u2019s value every day. Let\u2019s build the systems to make the impact undeniable.",
        resources: [
          { title: "How Docebo Captured 25% Share of Voice", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" },
          { title: "Harvard Business Publishing and AirOps", type: "Case Study", url: "https://www.airops.com/blog/harvard-business-publishing-and-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/685218f6d32eb0102e684a16_Frame%201707482181.avif" },
          { title: "What is Content Engineering?", type: "Guide", url: "https://www.airops.com/blog/content-engineering", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6940828036ead57b2f0eaf55_Feature%20Peak-content-eng-overview.avif" }
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
