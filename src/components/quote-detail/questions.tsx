import React, { useState, useRef, useEffect } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Icons } from "~/components/icons";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionAboutLineItemsProps {
  quoteId: number;
}

interface Message {
  type: "user" | "ai";
  content: string;
}

export const QuestionAboutLineItems: React.FC<QuestionAboutLineItemsProps> = ({
  quoteId
}) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const askQuestionMutation = api.quote.askQuestionAboutLineItems.useMutation();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: question }]);
    setQuestion("");

    try {
      const response = await askQuestionMutation.mutateAsync({
        quoteId,
        question
      });
      setMessages((prev) => [...prev, { type: "ai", content: response }]);
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get an answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleAskQuestion();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Icons.sparkles className="mr-2 h-4 w-4" />
          Soff AI
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96">
        <motion.div
          initial={false}
          animate={{ height: messages.length > 0 ? "400px" : "auto" }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 flex-grow overflow-hidden"
              >
                <ScrollArea className="h-[calc(400px-4rem)] rounded-md bg-gray-50 p-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 rounded-lg p-2 ${
                        msg.type === "user"
                          ? "ml-auto bg-blue-100"
                          : "bg-accent"
                      } max-w-[80%]`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative mt-auto">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="How can I help?"
              ref={inputRef}
              rows={1}
              className="flex h-9 w-full resize-none items-center overflow-hidden rounded-full border bg-background pr-10 focus-visible:ring-soff-foreground"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading}
              className={cn(
                "absolute bottom-1 right-1",
                "h-7 w-7 p-0",
                "rounded-full",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
              variant="soff"
            >
              {isLoading ? (
                <Icons.loaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.arrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};
