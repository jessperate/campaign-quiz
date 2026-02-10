export type Role = "ic" | "manager" | "executive";

export type ArchetypeId =
  | "vision"
  | "glue"
  | "trendsetter"
  | "tastemaker"
  | "goGoGoer"
  | "clutch"
  | "heart";

export interface AnswerOption {
  id: string;
  text: string;
  signals: ArchetypeId[];
}

export interface Question {
  id: string;
  text: string;
  options: AnswerOption[];
}

// Q1: Role selection (same for everyone)
export const roleQuestion: Question = {
  id: "q1",
  text: "First, what\u2019s your role?",
  options: [
    {
      id: "executive",
      text: "I set the strategy and own the budget. (VP, CMO)",
      signals: []
    },
    {
      id: "manager",
      text: "I manage a team or function. (Marketing Director, Team Lead, Sr. Manager)",
      signals: []
    },
    {
      id: "ic",
      text: "I create and execute the work. (Writer, Designer, Analyst, Specialist)",
      signals: []
    }
  ]
};

// IC Track Questions (Q2-Q7)
export const icQuestions: Question[] = [
  {
    id: "q2",
    text: "It\u2019s game day and your content isn\u2019t quite publish-ready. You:",
    options: [
      { id: "a", text: "Ship it now. Real-world feedback beats perfect planning.", signals: ["goGoGoer"] },
      { id: "b", text: "Hold it until it\u2019s ready. I don\u2019t publish anything below my standards.", signals: ["tastemaker"] },
      { id: "c", text: "Rally the team to make one last pass. We\u2019re in this together.", signals: ["heart"] },
      { id: "d", text: "Stay up late to get it over the finish line. I do whatever it takes.", signals: ["clutch"] },
      { id: "e", text: "Spin up a new AI workflow to refine and finalize.", signals: ["trendsetter"] }
    ]
  },
  {
    id: "q3",
    text: "What\u2019s your approach to new AI tools and workflows?",
    options: [
      { id: "a", text: "AI handles 80% of the work, I finish up. Speed is the most important.", signals: ["goGoGoer"] },
      { id: "b", text: "I\u2019m constantly running new tools and playbooks. Experimentation is my edge.", signals: ["trendsetter"] },
      { id: "c", text: "I\u2019m learning something new every week, but not an expert. This stuff is exciting.", signals: ["heart"] },
      { id: "d", text: "I focus on AI that enhances creativity and quality, not just speed.", signals: ["tastemaker"] },
      { id: "e", text: "I think about how AI fits our content strategy before diving in.", signals: ["vision"] }
    ]
  },
  {
    id: "q4",
    text: "A major trend breaks in your space. Your move:",
    options: [
      { id: "a", text: "I start dreaming up what our unique and creative take is.", signals: ["tastemaker"] },
      { id: "b", text: "I brainstorm a hot take to stir reactions in the market.", signals: ["trendsetter"] },
      { id: "c", text: "I start thinking about how Product, Sales, and CX could react.", signals: ["clutch"] },
      { id: "d", text: "I have systems ready to respond quickly when trends hit.", signals: ["glue"] },
      { id: "e", text: "I move fast. First to market with a post or ad usually wins.", signals: ["goGoGoer"] }
    ]
  },
  {
    id: "q5",
    text: "How do you approach your work?",
    options: [
      { id: "a", text: "Quality-focused. Every piece should represent the best I can do.", signals: ["tastemaker"] },
      { id: "b", text: "Strategic. I think about how my work connects to bigger goals.", signals: ["vision"] },
      { id: "c", text: "Adaptable. I figure out what each situation needs.", signals: ["clutch"] },
      { id: "d", text: "Experimental. I\u2019m always testing new approaches or tools.", signals: ["trendsetter"] },
      { id: "e", text: "Growth-oriented. I\u2019m early in my career but improving rapidly.", signals: ["heart"] }
    ]
  },
  {
    id: "q6",
    text: "How do you stay sharp and improve?",
    options: [
      { id: "a", text: "I love to learn. I ask questions and try new things constantly.", signals: ["heart"] },
      { id: "b", text: "I test every new tool hands-on and keep what works for me.", signals: ["trendsetter"] },
      { id: "c", text: "I adapt my learning based on what projects are coming up.", signals: ["clutch"] },
      { id: "d", text: "I\u2019ve built learning routines that keep me consistent.", signals: ["glue"] },
      { id: "e", text: "I learn by doing. I pick up skills as I ship work.", signals: ["goGoGoer"] }
    ]
  },
  {
    id: "q7",
    text: "When working with other teams or stakeholders, you:",
    options: [
      { id: "a", text: "Focus on delivering quickly and efficiently.", signals: ["goGoGoer"] },
      { id: "b", text: "Make sure the quality meets standards before sharing anything.", signals: ["tastemaker"] },
      { id: "c", text: "Ask lots of questions to understand what would be most helpful.", signals: ["heart"] },
      { id: "d", text: "Build it, plan an enablement session, and follow up to make sure it\u2019s used.", signals: ["clutch"] },
      { id: "e", text: "Share insights about how this connects to bigger company goals.", signals: ["vision"] }
    ]
  }
];

// Manager Track Questions (Q2-Q7)
export const managerQuestions: Question[] = [
  {
    id: "q2",
    text: "Your team\u2019s output quality is falling. What do you do?",
    options: [
      { id: "a", text: "We ship and learn from feedback. Perfect is the enemy of done.", signals: ["goGoGoer"] },
      { id: "b", text: "I run through the process myself to see where things are breaking.", signals: ["clutch"] },
      { id: "c", text: "I build better quality checkpoints into our workflow.", signals: ["glue"] },
      { id: "d", text: "I set up coaching sessions to make sure they have the support they need.", signals: ["heart"] },
      { id: "e", text: "We experiment with new AI tools for quality control.", signals: ["trendsetter"] }
    ]
  },
  {
    id: "q3",
    text: "How are you rolling out AI across your team?",
    options: [
      { id: "a", text: "Fast adoption. AI drafts, humans finish. We\u2019re shipping more than ever.", signals: ["goGoGoer"] },
      { id: "b", text: "I work with each team member to develop a personalized plan.", signals: ["clutch"] },
      { id: "c", text: "Everyone is encouraged to suggest ideas and experiments.", signals: ["heart"] },
      { id: "d", text: "I think hard about how AI helps us achieve our strategic goals.", signals: ["vision"] },
      { id: "e", text: "Carefully and slowly. I need to maintain our quality standards as we scale.", signals: ["tastemaker"] }
    ]
  },
  {
    id: "q4",
    text: "AI search is changing how audiences find content. Your approach:",
    options: [
      { id: "a", text: "I rolled out a new AEO tool last year and we\u2019re experimenting fast.", signals: ["trendsetter"] },
      { id: "b", text: "I\u2019ve assigned ownership and we\u2019re developing our systematic approach.", signals: ["vision"] },
      { id: "c", text: "I\u2019m talking to a ton of colleagues and peers to come up with the best approach.", signals: ["clutch"] },
      { id: "d", text: "I\u2019m practicing patience. It\u2019s an intense time with no perfect answers. We\u2019re learning.", signals: ["heart"] },
      { id: "e", text: "We\u2019re rethinking our stack and processes to set us up for this new era.", signals: ["glue"] }
    ]
  },
  {
    id: "q5",
    text: "Major industry trend breaks. How does your team handle it?",
    options: [
      { id: "a", text: "Run it through an LLM to create content and ship our response before the competition.", signals: ["goGoGoer"] },
      { id: "b", text: "I adapt our response based on team strengths and the specific trend.", signals: ["clutch"] },
      { id: "c", text: "I designed our content calendar to be reactive, so we move things around to engage.", signals: ["glue"] },
      { id: "d", text: "I plan a working session for my team to chat this through together.", signals: ["heart"] },
      { id: "e", text: "We make sure we have something worth saying before committing resources.", signals: ["vision"] }
    ]
  },
  {
    id: "q6",
    text: "Your management style:",
    options: [
      { id: "a", text: "Adaptive. I meet each team member and situation where they are.", signals: ["clutch"] },
      { id: "b", text: "Strategic. I help the team see how their work drives business results.", signals: ["vision"] },
      { id: "c", text: "Systems-focused. I build the infrastructure for team success.", signals: ["glue"] },
      { id: "d", text: "Experimental. We\u2019re always testing new approaches together.", signals: ["trendsetter"] },
      { id: "e", text: "Results-driven. We focus on shipping and hitting our goals.", signals: ["goGoGoer"] }
    ]
  },
  {
    id: "q7",
    text: "How do you help your team grow?",
    options: [
      { id: "a", text: "I\u2019m hands-on, working alongside them and coaching as we go.", signals: ["heart"] },
      { id: "b", text: "I help them understand how their work connects to company strategy.", signals: ["vision"] },
      { id: "c", text: "I encourage them to experiment and try new approaches.", signals: ["trendsetter"] },
      { id: "d", text: "I create clear processes and training so they can excel consistently.", signals: ["glue"] },
      { id: "e", text: "I push them to maintain high standards in everything they do.", signals: ["tastemaker"] }
    ]
  }
];

// Executive Track Questions (Q2-Q7)
export const executiveQuestions: Question[] = [
  {
    id: "q2",
    text: "Your marketing org needs to 2x output next quarter. Your move:",
    options: [
      { id: "a", text: "Rally the team. We have untapped energy to unlock.", signals: ["goGoGoer"] },
      { id: "b", text: "Invest in a new AI tool. That\u2019s our force multiplier.", signals: ["trendsetter"] },
      { id: "c", text: "Restructure priorities to align with the strategic shift.", signals: ["vision"] },
      { id: "d", text: "Think about how to maintain quality as we scale. No compromising brand.", signals: ["tastemaker"] },
      { id: "e", text: "Have an honest conversation with the team that we\u2019ll need to push, together.", signals: ["heart"] }
    ]
  },
  {
    id: "q3",
    text: "Your approach to AI across the marketing organization:",
    options: [
      { id: "a", text: "It\u2019s central to our strategy. We\u2019re building an AI-native operation.", signals: ["trendsetter"] },
      { id: "b", text: "We\u2019re implementing structured workflows that enable the whole team.", signals: ["glue"] },
      { id: "c", text: "Thoughtful investment. I need clear proof we won\u2019t produce slop as we adopt.", signals: ["tastemaker"] },
      { id: "d", text: "I need to understand exactly how it supports our strategy before investing.", signals: ["vision"] },
      { id: "e", text: "I\u2019m personally invested in the implications and opportunities for my team.", signals: ["heart"] }
    ]
  },
  {
    id: "q4",
    text: "AI search is reshaping buyer discovery. Your response:",
    options: [
      { id: "a", text: "We\u2019re repositioning proactively, org-wide. It\u2019s a board-level strategic priority.", signals: ["vision"] },
      { id: "b", text: "We\u2019re testing approaches across segments and use cases.", signals: ["clutch"] },
      { id: "c", text: "Making sure we are still building for humans, not just bots.", signals: ["tastemaker"] },
      { id: "d", text: "We\u2019re moving early and aggressively. We can\u2019t miss the competitive advantage.", signals: ["trendsetter"] },
      { id: "e", text: "I\u2019m talking to my team to figure out where we need to upskill and invest.", signals: ["heart"] }
    ]
  },
  {
    id: "q5",
    text: "In times of uncertainty, how do you tell the story of marketing\u2019s impact:",
    options: [
      { id: "a", text: "Business growth. Business outcomes is always #1, the rest is fluff.", signals: ["vision"] },
      { id: "b", text: "Brand and quality. Long-term value can help us survive short-term disruption.", signals: ["tastemaker"] },
      { id: "c", text: "Team learning and development. Our team is always getting closer to the win.", signals: ["heart"] },
      { id: "d", text: "Innovation. An experimental attitude wins, despite missteps along the way.", signals: ["trendsetter"] },
      { id: "e", text: "Adaptability. We\u2019ll win if we are able to constantly assess and adapt.", signals: ["clutch"] }
    ]
  },
  {
    id: "q6",
    text: "Your leadership approach:",
    options: [
      { id: "a", text: "Visionary. I set direction and align the organization around it.", signals: ["vision"] },
      { id: "b", text: "Quality-focused. I maintain standards and the organization rises to meet them.", signals: ["tastemaker"] },
      { id: "c", text: "Innovation-driven. We stay ahead by moving early on opportunities.", signals: ["trendsetter"] },
      { id: "d", text: "Growth-minded. I\u2019m personally invested in building organizational capability.", signals: ["heart"] },
      { id: "e", text: "Adaptive. I read situations and adjust our approach accordingly.", signals: ["clutch"] }
    ]
  },
  {
    id: "q7",
    text: "When facing major organizational challenges, you:",
    options: [
      { id: "a", text: "Step back and develop a strategic plan that addresses root causes.", signals: ["vision"] },
      { id: "b", text: "Build new systems and processes to prevent similar issues.", signals: ["glue"] },
      { id: "c", text: "Talk to the team to understand and solve problems hands-on.", signals: ["heart"] },
      { id: "d", text: "Talk to other leaders to figure out what\u2019s worked for others.", signals: ["clutch"] },
      { id: "e", text: "Focus on the foundations. You know what works. Just execute well.", signals: ["tastemaker"] }
    ]
  }
];

export function getQuestionsForRole(role: Role): Question[] {
  switch (role) {
    case "ic":
      return icQuestions;
    case "manager":
      return managerQuestions;
    case "executive":
      return executiveQuestions;
    default:
      return icQuestions;
  }
}

export function calculateArchetype(answers: Record<string, string>, role: Role): ArchetypeId {
  const scores: Record<string, number> = {};
  const questions = [roleQuestion, ...getQuestionsForRole(role)];

  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;

    const selectedOption = question.options.find(opt => opt.id === answerId);
    if (!selectedOption) continue;

    const { signals } = selectedOption;
    if (signals.length === 0) continue;

    if (signals.length === 1) {
      // Single signal: 2 points
      scores[signals[0]] = (scores[signals[0]] || 0) + 2;
    } else {
      // Multiple signals: 1 point each
      for (const sig of signals) {
        scores[sig] = (scores[sig] || 0) + 1;
      }
    }
  }

  // Find highest scoring archetype(s)
  let maxScore = 0;
  let topArchetypes: string[] = [];

  for (const [archetypeId, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topArchetypes = [archetypeId];
    } else if (score === maxScore) {
      topArchetypes.push(archetypeId);
    }
  }

  // Tiebreak: random selection
  if (topArchetypes.length > 1) {
    return topArchetypes[Math.floor(Math.random() * topArchetypes.length)] as ArchetypeId;
  }

  return (topArchetypes[0] as ArchetypeId) || "goGoGoer"; // Default fallback
}
