export type StoryChoice = {
  id: string;
  label: string;
};

export type StoryNode = {
  id: string;
  text: string;
  choices: StoryChoice[];
  nextNode: Partial<Record<string, string>>;
};
