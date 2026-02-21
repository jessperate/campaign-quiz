export interface AnswerInterpretation {
  text: string;
  archetype: string;
  interpretation: string;
}

export interface QuestionInterpretation {
  id: string; // q2–q7
  text: string;
  answers: Record<string, AnswerInterpretation>;
}

export const icQuestionInterpretations: QuestionInterpretation[] = [
  {
    id: "q2",
    text: "It's game day and your content isn't quite publish-ready. You:",
    answers: {
      a: {
        text: "Ship it now. Real-world feedback beats perfect planning.",
        archetype: "spark",
        interpretation: "Prioritizes momentum over polish — treats publishing as the start of a feedback loop, not the end of a production process.",
      },
      b: {
        text: "Hold it until it's ready. I don't publish anything below my standards.",
        archetype: "craft",
        interpretation: "Quality is a hard floor, not a preference. This person will protect brand standards even when it costs a deadline.",
      },
      c: {
        text: "Rally the team to make one last pass. We're in this together.",
        archetype: "heart",
        interpretation: "Instinctively collaborative under pressure — views quality as shared responsibility, not individual heroics.",
      },
      d: {
        text: "Stay up late to get it over the finish line. I do whatever it takes.",
        archetype: "flex",
        interpretation: "Personally absorbs the cost to honor commitments. Highly accountable, with a do-whatever-it-takes work ethic.",
      },
      e: {
        text: "Spin up a new AI workflow to refine and finalize.",
        archetype: "maverick",
        interpretation: "Reaches for automation under pressure. Sees tooling as the answer to time constraints — not more hours, better systems.",
      },
    },
  },
  {
    id: "q3",
    text: "What's your approach to new AI tools and workflows?",
    answers: {
      a: {
        text: "AI handles 80% of the work, I finish up. Speed is most important.",
        archetype: "spark",
        interpretation: "Fully adopted an AI-first workflow. Speed and output volume are the primary success metrics — process is irrelevant if the work ships.",
      },
      b: {
        text: "I'm constantly running new tools and playbooks. Experimentation is my edge.",
        archetype: "maverick",
        interpretation: "Experimentation is the core identity. Staying ahead of peers in tool literacy is the primary motivation.",
      },
      c: {
        text: "I'm learning something new every week, but not an expert. This stuff is exciting.",
        archetype: "heart",
        interpretation: "Enthusiastic early adopter who values growth over mastery at this stage. Optimism drives adoption, not strategy.",
      },
      d: {
        text: "I focus on AI that enhances creativity and quality, not just speed.",
        archetype: "craft",
        interpretation: "Selectively adopts AI — only when it elevates the work, not just accelerates it. Brand quality is the filter.",
      },
      e: {
        text: "I think about how AI fits our content strategy before diving in.",
        archetype: "vision",
        interpretation: "Strategic lens before tactical adoption. AI is a means to a strategic end, not an end in itself.",
      },
    },
  },
  {
    id: "q4",
    text: "A major trend breaks in your space. Your move:",
    answers: {
      a: {
        text: "I start dreaming up what our unique and creative take is.",
        archetype: "craft",
        interpretation: "Responds to trends through a creative differentiation lens — what makes our version worth reading?",
      },
      b: {
        text: "I brainstorm a hot take to stir reactions in the market.",
        archetype: "maverick",
        interpretation: "Sees trends as opportunities for provocation and market positioning. Being interesting matters more than being safe.",
      },
      c: {
        text: "I start thinking about how Product, Sales, and CX could react.",
        archetype: "flex",
        interpretation: "Cross-functional instinct — sees content as one piece of a larger organizational response to market moments.",
      },
      d: {
        text: "I have systems ready to respond quickly when trends hit.",
        archetype: "glue",
        interpretation: "Preparedness is the competitive advantage. This person has already built the infrastructure before the moment arrives.",
      },
      e: {
        text: "I move fast. First to market with a post or ad usually wins.",
        archetype: "spark",
        interpretation: "Speed-first orientation. Being early is the primary strategic value — the window closes fast.",
      },
    },
  },
  {
    id: "q5",
    text: "How do you approach your work?",
    answers: {
      a: {
        text: "Quality-focused. Every piece should represent the best I can do.",
        archetype: "craft",
        interpretation: "Intrinsic quality standards — 'good enough' isn't in the vocabulary. Output is a direct reflection of professional identity.",
      },
      b: {
        text: "Strategic. I think about how my work connects to bigger goals.",
        archetype: "vision",
        interpretation: "Nothing is just a deliverable. Every piece of work is understood in terms of its contribution to a larger outcome.",
      },
      c: {
        text: "Adaptable. I figure out what each situation needs.",
        archetype: "flex",
        interpretation: "Context-first — reads the room before deciding how to work. No fixed approach, just appropriate responses.",
      },
      d: {
        text: "Experimental. I'm always testing new approaches or tools.",
        archetype: "maverick",
        interpretation: "Treats work as a continuous experiment. Learning is built into the process, not separate from it.",
      },
      e: {
        text: "Growth-oriented. I'm early in my career but improving rapidly.",
        archetype: "heart",
        interpretation: "Self-aware and ambitious — trajectory matters more than current capability. Strong growth mindset.",
      },
    },
  },
  {
    id: "q6",
    text: "How do you stay sharp and improve?",
    answers: {
      a: {
        text: "I love to learn. I ask questions and try new things constantly.",
        archetype: "heart",
        interpretation: "Learning is intrinsically motivated. Curiosity is the default mode — not a habit built by discipline, but a natural orientation.",
      },
      b: {
        text: "I test every new tool hands-on and keep what works for me.",
        archetype: "maverick",
        interpretation: "Empirical approach to learning — direct experience over theory. Tool literacy is built through doing, not reading.",
      },
      c: {
        text: "I adapt my learning based on what projects are coming up.",
        archetype: "flex",
        interpretation: "Just-in-time learning — efficient, practical, and project-driven. Doesn't over-invest in skills that won't be used soon.",
      },
      d: {
        text: "I've built learning routines that keep me consistent.",
        archetype: "glue",
        interpretation: "Systems-thinker even in personal development. Consistency over intensity — reliable compounding beats sporadic effort.",
      },
      e: {
        text: "I learn by doing. I pick up skills as I ship work.",
        archetype: "spark",
        interpretation: "On-the-job learning — ships first and figures out the gaps in motion. Experience is the curriculum.",
      },
    },
  },
  {
    id: "q7",
    text: "When working with other teams or stakeholders, you:",
    answers: {
      a: {
        text: "Focus on delivering quickly and efficiently.",
        archetype: "spark",
        interpretation: "Stakeholder relationships are in service of execution speed. Being useful means being fast and dependable.",
      },
      b: {
        text: "Make sure the quality meets standards before sharing anything.",
        archetype: "craft",
        interpretation: "Protects output quality even in cross-functional settings. Won't share rough work — standards apply regardless of audience.",
      },
      c: {
        text: "Ask lots of questions to understand what would be most helpful.",
        archetype: "heart",
        interpretation: "Listener first. Deeply invested in being genuinely useful — not just technically correct, but actually meeting the need.",
      },
      d: {
        text: "Build it, plan an enablement session, and follow up to make sure it's used.",
        archetype: "flex",
        interpretation: "Goes beyond delivery to ensure adoption and impact. Measures success by whether the work actually got used.",
      },
      e: {
        text: "Share insights about how this connects to bigger company goals.",
        archetype: "vision",
        interpretation: "Uses cross-functional moments to reinforce strategic alignment. Every interaction is an opportunity to connect dots.",
      },
    },
  },
];

export const managerQuestionInterpretations: QuestionInterpretation[] = [
  {
    id: "q2",
    text: "Your team's output quality is falling. What do you do?",
    answers: {
      a: {
        text: "We ship and learn from feedback. Perfect is the enemy of done.",
        archetype: "spark",
        interpretation: "Accepts imperfection as the cost of speed. Believes iteration and real-world feedback are more valuable than polish.",
      },
      b: {
        text: "I run through the process myself to see where things are breaking.",
        archetype: "flex",
        interpretation: "Diagnoses before prescribing — hands-on troubleshooter who doesn't assume they know the problem before investigating.",
      },
      c: {
        text: "I build better quality checkpoints into our workflow.",
        archetype: "glue",
        interpretation: "Responds to quality problems with systemic solutions, not one-off fixes. The process is the product.",
      },
      d: {
        text: "I set up coaching sessions to make sure they have the support they need.",
        archetype: "heart",
        interpretation: "People-first response. Invests in capability before changing process — believes quality comes from supported people.",
      },
      e: {
        text: "We experiment with new AI tools for quality control.",
        archetype: "maverick",
        interpretation: "Technology as the solution. Default response to operational problems is to find a better tool.",
      },
    },
  },
  {
    id: "q3",
    text: "How are you rolling out AI across your team?",
    answers: {
      a: {
        text: "Fast adoption. AI drafts, humans finish. We're shipping more than ever.",
        archetype: "spark",
        interpretation: "Output velocity is the primary AI success metric. Adoption is measured by how much more the team ships.",
      },
      b: {
        text: "I work with each team member to develop a personalized plan.",
        archetype: "flex",
        interpretation: "Situational adoption — different people need different approaches. No single playbook for the whole team.",
      },
      c: {
        text: "Everyone is encouraged to suggest ideas and experiments.",
        archetype: "heart",
        interpretation: "Bottom-up AI adoption. Psychological safety drives experimentation — everyone's contribution to the process matters.",
      },
      d: {
        text: "I think hard about how AI helps us achieve our strategic goals.",
        archetype: "vision",
        interpretation: "Strategy-first adoption. Won't move without a clear line from tool to outcome.",
      },
      e: {
        text: "Carefully and slowly. I need to maintain quality standards as we scale.",
        archetype: "craft",
        interpretation: "Quality is the gating factor. Won't sacrifice brand standards for speed — adoption pace is set by risk tolerance.",
      },
    },
  },
  {
    id: "q4",
    text: "AI search is changing how audiences find content. Your approach:",
    answers: {
      a: {
        text: "I rolled out a new AEO tool last year and we're experimenting fast.",
        archetype: "maverick",
        interpretation: "Already in market on AEO — ahead of the curve and moving fast. Competitive advantage through early adoption.",
      },
      b: {
        text: "I've assigned ownership and we're developing our systematic approach.",
        archetype: "vision",
        interpretation: "Builds organizational accountability around emerging trends. Turns disruption into structured programs.",
      },
      c: {
        text: "I'm talking to a ton of colleagues and peers to come up with the best approach.",
        archetype: "flex",
        interpretation: "Network-first learner. Leverages peer intelligence before committing to a direction.",
      },
      d: {
        text: "I'm practicing patience. It's an intense time with no perfect answers. We're learning.",
        archetype: "heart",
        interpretation: "Resists reactive decisions. Values learning and deliberation over the pressure to move fast on uncertain ground.",
      },
      e: {
        text: "We're rethinking our stack and processes to set us up for this new era.",
        archetype: "glue",
        interpretation: "Responds to disruption with infrastructure change, not just content change. Rebuilds the foundation.",
      },
    },
  },
  {
    id: "q5",
    text: "Major industry trend breaks. How does your team handle it?",
    answers: {
      a: {
        text: "Run it through an LLM to create content and ship our response before the competition.",
        archetype: "spark",
        interpretation: "Speed is the strategic advantage. AI is the execution tool that makes first-mover possible.",
      },
      b: {
        text: "I adapt our response based on team strengths and the specific trend.",
        archetype: "flex",
        interpretation: "No single playbook — reads the trend and team capability together before deciding how to respond.",
      },
      c: {
        text: "I designed our content calendar to be reactive, so we move things around to engage.",
        archetype: "glue",
        interpretation: "Trend response is pre-built into the operating model. Infrastructure enables agility.",
      },
      d: {
        text: "I plan a working session for my team to chat this through together.",
        archetype: "heart",
        interpretation: "Collaborative deliberation before action. Collective thinking produces better responses than top-down mandates.",
      },
      e: {
        text: "We make sure we have something worth saying before committing resources.",
        archetype: "vision",
        interpretation: "Quality of perspective over speed of response. Refuses to react for the sake of reacting.",
      },
    },
  },
  {
    id: "q6",
    text: "Your management style:",
    answers: {
      a: {
        text: "Adaptive. I meet each team member and situation where they are.",
        archetype: "flex",
        interpretation: "Highly situational — no single management mode. Context drives approach, not habit.",
      },
      b: {
        text: "Strategic. I help the team see how their work drives business results.",
        archetype: "vision",
        interpretation: "Consistent emphasis on connecting individual work to company outcomes. Strategy is the management tool.",
      },
      c: {
        text: "Systems-focused. I build the infrastructure for team success.",
        archetype: "glue",
        interpretation: "Management through enablement — builds before directing. Success is a function of the system, not individual effort.",
      },
      d: {
        text: "Experimental. We're always testing new approaches together.",
        archetype: "maverick",
        interpretation: "Brings the experimental mindset to management itself. The team is the lab.",
      },
      e: {
        text: "Results-driven. We focus on shipping and hitting our goals.",
        archetype: "spark",
        interpretation: "Output is the measure. Creates accountability culture where delivery is the primary value.",
      },
    },
  },
  {
    id: "q7",
    text: "How do you help your team grow?",
    answers: {
      a: {
        text: "I'm hands-on, working alongside them and coaching as we go.",
        archetype: "heart",
        interpretation: "Close-contact development — prefers mentoring in the work over managing from a distance.",
      },
      b: {
        text: "I help them understand how their work connects to company strategy.",
        archetype: "vision",
        interpretation: "Development through context. Builds meaning into work — people grow when they understand why their work matters.",
      },
      c: {
        text: "I encourage them to experiment and try new approaches.",
        archetype: "maverick",
        interpretation: "Psychological safety for experimentation is the growth lever. Failure is data, not risk.",
      },
      d: {
        text: "I create clear processes and training so they can excel consistently.",
        archetype: "glue",
        interpretation: "Systematizes development — consistency over heroics. Repeatable excellence is the goal.",
      },
      e: {
        text: "I push them to maintain high standards in everything they do.",
        archetype: "craft",
        interpretation: "Quality standards as the growth mechanism. Raises the bar constantly — the team rises to meet it.",
      },
    },
  },
];

export const executiveQuestionInterpretations: QuestionInterpretation[] = [
  {
    id: "q2",
    text: "Your marketing org needs to 2x output next quarter. Your move:",
    answers: {
      a: {
        text: "Rally the team. We have untapped energy to unlock.",
        archetype: "spark",
        interpretation: "Believes in human potential and motivation as the primary lever. Culture and energy are the multiplier.",
      },
      b: {
        text: "Invest in a new AI tool. That's our force multiplier.",
        archetype: "maverick",
        interpretation: "Technology-first response to scale challenges. The tool is the answer, not the org chart.",
      },
      c: {
        text: "Restructure priorities to align with the strategic shift.",
        archetype: "vision",
        interpretation: "Organizational clarity is the answer — aligns direction before accelerating. Won't move faster in the wrong direction.",
      },
      d: {
        text: "Think about how to maintain quality as we scale. No compromising brand.",
        archetype: "craft",
        interpretation: "Brand quality is a non-negotiable constraint even under board pressure. Scale doesn't justify slop.",
      },
      e: {
        text: "Have an honest conversation with the team that we'll need to push, together.",
        archetype: "heart",
        interpretation: "Transparent leadership — builds shared ownership of hard challenges rather than mandating from the top.",
      },
    },
  },
  {
    id: "q3",
    text: "Your approach to AI across the marketing organization:",
    answers: {
      a: {
        text: "It's central to our strategy. We're building an AI-native operation.",
        archetype: "maverick",
        interpretation: "All-in on AI transformation. Competitive differentiation through technology — this is a foundational org bet.",
      },
      b: {
        text: "We're implementing structured workflows that enable the whole team.",
        archetype: "glue",
        interpretation: "Infrastructure-first. AI succeeds through process and enablement, not enthusiasm or individual experimentation.",
      },
      c: {
        text: "Thoughtful investment. I need clear proof we won't produce slop as we scale.",
        archetype: "craft",
        interpretation: "Quality safeguards before scale. Won't sacrifice brand standards for efficiency — ROI must include quality maintenance.",
      },
      d: {
        text: "I need to understand exactly how it supports our strategy before investing.",
        archetype: "vision",
        interpretation: "Strategic alignment is the prerequisite. No speculative investment — AI must serve a clear strategic outcome.",
      },
      e: {
        text: "I'm personally invested in the implications and opportunities for my team.",
        archetype: "heart",
        interpretation: "People-first lens on AI transformation. Cares deeply about impact on team capability, morale, and career development.",
      },
    },
  },
  {
    id: "q4",
    text: "AI search is reshaping buyer discovery. Your response:",
    answers: {
      a: {
        text: "We're repositioning proactively, org-wide. It's a board-level strategic priority.",
        archetype: "vision",
        interpretation: "Moves the entire organization around strategic shifts. Top-down alignment is how big bets get made.",
      },
      b: {
        text: "We're testing approaches across segments and use cases.",
        archetype: "flex",
        interpretation: "Experimental before committing. Learns across contexts before making a large org-wide bet.",
      },
      c: {
        text: "Making sure we are still building for humans, not just bots.",
        archetype: "craft",
        interpretation: "Resists over-optimization. Keeps human experience at the center even as the rest of the market chases algorithm.",
      },
      d: {
        text: "We're moving early and aggressively. We can't miss the competitive advantage.",
        archetype: "maverick",
        interpretation: "Speed and competitive edge are the primary motivations. First-mover advantage justifies imperfect early bets.",
      },
      e: {
        text: "I'm talking to my team to figure out where we need to upskill and invest.",
        archetype: "heart",
        interpretation: "People-first response to market disruption. Builds team capability before committing to a strategy.",
      },
    },
  },
  {
    id: "q5",
    text: "In times of uncertainty, how do you tell the story of marketing's impact:",
    answers: {
      a: {
        text: "Business growth. Business outcomes are always #1, the rest is fluff.",
        archetype: "vision",
        interpretation: "Revenue and outcomes are the only currency. Everything else — brand, culture, learning — is noise without the number.",
      },
      b: {
        text: "Brand and quality. Long-term value can help us survive short-term disruption.",
        archetype: "craft",
        interpretation: "Brand equity as the durable asset. Protects it even in turbulent times — short-term pressure doesn't change the long game.",
      },
      c: {
        text: "Team learning and development. Our team is always getting closer to the win.",
        archetype: "heart",
        interpretation: "Invests in human capital as evidence of progress. A growing team is a lagging indicator of future business results.",
      },
      d: {
        text: "Innovation. An experimental attitude wins, despite missteps along the way.",
        archetype: "maverick",
        interpretation: "Experimentation rate is the leading indicator of future success. Bets placed, not wins scored, define an innovative org.",
      },
      e: {
        text: "Adaptability. We'll win if we are able to constantly assess and adapt.",
        archetype: "flex",
        interpretation: "Responsiveness to change is the primary competitive advantage. Survival and growth belong to the most adaptive, not the most planned.",
      },
    },
  },
  {
    id: "q6",
    text: "Your leadership approach:",
    answers: {
      a: {
        text: "Visionary. I set direction and align the organization around it.",
        archetype: "vision",
        interpretation: "Direction-setting is the primary leadership act. Alignment before execution — the org moves when it understands where it's going.",
      },
      b: {
        text: "Quality-focused. I maintain standards and the organization rises to meet them.",
        archetype: "craft",
        interpretation: "Standards-first leadership. The bar doesn't move under pressure — the organization's quality is defined by what the leader tolerates.",
      },
      c: {
        text: "Innovation-driven. We stay ahead by moving early on opportunities.",
        archetype: "maverick",
        interpretation: "Innovation as the core leadership value. Moves before the market — competitive advantage belongs to those who see earliest.",
      },
      d: {
        text: "Growth-minded. I'm personally invested in building organizational capability.",
        archetype: "heart",
        interpretation: "Develops people as the primary leadership output. Org capability is the legacy; output metrics are the byproduct.",
      },
      e: {
        text: "Adaptive. I read situations and adjust our approach accordingly.",
        archetype: "flex",
        interpretation: "Situational leadership — no fixed style. Reads context, team, and moment before deciding how to lead.",
      },
    },
  },
  {
    id: "q7",
    text: "When facing major organizational challenges, you:",
    answers: {
      a: {
        text: "Step back and develop a strategic plan that addresses root causes.",
        archetype: "vision",
        interpretation: "Root-cause thinker — resists symptomatic fixes. Strategy before action, even under pressure.",
      },
      b: {
        text: "Build new systems and processes to prevent similar issues.",
        archetype: "glue",
        interpretation: "Systemic response to one-time problems. Turns crises into permanent improvements to the operating model.",
      },
      c: {
        text: "Talk to the team to understand and solve problems hands-on.",
        archetype: "heart",
        interpretation: "Listens before acting. Team perspective is essential input — decisions improve when they're grounded in lived experience.",
      },
      d: {
        text: "Talk to other leaders to figure out what's worked for others.",
        archetype: "flex",
        interpretation: "Network-leverager. Learns from peer experience before inventing a solution from scratch.",
      },
      e: {
        text: "Focus on the foundations. You know what works. Just execute well.",
        archetype: "craft",
        interpretation: "Backs to basics under uncertainty. Trusts proven approaches and excellent execution over novel strategies.",
      },
    },
  },
];
