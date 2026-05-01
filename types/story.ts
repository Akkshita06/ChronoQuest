export type StoryChoice = {
  id: string;
  label: string;
  icon: string;
  consequence: {
    tone: "war" | "peace" | "power";
    text: string;
  };
};

export type StoryNode = {
  id: string;
  text: string;
  choices: StoryChoice[];
  nextNode: Partial<Record<string, string>>;
};
