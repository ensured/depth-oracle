export interface Quote {
  id: number;
  quote: string;
  topics: string[];
  source: string | null;
}

export const quotes: Quote[] = [
  {
    id: 0,
    quote:
      "By not being aware of having a shadow, you declare a part of your personality to be non-existent. Then it enters the kingdom of the non-existent, which swells up and takes on enormous proportions…If you get rid of qualities you don’t like by denying them, you become more and more unaware of what you are, you declare yourself more and more non-existent, and your devils will grow fatter and fatter.",
    topics: ["Shadow", "Projection"],
    source: null,
  },
  {
    id: 1,
    quote:
      "Until you make the unconscious conscious, it will direct your life and you will call it fate.",
    topics: ["Fate", "Unconscious Mind", "Consciousness"],
    source: null,
  },
  {
    id: 2,
    quote: "I am not what happened to me, I am what I choose to become.",
    topics: ["Inspirational", "Life", "Personal Growth"],
    source: null,
  },
  {
    id: 3,
    quote: "Who looks outside, dreams; who looks inside, awakes.",
    topics: ["Self-Discovery", "Dreams", "Awakening"],
    source: "Carl Gustav Jung (1973). 'Letters'",
  },
  {
    id: 4,
    quote:
      "Knowing your own darkness is the best method for dealing with the darknesses of other people.",
    topics: ["Self-Awareness", "Shadow Work", "Relationships"],
    source: null,
  },
  {
    id: 5,
    quote:
      "Everything that irritates us about others can lead us to an understanding of ourselves.",
    topics: ["Self-Reflection", "Relationships", "Projection"],
    source:
      "Carl Gustav Jung (1973). 'Memories, dreams, reflections', Random House Inc",
  },
  {
    id: 6,
    quote:
      "One does not become enlightened by imagining figures of light, but by making the darkness conscious.",
    topics: ["Enlightenment", "Shadow Work", "Consciousness"],
    source: null,
  },
  {
    id: 7,
    quote: "Man cannot stand a meaningless life.",
    topics: ["Meaning", "Purpose", "Human Nature"],
    source: null,
  },
  {
    id: 8,
    quote: "Show me a sane man and I will cure him for you.",
    topics: ["Sanity", "Psychology", "Humor"],
    source: null,
  },
  {
    id: 9,
    quote:
      "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.",
    topics: ["Relationships", "Transformation", "Connection"],
    source: null,
  },
  {
    id: 10,
    quote:
      "The shoe that fits one person pinches another; there is no recipe for living that suits all cases.",
    topics: ["Individuality", "Life Wisdom", "Uniqueness"],
    source: null,
  },
  {
    id: 11,
    quote:
      "Every form of addiction is bad, no matter whether the narcotic be alcohol or morphine or idealism.",
    topics: ["Addiction", "Balance", "Extremism"],
    source: null,
  },
  {
    id: 12,
    quote:
      "Even a happy life cannot be without a measure of darkness, and the word happy would lose its meaning if it were not balanced by sadness.",
    topics: ["Happiness", "Balance", "Duality"],
    source: null,
  },
  {
    id: 13,
    quote:
      "A man who has not passed through the inferno of his passions has never overcome them.",
    topics: ["Passion", "Transformation", "Growth"],
    source: null,
  },
  {
    id: 14,
    quote:
      "We should not pretend to understand the world only by the intellect. The judgement of the intellect is only part of the truth.",
    topics: ["Wisdom", "Intuition", "Knowledge"],
    source: null,
  },
  {
    id: 15,
    quote:
      "As far as we can discern, the sole purpose of human existence is to kindle a light in the darkness of mere being.",
    topics: ["Purpose", "Meaning", "Existence"],
    source: null,
  },
  {
    id: 16,
    quote:
      "If there is anything that we wish to change in the child, we should first examine it and see whether it is not something that could better be changed in ourselves.",
    topics: ["Parenting", "Self-Reflection", "Change"],
    source: null,
  },
  {
    id: 17,
    quote:
      "To confront a person with their own shadow is to show them their own light.",
    topics: ["Shadow Work", "Growth", "Transformation"],
    source: null,
  },
  {
    id: 18,
    quote: "We don't really heal anything; we simply let it go.",
    topics: ["Healing", "Letting Go", "Release"],
    source: null,
  },
  {
    id: 19,
    quote:
      "To ask the right question is already half the solution of a problem.",
    topics: ["Problem-Solving", "Wisdom", "Questions"],
    source: null,
  },
  {
    id: 20,
    quote:
      "There can be no transforming of darkness into light and of apathy into movement without emotion.",
    topics: ["Emotion", "Transformation", "Change"],
    source: null,
  },
  {
    id: 21,
    quote: "In all chaos there is a cosmos, in all disorder a secret order.",
    topics: ["Order", "Chaos", "Meaning"],
    source: null,
  },
  {
    id: 22,
    quote:
      "Sometimes you have to do something unforgivable just to be able to go on living.",
    topics: ["Survival", "Morality", "Life"],
    source: null,
  },
  {
    id: 23,
    quote:
      "Nothing worse could happen to one than to be completely understood.",
    topics: ["Mystery", "Identity", "Understanding"],
    source: null,
  },
  {
    id: 24,
    quote: "Freedom stretches only as far as the limits of our consciousness.",
    topics: ["Freedom", "Consciousness", "Awareness"],
    source: null,
  },
  {
    id: 25,
    quote: "If a man knows more than others, he becomes lonely.",
    topics: ["Loneliness", "Knowledge", "Isolation"],
    source:
      "Carl Gustav Jung (1973). 'Memories, dreams, reflections', Random House Inc",
  },
  {
    id: 26,
    quote:
      "We meet ourselves time and again in a thousand disguises on the path of life.",
    topics: ["Self-Discovery", "Life Journey", "Patterns"],
    source: null,
  },
  {
    id: 27,
    quote:
      "We cannot change anything until we accept it. Condemnation does not liberate, it oppresses.",
    topics: ["Acceptance", "Change", "Liberation"],
    source: null,
  },
  {
    id: 28,
    quote: "We are not what happened to us, we are what we wish to become.",
    topics: ["Identity", "Growth", "Potential"],
    source: null,
  },
  {
    id: 29,
    quote: "The creative mind plays with the object it loves.",
    topics: ["Creativity", "Love", "Passion"],
    source: null,
  },
  {
    id: 30,
    quote: "There is no coming to consciousness without pain.",
    topics: ["Consciousness", "Growth", "Pain"],
    source: null,
  },
  {
    id: 31,
    quote: "Where love stops, power begins, and violence, and terror.",
    topics: ["Love", "Power", "Violence"],
    source: null,
  },
  {
    id: 32,
    quote:
      "It is sad but unfortunately true that man learns nothing from history.",
    topics: ["History", "Learning", "Human Nature"],
    source: null,
  },
  {
    id: 33,
    quote:
      "Only one who has risked the fight with the dragon and is not overcome by it wins the treasure hard to attain.",
    topics: ["Courage", "Challenge", "Reward"],
    source: null,
  },
  {
    id: 34,
    quote: "It is only our deeds that reveal who we are.",
    topics: ["Action", "Character", "Identity"],
    source: null,
  },
  {
    id: 35,
    quote:
      "Loneliness does not come from having no people about one, but from being unable to communicate the things that seem important to oneself.",
    topics: ["Loneliness", "Communication", "Connection"],
    source: null,
  },
  {
    id: 36,
    quote:
      "I shall not commit the fashionable stupidity of regarding everything I cannot explain as a fraud.",
    topics: ["Open-mindedness", "Mystery", "Wisdom"],
    source: null,
  },
  {
    id: 37,
    quote:
      "How can I be substantial if I do not cast a shadow? I must have a dark side also if I am to be whole.",
    topics: ["Shadow", "Wholeness", "Duality"],
    source: null,
  },
  {
    id: 38,
    quote:
      "The greater the contrast, the greater the potential. Great energy only comes from a correspondingly great tension of opposites.",
    topics: ["Potential", "Energy", "Duality"],
    source: null,
  },
  {
    id: 39,
    quote:
      "The difference between a good life and a bad life is how well you walk through the fire.",
    topics: ["Resilience", "Life", "Challenges"],
    source: null,
  },
  {
    id: 40,
    quote:
      "Often the hands will solve a mystery that the intellect has struggled with in vain.",
    topics: ["Action", "Intuition", "Problem-Solving"],
    source: null,
  },
  {
    id: 41,
    quote:
      "When an inner situation is not made conscious, it appears outside as fate.",
    topics: ["Consciousness", "Fate", "Projection"],
    source: null,
  },
  {
    id: 42,
    quote:
      "Understanding does not cure evil, but it is a definite help, inasmuch as one can cope with a comprehensible darkness.",
    topics: ["Understanding", "Evil", "Darkness"],
    source: null,
  },
  {
    id: 43,
    quote: "I would rather be whole than good.",
    topics: ["Wholeness", "Authenticity", "Self"],
    source: null,
  },
  {
    id: 44,
    quote:
      "The world will ask you who you are, and if you don't know, the world will tell you.",
    topics: ["Identity", "Self-Knowledge", "Authenticity"],
    source: null,
  },
  {
    id: 45,
    quote: "The privilege of a lifetime is to become who you truly are.",
    topics: ["Authenticity", "Self-Discovery", "Purpose"],
    source: null,
  },
  {
    id: 46,
    quote:
      "People will do anything, no matter how absurd, to avoid facing their own souls.",
    topics: ["Avoidance", "Self-Confrontation", "Fear"],
    source: null,
  },
  {
    id: 47,
    quote:
      "Your vision will become clear only when you can look into your own heart.",
    topics: ["Self-Knowledge", "Clarity", "Vision"],
    source: null,
  },
  {
    id: 48,
    quote:
      "The first half of life is devoted to forming a healthy ego, the second half is going inward and letting go of it.",
    topics: ["Life Stages", "Ego", "Growth"],
    source: null,
  },
  {
    id: 49,
    quote:
      "If one does not understand a person, one tends to regard him as a fool.",
    topics: ["Understanding", "Judgment", "Perspective"],
    source: null,
  },
  {
    id: 50,
    quote:
      "That which we do not bring to consciousness appears in our lives as fate.",
    topics: ["Consciousness", "Fate", "Awareness"],
    source: null,
  },
  {
    id: 51,
    quote:
      "The pendulum of the mind alternates between sense and nonsense, not between right and wrong.",
    topics: ["Mind", "Duality", "Balance"],
    source: null,
  },
  {
    id: 52,
    quote:
      "It all depends on how we look at things, and not how they are in themselves.",
    topics: ["Perception", "Perspective", "Reality"],
    source: null,
  },
  {
    id: 53,
    quote: "We cannot change anything unless we accept it.",
    topics: ["Acceptance", "Change", "Transformation"],
    source: null,
  },
  {
    id: 54,
    quote: "The most terrifying thing is to accept oneself completely.",
    topics: ["Self-Acceptance", "Fear", "Courage"],
    source: null,
  },
  {
    id: 55,
    quote: "You are what you do, not what you say you'll do.",
    topics: ["Action", "Character", "Integrity"],
    source: "David Suzuki, Ian Hanington (2012). 'Everything Under the Sun'",
  },
  {
    id: 56,
    quote: "The true leader is always led.",
    topics: ["Leadership", "Humility", "Service"],
    source: null,
  },
  {
    id: 57,
    quote:
      "The best political, social, and spiritual work we can do is to withdraw the projection of our shadow onto others.",
    topics: ["Shadow Work", "Projection", "Responsibility"],
    source: null,
  },
  {
    id: 58,
    quote: "Shame is a soul eating emotion.",
    topics: ["Shame", "Emotion", "Soul"],
    source: null,
  },
  {
    id: 59,
    quote: "In each of us there is another whom we do not know.",
    topics: ["Shadow", "Self-Discovery", "Mystery"],
    source: null,
  },
  {
    id: 60,
    quote: "Trust that which gives you meaning and accept it as your guide.",
    topics: ["Meaning", "Trust", "Purpose"],
    source: null,
  },
  {
    id: 61,
    quote: "Religion is a defense against the experience of God.",
    topics: ["Religion", "Spirituality", "Experience"],
    source: null,
  },
  {
    id: 62,
    quote: "I must also have a dark side if I am to be whole.",
    topics: ["Shadow", "Wholeness", "Integration"],
    source: null,
  },
  {
    id: 63,
    quote: "The healthy man does not torture others.",
    topics: ["Health", "Morality", "Compassion"],
    source: null,
  },
  {
    id: 64,
    quote: "Embrace your grief. For there, your soul will grow.",
    topics: ["Grief", "Growth", "Soul"],
    source: null,
  },
  {
    id: 65,
    quote:
      "The greatest tragedy of the family is the unlived lives of the parents.",
    topics: ["Family", "Potential", "Regret"],
    source: null,
  },
  {
    id: 66,
    quote:
      "If there is a fear of falling, the only safety consists in deliberately jumping.",
    topics: ["Fear", "Courage", "Action"],
    source: null,
  },
  {
    id: 67,
    quote:
      "No tree, it is said, can grow to heaven unless its roots reach down to hell.",
    topics: ["Growth", "Duality", "Balance"],
    source: null,
  },
  {
    id: 68,
    quote:
      "Every human life contains a potential, if that potential is not fulfilled, then that life was wasted.",
    topics: ["Potential", "Purpose", "Fulfillment"],
    source: null,
  },
  {
    id: 69,
    quote: "Children are educated by what the grown-up is and not by his talk.",
    topics: ["Parenting", "Education", "Example"],
    source: null,
  },
  {
    id: 70,
    quote:
      "A dream that is not understood remains a mere occurrence; understood it becomes a living experience.",
    topics: ["Dreams", "Understanding", "Experience"],
    source: null,
  },
  {
    id: 71,
    quote:
      "All true things must change and only that which changes remains true.",
    topics: ["Change", "Truth", "Evolution"],
    source: null,
  },
  {
    id: 72,
    quote: "That which we do not confront in ourselves we will meet as fate.",
    topics: ["Shadow Work", "Fate", "Confrontation"],
    source: null,
  },
  {
    id: 73,
    quote: "God enters through the wound.",
    topics: ["Healing", "Spirituality", "Transformation"],
    source: null,
  },
  {
    id: 74,
    quote: "There is no birth of consciousness without pain.",
    topics: ["Consciousness", "Pain", "Growth"],
    source: null,
  },
  {
    id: 75,
    quote: "Please remember, it is what you are that heals, not what you know.",
    topics: ["Healing", "Being", "Wisdom"],
    source: null,
  },
];
