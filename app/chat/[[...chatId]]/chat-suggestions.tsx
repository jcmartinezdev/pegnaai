import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Book, Code2, Compass, Sparkles } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "explore", label: "Explore", icon: Compass },
  { id: "creative", label: "Create", icon: Sparkles },
  { id: "learning", label: "Learn", icon: Book },
  { id: "coding", label: "Code", icon: Code2 },
];

const suggestions: Record<string, string[]> = {
  explore: [
    "How does AI work?",
    "Generate an image of a dog in space",
    "Tell me a fun fact about space",
    "Who are you?",
  ],
  coding: [
    "Write a Python function to reverse a string",
    "Explain me React useMemo like I'm a 5 year old",
    "Best practices for writing clean code",
    "What makes Go a good programming language?",
  ],
  creative: [
    "Write a short story about time travel",
    "Help me brainstorm names for a tech startup",
    "Create a poem about nature",
    "Generate a plot for a fantasy novel",
    "Generate ideas for a science fiction novel",
  ],
  learning: [
    "Explain the theory of relativity simply",
    "How does the human immune system work?",
    "What caused the fall of the Roman Empire?",
    "Teach me the basics of photography",
    "What are the key principles of economics?",
    "How do I start learning a new language?",
  ],
};

type ChatSuggestionsProps = {
  onSuggestionClick: (suggestion: string) => void;
};

export default function ChatSuggestions({
  onSuggestionClick,
}: ChatSuggestionsProps) {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <div className="mt-16 w-full max-w-2xl mx-auto text-left overflow-hidden">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold text-slate-800 dark:text-slate-200">
          How can I help you today?
        </h1>
        <p className="text-slate-500 dark:text-slate-300 mt-1">
          Select a suggestion or type your own question
        </p>
      </div>
      <div className="grid grid-cols-4 space-x-2 md:space-x-4 w-full mb-6">
        {tabs.map((tab) => (
          <Button
            variant={activeTab === tab.id ? "default" : "outline"}
            className={cn(
              "md:flex-grow md:rounded-full flex-col md:flex-row h-auto",
              activeTab === tab.id
                ? "bg-primary/80 border-primary/20 text-primary-foreground"
                : "bg-primary/10 border-primary/20 shadow-xs shadow-primary text-primary hover:bg-primary/20 hover:text-primary",
            )}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            {tab.label}
          </Button>
        ))}
      </div>
      <div>
        {suggestions[activeTab].map((suggestion, i) => (
          <div key={i}>
            <button
              className="w-full text-left p-3 rounded-md hover:bg-primary/10 my-1 cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
            <Separator />
          </div>
        ))}
      </div>
    </div>
  );
}
