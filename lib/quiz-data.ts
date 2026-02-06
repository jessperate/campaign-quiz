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
  text: "What's your role?",
  options: [
    {
      id: "executive",
      text: "I set the strategy and own the budget. (VP, CMO)",
      signals: []
    },
    {
      id: "manager",
      text: "I manage a team or function. (Director, Lead, Sr. Manager)",
      signals: []
    },
    {
      id: "ic",
      text: "I'm in the game every day doing the work. (Writer, Ops, Analyst, Creator)",
      signals: []
    }
  ]
};

// IC Track Questions (Q2-Q6)
export const icQuestions: Question[] = [
  {
    id: "q2",
    text: "It's game day and your work isn't quite publish-ready. You:",
    options: [
      {
        id: "a",
        text: "Ship it. You miss 100% of the shots you don't take.",
        signals: ["goGoGoer"]
      },
      {
        id: "b",
        text: "Delay it. I don't put my name on anything that's not ready.",
        signals: ["tastemaker"]
      },
      {
        id: "c",
        text: "Stay late to run the full pre-launch checklist. We have a plan, let's follow it.",
        signals: ["glue"]
      },
      {
        id: "d",
        text: "Ask my manager to gut-check it before it goes out.",
        signals: ["heart"]
      }
    ]
  },
  {
    id: "q3",
    text: "What's your AI playbook look like?",
    options: [
      {
        id: "a",
        text: "AI handles the kickoff. I bring it to the end-zone.",
        signals: ["goGoGoer"]
      },
      {
        id: "b",
        text: "I've built custom playbooks for most situations that get thrown at me.",
        signals: ["glue", "trendsetter"]
      },
      {
        id: "c",
        text: "Limited use. I don't trust it with the important stuff yet.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Experimenting and building my toolkit.",
        signals: ["heart"]
      }
    ]
  },
  {
    id: "q4",
    text: "AI search is changing the marketing game. How are you adjusting to win on ChatGPT, Perplexity, and other AI tools?",
    options: [
      {
        id: "a",
        text: "Already training for it. This is where the competition is going.",
        signals: ["trendsetter"]
      },
      {
        id: "b",
        text: "I know it matters but haven't figured out my approach yet.",
        signals: ["goGoGoer", "clutch", "heart"]
      },
      {
        id: "c",
        text: "Overhyped. Traditional playbooks are how humans still work.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "I volunteered to be my company's dedicated AEO player.",
        signals: ["vision"]
      }
    ]
  },
  {
    id: "q5",
    text: "A trend just broke in your industry. What's the play?",
    options: [
      {
        id: "a",
        text: "I've got a standard rapid-response workflow ready to go.",
        signals: ["glue", "trendsetter"]
      },
      {
        id: "b",
        text: "Deprioritize everything else to come up with the best play. First to market wins.",
        signals: ["goGoGoer"]
      },
      {
        id: "c",
        text: "Research first, act when ready. Hot takes don't land without insight.",
        signals: ["vision", "tastemaker"]
      },
      {
        id: "d",
        text: "Huddle up with my team and learn as I go. This is how we get better.",
        signals: ["heart", "clutch"]
      }
    ]
  },
  {
    id: "q6",
    text: "How would you describe your working style?",
    options: [
      {
        id: "a",
        text: "Craftsperson. Every detail matters.",
        signals: ["tastemaker"]
      },
      {
        id: "b",
        text: "Systematic. I run proven plays because they work.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Versatile. Put me anywhere, I'll figure it out.",
        signals: ["clutch"]
      },
      {
        id: "d",
        text: "Scrappy. Still building my game, but I deliver.",
        signals: ["heart", "goGoGoer"]
      }
    ]
  }
];

// Manager Track Questions (Q2-Q6)
export const managerQuestions: Question[] = [
  {
    id: "q2",
    text: "Your team's work is going out but the quality is inconsistent. You:",
    options: [
      {
        id: "a",
        text: "Ship it. We'll learn and iterate. Can't let perfect be the enemy of done.",
        signals: ["goGoGoer", "trendsetter"]
      },
      {
        id: "b",
        text: "Hold it. I'll personally review everything before it goes out.",
        signals: ["tastemaker"]
      },
      {
        id: "c",
        text: "Build a checklist or workflow so this doesn't happen again.",
        signals: ["glue", "vision"]
      },
      {
        id: "d",
        text: "Huddle with the team to figure out what went wrong.",
        signals: ["heart"]
      }
    ]
  },
  {
    id: "q3",
    text: "How are you thinking about AI for your team?",
    options: [
      {
        id: "a",
        text: "We're shipping faster than ever. AI handles the first draft, humans close it out.",
        signals: ["goGoGoer"]
      },
      {
        id: "b",
        text: "I've built workflows and templates so the team can use AI consistently.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Cautiously. I need to make sure quality doesn't slip.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Experimenting. We're figuring out what works for us.",
        signals: ["heart", "trendsetter"]
      }
    ]
  },
  {
    id: "q4",
    text: "AI search is changing the marketing game. How is your team adjusting?",
    options: [
      {
        id: "a",
        text: "We're optimizing for it. I've already shared our new playbook.",
        signals: ["trendsetter", "goGoGoer"]
      },
      {
        id: "b",
        text: "We're taking some steps but not giving up the traditional plays.",
        signals: ["vision", "clutch"]
      },
      {
        id: "c",
        text: "Skeptical. We're focused on what's working now.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Learning together. I'm bringing insights back to the team.",
        signals: ["heart"]
      }
    ]
  },
  {
    id: "q5",
    text: "A major trend breaks in your industry. How does your team respond?",
    options: [
      {
        id: "a",
        text: "We've got a rapid-response workflow. The team knows exactly what to do.",
        signals: ["glue", "trendsetter"]
      },
      {
        id: "b",
        text: "All hands on deck. We figure it out and ship fast.",
        signals: ["goGoGoer"]
      },
      {
        id: "c",
        text: "We take our time. Rushed work reflects poorly on the team.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "We debrief first, then decide if it's worth chasing.",
        signals: ["clutch", "heart"]
      }
    ]
  },
  {
    id: "q6",
    text: "How would you describe your management style?",
    options: [
      {
        id: "a",
        text: "High standards. I push the team to do their best work.",
        signals: ["tastemaker"]
      },
      {
        id: "b",
        text: "Systems-builder. I create the plays so the team can run them.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Flexible. I adapt to what the team and situation need.",
        signals: ["clutch"]
      },
      {
        id: "d",
        text: "In the trenches. I'm still learning but I lead by doing.",
        signals: ["heart", "goGoGoer"]
      }
    ]
  }
];

// Executive Track Questions (Q2-Q6)
export const executiveQuestions: Question[] = [
  {
    id: "q2",
    text: "Your team needs to 2x output next quarter. Your move:",
    options: [
      {
        id: "a",
        text: "Hire. We need more people to hit the number.",
        signals: ["heart"]
      },
      {
        id: "b",
        text: "Build the systems and workflows so we can scale without adding headcount.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Dig in and re-motivate the team. We've got more in the tank.",
        signals: ["goGoGoer"]
      },
      {
        id: "d",
        text: "Try out new AI tools. That's the leverage play in 2026.",
        signals: ["trendsetter"]
      }
    ]
  },
  {
    id: "q3",
    text: "How are you thinking about AI for your marketing org?",
    options: [
      {
        id: "a",
        text: "It's central to our strategy. We're building an AI-native team.",
        signals: ["trendsetter", "vision"]
      },
      {
        id: "b",
        text: "We've got workflows in place. The team is enabled and shipping faster.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Cautiously optimistic. I need to see ROI before going all in.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Still evaluating. We're running pilots to figure out what works.",
        signals: ["heart", "clutch"]
      }
    ]
  },
  {
    id: "q4",
    text: "AI search is disrupting how buyers find solutions. What's your strategy?",
    options: [
      {
        id: "a",
        text: "We're already repositioning. This is a board-level priority.",
        signals: ["vision", "trendsetter"]
      },
      {
        id: "b",
        text: "We're testing and learning. I've got a team on it.",
        signals: ["glue", "clutch"]
      },
      {
        id: "c",
        text: "Watching closely, but not ready to shift budget yet.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Honestly, we're behind on this. I need to get on it.",
        signals: ["heart"]
      }
    ]
  },
  {
    id: "q5",
    text: "How do you prove marketing's impact to the board?",
    options: [
      {
        id: "a",
        text: "Pipeline and revenue. I tie everything to business outcomes.",
        signals: ["vision", "goGoGoer"]
      },
      {
        id: "b",
        text: "Efficiency metrics. Cost-per-asset, velocity, team utilization.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Quality and brand. Not everything fits in a spreadsheet.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Still building the measurement framework. It's a work in progress.",
        signals: ["heart", "clutch"]
      }
    ]
  },
  {
    id: "q6",
    text: "How would you describe your leadership style?",
    options: [
      {
        id: "a",
        text: "Visionary. I set the direction and align the org around it.",
        signals: ["vision"]
      },
      {
        id: "b",
        text: "Process-oriented. I build the systems that make the team run.",
        signals: ["glue"]
      },
      {
        id: "c",
        text: "Quality-obsessed. I hold a high bar and the team rises to it.",
        signals: ["tastemaker"]
      },
      {
        id: "d",
        text: "Adaptive. I read the situation and adjust.",
        signals: ["clutch"]
      }
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
