import type { ArchetypeId, Role } from "./quiz-data";

export interface Resource {
  title: string;
  type: string;
  url: string;
  ogImage?: string;
}

export interface RoleContent {
  tagline: string;
  description: string;
  mostLikelyToOptions: string[];
  typicallySpendingOptions: string[];
  favoritePhraseOptions: string[];
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  shortName: string;
  roleContent: Record<Role, RoleContent>;
  strengths: string[];
  growthArea: string;
  resources: Resource[];
}

export const archetypes: Record<ArchetypeId, Archetype> = {
  vision: {
    id: "vision",
    name: "Vision",
    shortName: "VISION",
    roleContent: {
      ic: {
        tagline: "You see the bigger picture, usually even before leadership draws it.",
        description: "You see the bigger picture, usually even before leadership draws it. You connect the dots between strategy and execution, and your team is better because of it.",
        mostLikelyToOptions: [
          "Have (correct) opinions about the roadmap",
          "Turn a Slack message into a strategy",
          "Be two (or three or four) steps ahead"
        ],
        typicallySpendingOptions: [
          "Writing strategy docs that could win Pulitzers",
          "Connecting all the dots",
          'Explaining the "why"... again...'
        ],
        favoritePhraseOptions: [
          '"But have we considered..."',
          '"Let\'s connect this to the bigger picture"',
          '"Tying this back to our goals"'
        ]
      },
      manager: {
        tagline: "You don't just set the strategy. You make sure everyone else can see it too.",
        description: "You don't just set the strategy. You make sure everyone else can see it too. Your team executes because they understand the why behind every play.",
        mostLikelyToOptions: [
          "Turn a company OKR into a team battle plan",
          "Reframe the entire brief after one meeting",
          'Have your skip-level say "your team really gets it"'
        ],
        typicallySpendingOptions: [
          "Translating leadership priorities into team action",
          "Connecting your team's work to the bigger picture",
          'Saying "here\'s why this matters" in every 1:1'
        ],
        favoritePhraseOptions: [
          '"Let me give you the context behind this"',
          '"Here\'s how this ladders up"',
          '"We\'re building toward something bigger"'
        ]
      },
      executive: {
        tagline: "You see strategy where others see slides.",
        description: "You see strategy where others see slides. You align the entire org around what matters and make the complex feel simple.",
        mostLikelyToOptions: [
          "Reference a McKinsey framework unprompted",
          "Drop a hot take on org design at happy hour",
          "Have the board nodding before you've finished the sentence"
        ],
        typicallySpendingOptions: [
          "Aligning the entire org around what matters",
          "Figuring out how to get other teams to do what's best for yours",
          "White-boarding with anyone who'll stand still long enough"
        ],
        favoritePhraseOptions: [
          '"How does this ladder up to our North Star?"',
          '"I\'ll socialize this with the rest of leadership"',
          '"Let\'s take this offline"'
        ]
      }
    },
    strengths: [
      "Strategic vision that connects content to business outcomes",
      "Cross-functional coordination and stakeholder management",
      "Ability to turn chaos into executable plans"
    ],
    growthArea: "Staying connected to hands-on execution as you scale",
    resources: [
      { title: "Build an authority-first strategy with dual-purpose content", type: "Framework", url: "https://www.airops.com/blog/content-strategy", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6908fd1d6c0195a73abfd16e_content-strategy-ai-era.avif" },
      { title: "Discover why LLM traffic converts 22x higher and how to capture it", type: "Webinar", url: "https://www.airops.com/blog/ai-search-steve-toth", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68703f26b73f3c84b4910b4f_Feature%20Peak-Steve%20Toth-July%202025-Recap%20(1).avif" },
      { title: "Get insights from 144 content leaders on AI adoption and productivity gains", type: "Research", url: "https://www.airops.com/report/state-of-content-teams", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/67ee9640ef3c8eb974e89143_Frame%201707481908.avif" }
    ]
  },

  glue: {
    id: "glue",
    name: "Glue",
    shortName: "GLUE",
    roleContent: {
      ic: {
        tagline: "You're the real reason things don't fall apart.",
        description: "You're the real reason things don't fall apart. You build systems, document processes, and leave every team better than you found it.",
        mostLikelyToOptions: [
          "Have color-coded everything",
          "Send a Loom instead of explaining twice",
          "Be an onboarding buddy as a side hustle"
        ],
        typicallySpendingOptions: [
          "Pinning important links in the channel",
          "Lowkey managing everyone's projects",
          "Creating frameworks for literally everything"
        ],
        favoritePhraseOptions: [
          '"I have a doc for that"',
          '"You can see the process here"',
          '"Can you put that in the project doc?"'
        ]
      },
      manager: {
        tagline: "Your team runs smoothly and nobody can quite explain how.",
        description: "Your team runs smoothly and nobody can quite explain how. You build the systems that make the magic happen.",
        mostLikelyToOptions: [
          "Have a Notion workspace that makes other managers jealous",
          "Turn every retro into actual process improvements",
          "Be the reason your team has work-life balance"
        ],
        typicallySpendingOptions: [
          "Building systems so your team doesn't have to",
          "Quietly unblocking people before they even ask",
          "Making sure nothing falls through the cracks"
        ],
        favoritePhraseOptions: [
          '"I already set up a doc for that"',
          '"Let\'s make this a repeatable playbook"',
          '"Don\'t worry, I\'m tracking it"'
        ]
      },
      executive: {
        tagline: "You build the infrastructure everyone runs on.",
        description: "You build the infrastructure everyone runs on. Your systems scale and your teams thrive because of the foundation you've laid.",
        mostLikelyToOptions: [
          "Get genuinely excited about workflow automation",
          "Have read Measure What Matters twice",
          "Color-code your OKRs and expect everyone else to as well"
        ],
        typicallySpendingOptions: [
          "Building the system of record",
          "Explaining the difference between a framework and a playbook",
          "Creating onboarding docs that give new hires actual hope"
        ],
        favoritePhraseOptions: [
          '"Let\'s make this a playbook"',
          '"It\'s all in the wiki"',
          '"Can we automate this? Trick question, I already did."'
        ]
      }
    },
    strengths: [
      "Natural ability to transfer knowledge at scale",
      "Systems thinking that creates lasting processes",
      "Team multiplication effect that compounds over time"
    ],
    growthArea: "Balancing documentation with direct execution",
    resources: [
      { title: "Steal our 4 workflows for webinar repurposing, blog updates, and social research", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" },
      { title: "Turn one asset into dozens of formats with evergreen refresh cycles", type: "Guide", url: "https://www.airops.com/blog/ai-workflows-content-repurposing", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6965355708d3d2b94f41f055_Feature%20Peak-content-repurposing.avif" },
      { title: "See how Docebo captured 25% share of voice and replaced agencies with AirOps", type: "Case Study", url: "https://www.airops.com/blog/docebo-case-study", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68e53672acdd1586c053fcdc_Docebo%20Case%20Study.avif" }
    ]
  },

  trendsetter: {
    id: "trendsetter",
    name: "Trendsetter",
    shortName: "TRENDSETTER",
    roleContent: {
      ic: {
        tagline: "Your finger's on the pulse. All of your fingers. And your toes.",
        description: "Your finger's on the pulse. All of your fingers. And your toes. You're experimenting with tactics others haven't heard of yet.",
        mostLikelyToOptions: [
          "Post in the #industry-news channel",
          "Be on a first-name basis with product teams",
          "Know about acquisitions before TechCrunch"
        ],
        typicallySpendingOptions: [
          "Demoing tools even if you don't have budget",
          "Evangelizing your latest AI tool",
          "Signing up for product demos"
        ],
        favoritePhraseOptions: [
          '"I\'ve been experimenting with..."',
          '"Have you seen [something that came out an hour ago]?"',
          '"I called it"'
        ]
      },
      manager: {
        tagline: "You place bold bets before your peers and your team reaps the rewards.",
        description: "You place bold bets before your peers and your team reaps the rewards. You're always two steps ahead of the industry.",
        mostLikelyToOptions: [
          "Reorganize the team around a new opportunity",
          'Have a "future of ____" presentation ready to go',
          "Be right about the thing everyone thought was risky"
        ],
        typicallySpendingOptions: [
          "Pitching new initiatives to leadership",
          "Running pilots with your team",
          "Getting your team early access to tools no one's heard of yet"
        ],
        favoritePhraseOptions: [
          '"The old playbook won\'t work here"',
          '"Trust me on this one"',
          '"I\'ve been tracking this trend, and..."'
        ]
      },
      executive: {
        tagline: "Others are setting this quarter's goals. You're placing next year's big bets.",
        description: "Others are setting this quarter's goals. You're placing next year's big bets. You see the future before it arrives.",
        mostLikelyToOptions: [
          "Reorganize the entire team around a hunch",
          "Know every founder in your zip code",
          "Reference a Gartner Magic Quadrant at a dinner party"
        ],
        typicallySpendingOptions: [
          "Reading TechCrunch with your morning coffee",
          "Throwing out the old playbook",
          "Testing tools your team won't hear about for six months"
        ],
        favoritePhraseOptions: [
          '"This is where the industry is headed"',
          '"We can\'t afford to wait"',
          '"I\'ve been saying this for months"'
        ]
      }
    },
    strengths: [
      "Early pattern recognition for emerging trends",
      "Comfort with ambiguity and experimentation",
      "Thought leadership that shapes industry direction"
    ],
    growthArea: "Documenting and scaling what works for the rest of the team",
    resources: [
      { title: "Discover why 48% of AI answers cite UGC and Reddit", type: "Research", url: "https://www.airops.com/blog/search-trends-2025", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/692eee63ec20226076d24938_search-trends-blog-2025.avif" },
      { title: "See how early adopters are converting 8-10% of signups from AI chatbots", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-ethan-smith-graphite-alex-halliday-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/691f72f5e1bf1349ccb2ef48_Webinar-Graphite-1920x1080.avif" },
      { title: "See how ChatGPT is expanding search and what it means for your content strategy", type: "Webinar", url: "https://www.airops.com/blog/webinar-chatgpt-vs-google-kevin-indig", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/69445da2e14b63b2cf15f360_Webinar-Recap-1920x1080-kevin-indig.avif" }
    ]
  },

  tastemaker: {
    id: "tastemaker",
    name: "Craft",
    shortName: "CRAFT",
    roleContent: {
      ic: {
        tagline: 'You know "good enough" never really is.',
        description: 'You know "good enough" never really is. You have standards, and you\'re not apologizing for them.',
        mostLikelyToOptions: [
          "Notice the typo in the post-launch tweet",
          "Re-share the brand voice guidelines",
          "Ship at 11:59 PM because it wasn't ready at 11:58 PM"
        ],
        typicallySpendingOptions: [
          "Adding hundreds of comments",
          "Sweating the small stuff",
          "Peer-reviewing your own work"
        ],
        favoritePhraseOptions: [
          '"Just one more pass"',
          '"This doesn\'t feel on-brand"',
          '"I feel like I can do better..."'
        ]
      },
      manager: {
        tagline: "Your red pen is the team's secret weapon.",
        description: "Your red pen is the team's secret weapon. You push the team to do their best work, and they're better for it.",
        mostLikelyToOptions: [
          "Tweak the headline just one more time",
          "Send feedback that's longer than the original draft",
          'Believe "it\'s fine" is code for "not good enough"'
        ],
        typicallySpendingOptions: [
          "Protecting the brand like it's your firstborn",
          "Coaching your team on the difference between good and great",
          "Reading copy out loud to yourself"
        ],
        favoritePhraseOptions: [
          '"How can we push this further?"',
          '"It\'s close, but it\'s not popping yet"',
          '"One more pass and we\'re there"'
        ]
      },
      executive: {
        tagline: "Your eye for talent and taste is what sets your brand apart.",
        description: "Your eye for talent and taste is what sets your brand apart. Quality isn't a nice-to-have for you — it's the whole strategy.",
        mostLikelyToOptions: [
          "Hire someone with an arts background",
          "Change the font in the board deck",
          "Ask to see the creative explorations that didn't make the cut"
        ],
        typicallySpendingOptions: [
          'Sending work back with "thoughts" that are actually novels',
          "Protecting the brand like it's the crown jewels",
          'Explaining what you mean by "elevated"'
        ],
        favoritePhraseOptions: [
          '"Make it pop"',
          '"Our brand is our greatest asset"',
          '"Can we make it more [gestures vaguely] us?"'
        ]
      }
    },
    strengths: [
      "Exceptional attention to detail that elevates everything",
      "Strong brand guardian instincts",
      "Quality-driven approach that builds long-term trust"
    ],
    growthArea: "Finding ways to scale quality without bottlenecking",
    resources: [
      { title: "Get the sentence-level optimization tactics driving citation and traffic lifts", type: "Webinar", url: "https://www.airops.com/blog/refresh-content-steve-toth", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/67e31a6e9df015dd9454fa65_Feature%20Peak.avif" },
      { title: "Make the right call every time—use the decision framework top teams rely on", type: "Guide", url: "https://www.airops.com/blog/refresh-vs-rewrite-vs-redirect", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68feda3dc35533528c11544f_Refresh-rewrite-redirect.avif" },
      { title: "Build data-driven workflows that turn insights into action", type: "Webinar", url: "https://www.airops.com/blog/oshen-davidson-content-engineering-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6911deaa6f4a902830ec2045_o-date.avif" }
    ]
  },

  goGoGoer: {
    id: "goGoGoer",
    name: "Go-Go-Goer",
    shortName: "GO-GO-GOER",
    roleContent: {
      ic: {
        tagline: "You build while others are still asking questions.",
        description: "You build while others are still asking questions. Your philosophy: done is better than perfect, and momentum beats perfection every time.",
        mostLikelyToOptions: [
          'Ship before anyone can say "wait, should we..."',
          'Have "lgtm!" as your most-used Slack phrase',
          "Respond faster than people can finish typing"
        ],
        typicallySpendingOptions: [
          "Executing while others are still planning",
          "Hitting send",
          "Proving that done > perfect"
        ],
        favoritePhraseOptions: [
          '"I\'ll have it to you in an hour"',
          '"Ship it"',
          '"We can always iterate on it"'
        ]
      },
      manager: {
        tagline: "You hit goals before the quarter's halfway done.",
        description: "You hit goals before the quarter's halfway done. Your team's velocity is the stuff of legend.",
        mostLikelyToOptions: [
          "Hit quarterly goals by month two",
          "Have the longest end-of-week report",
          "Break the record for most wins celebrated"
        ],
        typicallySpendingOptions: [
          "Unblocking your team at lightning speed",
          "Keeping momentum alive",
          'Turning "by EOQ" into "by end of month"'
        ],
        favoritePhraseOptions: [
          '"LET\'S GOOO"',
          '"Ship now, iterate later"',
          '"What\'s blocking us?"'
        ]
      },
      executive: {
        tagline: 'You turn "end of quarter" into "end of week."',
        description: 'You turn "end of quarter" into "end of week." Your urgency is contagious and your results speak for themselves.',
        mostLikelyToOptions: [
          'Answer emails at 11 PM with "for tomorrow:"',
          "Celebrate hitting the goal by immediately raising it",
          "Have your team in awe (and maybe therapy)"
        ],
        typicallySpendingOptions: [
          '"How can we ship this faster?"',
          "Refreshing the analytics dashboard",
          'Turning "by EOQ" into "by EOW"'
        ],
        favoritePhraseOptions: [
          '"When can we get this live?"',
          '"Let\'s move fast here"',
          '"Up and to the right!!!"'
        ]
      }
    },
    strengths: [
      "Exceptional velocity without sacrificing core quality",
      "Natural ability to prioritize and cut scope effectively",
      "Momentum-driven approach that inspires teams"
    ],
    growthArea: "Building in quality checkpoints that don't slow you down",
    resources: [
      { title: "Run 12 tactical plays that drive AI visibility, citations, and growth", type: "Playbook", url: "https://www.airops.com/blog/plays-for-the-holidays-grow-traffic-citations-revenue", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/692f5e28163bca7fb4e1ec60_12-PLAYS-HERO.avif" },
      { title: "Download the 10-step checklist for chunk-level retrieval optimization", type: "Webinar", url: "https://www.airops.com/blog/webinar-aleyda-solis", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/688a596e08cd45656a66494f_Feature%20Peak-Aleyda%20Solis-July%202025-no-date.avif" },
      { title: "Learn how to build systems that scale without adding headcount", type: "Webinar", url: "https://www.airops.com/blog/webinar-recap-aeo-growth", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/697a205c18a5ec6ac5c92fbd_aeo-growth-graphite-webflow-maxresdefault-.jpg" }
    ]
  },

  clutch: {
    id: "clutch",
    name: "Hat Collector",
    shortName: "HAT COLLECTOR",
    roleContent: {
      ic: {
        tagline: "You wear every hat and make it look easy.",
        description: "You wear every hat and make it look easy. You're the ultimate utility player who fills gaps before anyone notices them.",
        mostLikelyToOptions: [
          "Know a little about pretty much everything",
          "Get pulled into every project",
          "Have a resume that reads like a job description Mad Lib"
        ],
        typicallySpendingOptions: [
          "Wearing a lot of hats",
          "Jumping between projects mid-sentence",
          "Catching up on a thousand Slack messages"
        ],
        favoritePhraseOptions: [
          '"No worries, I\'ll figure it out"',
          '"Yeah, I can take that on"',
          '"I can find time"'
        ]
      },
      manager: {
        tagline: "You fill every gap without missing a beat.",
        description: "You fill every gap without missing a beat. Your adaptability is your superpower.",
        mostLikelyToOptions: [
          "Manage three different workstreams with a smile",
          'Have "it depends" as your management philosophy',
          "Step in wherever the team needs you most"
        ],
        typicallySpendingOptions: [
          "Context-switching like it's an Olympic sport",
          "Filling gaps no one even noticed existed",
          "Being the person everyone calls when things go sideways"
        ],
        favoritePhraseOptions: [
          '"What does the team need right now?"',
          '"I\'ll shift gears"',
          '"Let\'s stay flexible"'
        ]
      },
      executive: {
        tagline: "You're not in some ivory tower. You help wherever it's needed most.",
        description: "You're not in some ivory tower. You help wherever it's needed most. Your hands-on approach earns trust at every level.",
        mostLikelyToOptions: [
          "Have a calendar that makes people genuinely concerned",
          "Juggle ten different initiatives at once",
          "Be everyone's emergency contact"
        ],
        typicallySpendingOptions: [
          "Context-switching for sport",
          "Getting added to new Slack channels daily",
          'Being spread thin but calling it "versatility"'
        ],
        favoritePhraseOptions: [
          '"I\'ll figure it out"',
          '"We\'ll make it work"',
          '"It depends" (on literally everything)'
        ]
      }
    },
    strengths: [
      "Exceptional versatility across content types",
      "Quick learning curve for new tools and formats",
      "Team-first mentality that fills critical gaps"
    ],
    growthArea: "Developing deep expertise in one area while maintaining breadth",
    resources: [
      { title: "Apply the \"30% juice rule\" and transform how you manage content", type: "Webinar", url: "https://www.airops.com/blog/smartest-cmos-build-content-product-emily-kramer", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/689602c9845512a8caab3783_emily%20kramer-webinar-main-video-thumbnail%20(1).avif" },
      { title: "Master the \"Lurk, Listen, Leap\" framework and dominate Reddit search results", type: "Webinar", url: "https://www.airops.com/blog/webinar-ross-simmonds", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/685c53e49fac1a2062aa89b2_Feature%20Peak-Ross-Simmonds-June-25%20(2).avif" },
      { title: "Steal our 4 workflows for webinar repurposing, blog updates, and social research", type: "Case Study", url: "https://www.airops.com/blog/how-we-use-airops-to-grow-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/680033c954cfc87e533018e4_1744143929357.avif" }
    ]
  },

  heart: {
    id: "heart",
    name: "Heart",
    shortName: "HEART",
    roleContent: {
      ic: {
        tagline: "You're the heartbeat of the team, and it shows in the work.",
        description: "You're the heartbeat of the team, and it shows in the work. You're scrappy, resourceful, and constantly punching above your weight.",
        mostLikelyToOptions: [
          "Champion a project because it's the right thing to do",
          "Rally the team when energy is low",
          "Have the best growth trajectory on the team"
        ],
        typicallySpendingOptions: [
          "Delivering work that punches above your weight",
          "Reminding the team why the work matters",
          "Earning trust by showing up and getting it done"
        ],
        favoritePhraseOptions: [
          '"I\'ll take a crack at it"',
          '"This is bigger than the metrics"',
          '"We\'re in this together"'
        ]
      },
      manager: {
        tagline: "Your energy and drive is the team's greatest asset.",
        description: "Your energy and drive is the team's greatest asset. You lead by doing and your team follows because they believe in you.",
        mostLikelyToOptions: [
          "Have the most loyal team",
          "Turn skeptics into believers",
          "Be loved for your work ethic"
        ],
        typicallySpendingOptions: [
          "Learning alongside your team",
          "Building confidence at lightning speed",
          "Proving management is about progress, not perfection"
        ],
        favoritePhraseOptions: [
          '"We\'ll figure it out together"',
          '"Let\'s experiment with this"',
          '"I\'m still learning too, and that\'s the point"'
        ]
      },
      executive: {
        tagline: "You lead with curiosity and your team loves you for it.",
        description: "You lead with curiosity and your team loves you for it. You're not afraid to say you don't have all the answers.",
        mostLikelyToOptions: [
          "Read The Hard Thing About Hard Things on vacation",
          "Ask your team for feedback and actually mean it",
          "Become everyone's favorite person to work with"
        ],
        typicallySpendingOptions: [
          "Building the plane while flying it",
          "Learning from your direct reports",
          "Proving that great leadership is about staying hungry"
        ],
        favoritePhraseOptions: [
          '"I\'m still figuring this out"',
          '"What would you do here?"',
          '"Let\'s experiment!"'
        ]
      }
    },
    strengths: [
      "Exceptional resourcefulness and creative problem-solving",
      "Resilience that turns constraints into advantages",
      "Hunger that drives continuous improvement"
    ],
    growthArea: "Building foundational skills to level up your toolkit",
    resources: [
      { title: "Build research-driven workflows that win in AI search", type: "Webinar", url: "https://www.airops.com/blog/webinar-andy-crestodina", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/68d3f473558b714195f7ac97_F1Without%20Dateeature%20Peak-andy-crestodina-new.avif" },
      { title: "Build data-driven workflows that turn insights into action", type: "Webinar", url: "https://www.airops.com/blog/oshen-davidson-content-engineering-airops", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/6911deaa6f4a902830ec2045_o-date.avif" },
      { title: "Get insights from 144 content leaders on AI adoption and productivity gains", type: "Research", url: "https://www.airops.com/report/state-of-content-teams", ogImage: "https://cdn.prod.website-files.com/62203be3930f396b6cdb3478/67ee9640ef3c8eb974e89143_Frame%201707481908.avif" }
    ]
  }
};

export function getRandomBullets(archetype: Archetype, role: Role): {
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
} {
  const randomIndex = (arr: string[]) => Math.floor(Math.random() * arr.length);
  const content = archetype.roleContent[role];

  return {
    mostLikelyTo: content.mostLikelyToOptions[randomIndex(content.mostLikelyToOptions)],
    typicallySpending: content.typicallySpendingOptions[randomIndex(content.typicallySpendingOptions)],
    favoritePhrase: content.favoritePhraseOptions[randomIndex(content.favoritePhraseOptions)]
  };
}

export function getArchetypeById(id: string): Archetype | undefined {
  return archetypes[id as ArchetypeId];
}
