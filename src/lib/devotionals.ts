// Devotional writing here is Tìshòk's own. Scripture text is never stored in this file;
// it is fetched by reference (see usePassage). References are standard Bible references.
export type Devotional = {
  key: string; theme: string; ref: string; display: string;
  context: string; message: string; questions: string[]; action: string; prayer: string;
};

export const DEVOTIONALS: Devotional[] = [
  {
    key: "better-together", theme: "Better together", ref: "Ecclesiastes 4:9-12", display: "Ecclesiastes 4:9–12",
    context: "Ecclesiastes is a reflective book about work, meaning and the limits of life. This section says shared life is sturdier than going alone.",
    message: "Faith was never meant to be carried alone, and neither was a relationship. Many Christians read the cord of three strands as placing God at the centre of a partnership. Growing together starts with small, steady choices to show up for each other.",
    questions: ["Where do you most need your partner’s support right now?", "How can you support them without trying to carry everything for them?"],
    action: "Tell your partner one specific thing you are thankful for this week.",
    prayer: "Thank God for your partner by name, and ask for help to be a steady companion.",
  },
  {
    key: "love-when-hard", theme: "Loving when it is difficult", ref: "1 Corinthians 13:4-7", display: "1 Corinthians 13:4–7",
    context: "Paul wrote to a church in Corinth that struggled with pride and division. His description of love is practical rather than sentimental.",
    message: "Love here is mostly habits: patience, kindness, not keeping score. It is easy on good days. The real test is the evening you are tired, misunderstood, or sure you are right. Choosing patience then is not weakness; it is love at work.",
    questions: ["Which part of this description is hardest for you right now?", "When did your partner last show you this kind of love?"],
    action: "Pick one phrase from the passage and practise it in your next disagreement.",
    prayer: "Ask God to grow patience in you where you are quickest to react.",
  },
  {
    key: "slow-to-anger", theme: "Patience during misunderstandings", ref: "James 1:19-20", display: "James 1:19–20",
    context: "James is a practical letter to believers about living out faith, including how they speak and handle anger.",
    message: "Many misunderstandings grow because we reply before we have understood. Listening first says the other person matters more than winning the moment. You can still be honest; you simply do it after you have heard them.",
    questions: ["What does your partner usually need from you when they are upset?", "What do you tend to do when you feel misunderstood?"],
    action: "In your next hard conversation, repeat back what you heard before you respond.",
    prayer: "Ask for a calm heart and an open ear before your next difficult conversation.",
  },
  {
    key: "forgiveness-with-honesty", theme: "Forgiveness without ignoring accountability", ref: "Ephesians 4:31-32", display: "Ephesians 4:31–32",
    context: "Paul describes how people in the church should treat one another, rooting forgiveness in the forgiveness believers have received.",
    message: "Forgiving someone does not mean pretending nothing happened. Honest forgiveness names the hurt, listens, asks for change where it is needed, and lets go of revenge. Kindness and truth belong together.",
    questions: ["Is anything unresolved that deserves a gentle, honest conversation?", "What would repair look like for you in practical terms?"],
    action: "If something is weighing on you, ask your partner for a calm time to talk this week.",
    prayer: "Ask God for the courage to be honest and the grace to forgive.",
  },
  {
    key: "serve-in-love", theme: "Serving one another", ref: "Galatians 5:13-14", display: "Galatians 5:13–14",
    context: "Paul tells the Galatian believers that their freedom in Christ is meant to be used to serve one another in love.",
    message: "Serving is love made visible in ordinary tasks. It works best when it is offered freely, not as a debt or a way to get something back. Notice what would genuinely help your partner today.",
    questions: ["What kind of help makes you feel most cared for?", "Where might you be keeping score instead of serving?"],
    action: "Do one unrequested, practical kindness for your partner today.",
    prayer: "Ask God to show you one way to serve someone you love today.",
  },
  {
    key: "truth-and-trust", theme: "Trust and honesty", ref: "Ephesians 4:25", display: "Ephesians 4:25",
    context: "This verse sits within Paul’s teaching about the new way of life believers are called to, including how they speak to each other.",
    message: "Trust is built in small honest moments: saying what is true, kindly and on time. Hiding small things makes big things harder to say. Honesty delivered with care protects a relationship rather than threatening it.",
    questions: ["Is there something small you have been avoiding saying?", "What helps you feel safe being honest?"],
    action: "Share one honest thought or feeling today that you would normally keep to yourself.",
    prayer: "Ask God to make you someone whose word can be trusted.",
  },
  {
    key: "home-rooted", theme: "Building a home rooted in faith", ref: "Psalm 127:1", display: "Psalm 127:1",
    context: "Psalm 127 is one of the Songs of Ascents, short psalms associated with pilgrimage. It speaks of depending on God in the work of building a life.",
    message: "A strong home is built from habits long before it has walls: shared prayer, honest talk, forgiveness and rest. You are not behind or ahead. You are laying foundations, one ordinary day at a time.",
    questions: ["What is one habit you hope your future home is known for?", "What could you begin practising now?"],
    action: "Talk together about one tradition, like a weekly prayer or meal, you would like to start.",
    prayer: "Pray for the home you hope to build, and for wisdom in the foundations you lay now.",
  },
];

// Uses the device's local date so "today" matches the person's own day.
export function todayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function devotionalForDate(d: Date = new Date()): Devotional {
  const dayNumber = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return DEVOTIONALS[dayNumber % DEVOTIONALS.length];
}
