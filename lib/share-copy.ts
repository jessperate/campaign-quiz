// Share copy per archetype × role, sourced from the Notion quiz content doc.
// Used by the /share route to populate OG meta tags for LinkedIn/Twitter previews.

interface ShareCopyEntry {
  mostLikelyTo: string;
  spendTime: string;
  favoritePhrase: string;
  cta: string;
}

export const ARCHETYPE_TAGLINES: Record<string, string> = {
  vision: "You see the big picture.",
  glue: "You turn chaos into systems.",
  trendsetter: "You experiment while others hesitate.",
  goGoGoer: "You're the momentum.",
  tastemaker: "You make it shine.",
  clutch: "You thrive in the gray areas.",
  heart: "You make the work feel like purpose.",
};

export const SHARE_COPY: Record<string, Record<string, ShareCopyEntry>> = {
  vision: {
    ic: {
      mostLikelyTo: "Have opinions about the roadmap",
      spendTime: "Connecting all the dots",
      favoritePhrase: "But have we considered...",
      cta: "AI search is rewriting the rules. Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Turn Slack threads into strategic initiatives",
      spendTime: "Finding signal through noise",
      favoritePhrase: "OK, here's how we'll proceed",
      cta: "AI search is rewriting the rules. Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Drop hot takes on org design at happy hour",
      spendTime: "White-boarding (so satisfying)",
      favoritePhrase: "I'll socialize this with leadership",
      cta: "AI search is rewriting the rules. Find out what kind of player you are.",
    },
  },
  glue: {
    ic: {
      mostLikelyTo: "Be everyone's onboarding buddy",
      spendTime: "Keeping people in the loop",
      favoritePhrase: "I have a doc for that",
      cta: "AI search needs new playbooks. Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Turn retros into actual process improvements",
      spendTime: "Building projects and assigning tasks",
      favoritePhrase: "Let's document as we go",
      cta: "AI search needs new playbooks. Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Have read Measure What Matters twice",
      spendTime: "Explaining frameworks vs SOPs",
      favoritePhrase: "Let's make this a playbook",
      cta: "AI search needs new playbooks. Find out what kind of player you are.",
    },
  },
  trendsetter: {
    ic: {
      mostLikelyTo: "Be first-name basis with product teams",
      spendTime: "Reading industry reports nobody else has time for",
      favoritePhrase: "I've been experimenting with...",
      cta: "Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Reorganize teams around new opportunities",
      spendTime: "Running pilots",
      favoritePhrase: "Trust me on this one",
      cta: "Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Know every founder in your zip code",
      spendTime: "Reading TechCrunch with morning coffee",
      favoritePhrase: "I've been saying this for months",
      cta: "Find out what kind of player you are.",
    },
  },
  goGoGoer: {
    ic: {
      mostLikelyTo: "Ship before anyone says \"wait, should we...\"",
      spendTime: "Executing (iterate later)",
      favoritePhrase: "I'll have it to you by EOD",
      cta: "AI search rewards speed. Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Hit quarterly goals by month two",
      spendTime: "Unblocking",
      favoritePhrase: "Ship now, iterate later",
      cta: "AI search rewards speed. Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Turn \"EOQ\" into \"EOW\"",
      spendTime: "Refreshing analytics dashboards",
      favoritePhrase: "Up and to the right!",
      cta: "AI search rewards speed. Find out what kind of player you are.",
    },
  },
  tastemaker: {
    ic: {
      mostLikelyTo: "Ship at 11:59 PM (wasn't ready at 11:58)",
      spendTime: "Peer-reviewing my own work",
      favoritePhrase: "Let's take one more pass",
      cta: "In a world of AI slop, taste wins. Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Believe \"it's fine\" means \"not good enough\"",
      spendTime: "Reading copy out loud",
      favoritePhrase: "How can we push this further?",
      cta: "In a world of AI slop, taste wins. Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Change the font in the board deck",
      spendTime: "Explaining what \"elevated\" means",
      favoritePhrase: "Can we make it more [gestures vaguely] us?",
      cta: "In a world of AI slop, taste wins. Find out what kind of player you are.",
    },
  },
  clutch: {
    ic: {
      mostLikelyTo: "Be the person who \"knows a trick\"",
      spendTime: "Collecting hats",
      favoritePhrase: "Yeah, I can take that on",
      cta: "Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Solve problems nobody saw coming",
      spendTime: "Saving the day",
      favoritePhrase: "What does the team need right now?",
      cta: "Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Have a calendar that makes people concerned",
      spendTime: "Context switching between completely different initiatives",
      favoritePhrase: "It depends (on literally everything)",
      cta: "Find out what kind of player you are.",
    },
  },
  heart: {
    ic: {
      mostLikelyTo: "Watch tutorials at 2x speed",
      spendTime: "Asking questions others are scared to ask",
      favoritePhrase: "I'll take a crack at it",
      cta: "Find out what kind of player you are.",
    },
    manager: {
      mostLikelyTo: "Have the most loyal team",
      spendTime: "Proving management is about progress, not perfection",
      favoritePhrase: "Let's see what happens",
      cta: "Find out what kind of player you are.",
    },
    executive: {
      mostLikelyTo: "Become everyone's favorite executive",
      spendTime: "Learning from your direct reports",
      favoritePhrase: "Let's experiment!",
      cta: "Find out what kind of player you are.",
    },
  },
};

export function getShareCopy(archetypeId: string, role: string) {
  const archCopy = SHARE_COPY[archetypeId];
  if (!archCopy) return null;
  return archCopy[role] || archCopy.ic; // fallback to IC if role not found
}
