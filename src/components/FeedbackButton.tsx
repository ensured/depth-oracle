import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FeedbackInput from "./FeedbackInput";
import { MessageCircle } from "lucide-react";

const FeedbackButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer !px-1.5">
          <MessageCircle className="!h-[1.4rem] !w-[1.4rem]" />
          <span className="sr-only">Open feedback form</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] border border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Feedback</DialogTitle>
          <DialogDescription className="text-primary">
            Please leave your feedback below.
          </DialogDescription>
        </DialogHeader>
        <FeedbackInput />
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;
