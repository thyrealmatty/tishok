// Future Family journeys. These are conversations about the future, not decisions or rules.
export type Journey = { key: string; title: string; intro: string; steps: { key: string; prompt: string }[] };

const steps = (...prompts: string[]) => prompts.map((prompt, i) => ({ key: `s${i + 1}`, prompt }));

export const JOURNEYS: Journey[] = [
  {
    key: "faith-values", title: "Faith and values",
    intro: "Understanding what each of you believes and hopes for. There are no wrong answers.",
    steps: steps(
      "What does your faith mean to you, in your own words?",
      "Which spiritual habits help you most, and which do you struggle with?",
      "How do you want faith to shape decisions in your future home?",
      "What would you want to do if you disagreed about a spiritual question?",
    ),
  },
  {
    key: "money", title: "Finances and responsibility",
    intro: "Money is a common source of stress. Talking early builds trust.",
    steps: steps(
      "What did you learn about money growing up?",
      "What do giving, saving and spending look like in a healthy season of life for you?",
      "Is there any debt, goal or responsibility you would like your partner to understand?",
      "How would you like to make big money decisions together?",
    ),
  },
  {
    key: "repair", title: "Communication and repair",
    intro: "Every couple disagrees. What matters is how you come back together.",
    steps: steps(
      "How do you tend to behave when you are hurt or stressed?",
      "What helps you return to a conversation after a break?",
      "What does a sincere apology look like to you?",
      "What is one habit you would like to build for talking things through?",
    ),
  },
  {
    key: "families", title: "Families and boundaries",
    intro: "Honouring your families while building something of your own.",
    steps: steps(
      "What do your families expect of you, and how do you feel about it?",
      "Where might you need healthy boundaries with family, set kindly?",
      "How would you like to include each other’s families in your lives?",
      "How can you honour your families while building your own home?",
    ),
  },
  {
    key: "home", title: "Home and daily life",
    intro: "Picturing an ordinary day in the home you hope to build.",
    steps: steps(
      "What does a normal, peaceful day at home look like to you?",
      "How would you like to share household responsibilities, based on strengths and seasons rather than assumptions?",
      "How would you like to use rest, hospitality and time with others?",
      "Which habits of prayer or Scripture would you love to have at home?",
    ),
  },
  {
    key: "children-legacy", title: "Children and legacy",
    intro: "A hopeful look ahead, if and when God gives you children. Nothing here is a decision.",
    steps: steps(
      "What do you hope children would learn about God from their home?",
      "What kind of parenting do you want to practise, and what would you do differently from how you were raised?",
      "Which family traditions would you like to start?",
      "What legacy do you hope to leave for future generations?",
    ),
  },
];
