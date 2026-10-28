import { dayNumber } from "./prayerFocus";

export type Question = { key: string; kind: string; text: string };

export const QUESTIONS: Question[] = [
  { key: "loved", kind: "Appreciation", text: "What made you feel most loved by your partner this week?" },
  { key: "express", kind: "Communication", text: "Is there something you have been finding difficult to express?" },
  { key: "understand", kind: "Understanding", text: "What is one thing we could do to understand each other better?" },
  { key: "peaceful-home", kind: "Values", text: "What does a peaceful home look like to you?" },
  { key: "spiritual-growth", kind: "Faith", text: "How can we support each other’s spiritual growth without controlling one another?" },
  { key: "small-things", kind: "Appreciation", text: "What is a small thing your partner does that you are grateful for?" },
  { key: "when-upset", kind: "Listening", text: "When you are upset, what helps most: space, a listening ear, or practical help?" },
  { key: "traditions", kind: "Future", text: "Which tradition from your family would you like to keep, and which would you change?" },
  { key: "money", kind: "Responsibility", text: "What did you learn about money growing up, and how does it shape you now?" },
  { key: "good-week", kind: "Expectations", text: "What does a good week together look like for you?" },
  { key: "forgiveness", kind: "Forgiveness", text: "What helps you forgive, and what makes it hard?" },
  { key: "honesty", kind: "Trust", text: "What helps you feel safe being honest in this relationship?" },
  { key: "calling", kind: "Calling", text: "What dream or calling do you hope to grow into, and how could your partner support it?" },
  { key: "close-to-god", kind: "Faith", text: "When did you last feel close to God, and what was happening around you?" },
];

export const questionForDate = (d: Date = new Date()) => QUESTIONS[dayNumber(d) % QUESTIONS.length];
