export type Role = "ic" | "manager" | "executive";

export interface AnswerOption {
  id: string;
  text: string;
  scores: Record<string, number>; // archetype id -> points
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
      scores: {}
    },
    {
      id: "manager",
      text: "I manage a team or function. (Director, Lead, Sr. Manager)",
      scores: {}
    },
    {
      id: "ic",
      text: "I'm in the game every day doing the work. (Writer, Ops, Analyst, Creator)",
      scores: {}
    }
  ]
};

// IC Track Questions (Q2-Q5)
export const icQuestions: Question[] = [
  {
    id: "q2",
    text: "When you're assigned a new content project, what's your first instinct?",
    options: [
      {
        id: "a",
        text: "Start writing immediately—I'll figure it out as I go",
        scores: { sprinter: 3, pinchHitter: 1 }
      },
      {
        id: "b",
        text: "Research extensively and outline every detail before starting",
        scores: { perfectTen: 3, closer: 1 }
      },
      {
        id: "c",
        text: "Look for a new tool or approach that could make this more interesting",
        scores: { trailblazer: 3, pacesetter: 1 }
      },
      {
        id: "d",
        text: "Check what resources exist and build on what's already working",
        scores: { trainer: 2, underdog: 2 }
      }
    ]
  },
  {
    id: "q3",
    text: "Your content is performing well. What do you do next?",
    options: [
      {
        id: "a",
        text: "Document exactly what worked so others can replicate it",
        scores: { trainer: 3, quarterback: 1 }
      },
      {
        id: "b",
        text: "Immediately start working on the next piece to keep momentum",
        scores: { sprinter: 3, underdog: 1 }
      },
      {
        id: "c",
        text: "Dig into the analytics to prove the revenue impact",
        scores: { closer: 3, perfectTen: 1 }
      },
      {
        id: "d",
        text: "Experiment with an even more unconventional approach",
        scores: { trailblazer: 3, pacesetter: 1 }
      }
    ]
  },
  {
    id: "q4",
    text: "A colleague asks for help with something outside your job description. You:",
    options: [
      {
        id: "a",
        text: "Jump in immediately—variety keeps things interesting",
        scores: { pinchHitter: 3, underdog: 1 }
      },
      {
        id: "b",
        text: "Help them, but also create a resource so they can do it themselves next time",
        scores: { trainer: 3, quarterback: 1 }
      },
      {
        id: "c",
        text: "Help if it's quick, but stay focused on your high-impact work",
        scores: { closer: 2, sprinter: 2 }
      },
      {
        id: "d",
        text: "Help, but suggest a better process to prevent this in the future",
        scores: { pacesetter: 2, perfectTen: 2 }
      }
    ]
  },
  {
    id: "q5",
    text: "What's your biggest source of pride in your work?",
    options: [
      {
        id: "a",
        text: "The sheer volume of quality work I produce",
        scores: { sprinter: 2, pinchHitter: 2 }
      },
      {
        id: "b",
        text: "The measurable business results I can point to",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "c",
        text: "The craft and attention to detail in everything I create",
        scores: { perfectTen: 3, trainer: 1 }
      },
      {
        id: "d",
        text: "Being ahead of the curve on new approaches",
        scores: { trailblazer: 2, pacesetter: 2 }
      }
    ]
  }
];

// Manager Track Questions (Q2-Q5)
export const managerQuestions: Question[] = [
  {
    id: "q2",
    text: "How do you prefer to develop your team's capabilities?",
    options: [
      {
        id: "a",
        text: "Build comprehensive training programs and documentation",
        scores: { trainer: 3, perfectTen: 1 }
      },
      {
        id: "b",
        text: "Throw them into projects and let them learn by doing",
        scores: { sprinter: 2, underdog: 2 }
      },
      {
        id: "c",
        text: "Introduce them to cutting-edge tools and methodologies",
        scores: { trailblazer: 2, pacesetter: 2 }
      },
      {
        id: "d",
        text: "Focus on skills that directly tie to revenue metrics",
        scores: { closer: 3, quarterback: 1 }
      }
    ]
  },
  {
    id: "q3",
    text: "When your team faces a resource crunch, what's your approach?",
    options: [
      {
        id: "a",
        text: "Roll up my sleeves and personally fill the gaps",
        scores: { pinchHitter: 3, underdog: 1 }
      },
      {
        id: "b",
        text: "Prioritize ruthlessly and cut scope to maintain quality",
        scores: { perfectTen: 3, closer: 1 }
      },
      {
        id: "c",
        text: "Find creative shortcuts and scrappy solutions",
        scores: { underdog: 3, sprinter: 1 }
      },
      {
        id: "d",
        text: "Coordinate across teams to borrow resources temporarily",
        scores: { quarterback: 3, trainer: 1 }
      }
    ]
  },
  {
    id: "q4",
    text: "What metric do you obsess over most?",
    options: [
      {
        id: "a",
        text: "Content velocity—how much we're shipping",
        scores: { sprinter: 3, pinchHitter: 1 }
      },
      {
        id: "b",
        text: "Revenue attribution—proving content's business impact",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "c",
        text: "Quality scores—engagement, time on page, conversions",
        scores: { perfectTen: 3, trainer: 1 }
      },
      {
        id: "d",
        text: "Innovation rate—new formats, channels, approaches",
        scores: { trailblazer: 2, pacesetter: 2 }
      }
    ]
  },
  {
    id: "q5",
    text: "How do you want your team to be known?",
    options: [
      {
        id: "a",
        text: "The team that ships more than anyone thought possible",
        scores: { sprinter: 2, underdog: 2 }
      },
      {
        id: "b",
        text: "The team that other teams learn from",
        scores: { trainer: 3, pacesetter: 1 }
      },
      {
        id: "c",
        text: "The team that drives real revenue",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "d",
        text: "The team that's always two steps ahead",
        scores: { trailblazer: 2, pacesetter: 2 }
      }
    ]
  }
];

// Executive Track Questions (Q2-Q5)
export const executiveQuestions: Question[] = [
  {
    id: "q2",
    text: "What's your primary focus for your content organization?",
    options: [
      {
        id: "a",
        text: "Building a best-in-class operation others will emulate",
        scores: { pacesetter: 3, trainer: 1 }
      },
      {
        id: "b",
        text: "Maximizing output while maintaining quality standards",
        scores: { sprinter: 2, perfectTen: 2 }
      },
      {
        id: "c",
        text: "Creating clear attribution from content to revenue",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "d",
        text: "Staying ahead of industry shifts and new technologies",
        scores: { trailblazer: 3, pacesetter: 1 }
      }
    ]
  },
  {
    id: "q3",
    text: "When presenting to the board, what story do you lead with?",
    options: [
      {
        id: "a",
        text: "Revenue impact and pipeline contribution",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "b",
        text: "Efficiency gains and team velocity improvements",
        scores: { sprinter: 2, underdog: 2 }
      },
      {
        id: "c",
        text: "How we're building an AI-native content operation",
        scores: { pacesetter: 3, trailblazer: 1 }
      },
      {
        id: "d",
        text: "Quality improvements and brand consistency",
        scores: { perfectTen: 3, trainer: 1 }
      }
    ]
  },
  {
    id: "q4",
    text: "What's your hiring philosophy for content roles?",
    options: [
      {
        id: "a",
        text: "Hire versatile generalists who can adapt to anything",
        scores: { pinchHitter: 3, underdog: 1 }
      },
      {
        id: "b",
        text: "Hire specialists and invest in their development",
        scores: { trainer: 3, perfectTen: 1 }
      },
      {
        id: "c",
        text: "Hire people who are already experimenting with AI",
        scores: { trailblazer: 2, pacesetter: 2 }
      },
      {
        id: "d",
        text: "Hire people with strong business and analytics backgrounds",
        scores: { closer: 3, quarterback: 1 }
      }
    ]
  },
  {
    id: "q5",
    text: "What legacy do you want to leave?",
    options: [
      {
        id: "a",
        text: "I built the playbook everyone else is now copying",
        scores: { pacesetter: 3, trailblazer: 1 }
      },
      {
        id: "b",
        text: "I proved content is a revenue driver, not a cost center",
        scores: { closer: 3, quarterback: 1 }
      },
      {
        id: "c",
        text: "I developed talent that went on to lead their own teams",
        scores: { trainer: 3, underdog: 1 }
      },
      {
        id: "d",
        text: "I raised the bar for what content quality means",
        scores: { perfectTen: 3, pacesetter: 1 }
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

export function calculateArchetype(answers: Record<string, string>, role: Role): string {
  const scores: Record<string, number> = {};
  const questions = [roleQuestion, ...getQuestionsForRole(role)];

  // Process each answer
  for (const question of questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;

    const selectedOption = question.options.find(opt => opt.id === answerId);
    if (!selectedOption) continue;

    // Add scores from this answer
    for (const [archetypeId, points] of Object.entries(selectedOption.scores)) {
      scores[archetypeId] = (scores[archetypeId] || 0) + points;
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

  // Handle ties by picking randomly
  if (topArchetypes.length > 1) {
    return topArchetypes[Math.floor(Math.random() * topArchetypes.length)];
  }

  return topArchetypes[0] || "sprinter"; // Default fallback
}
