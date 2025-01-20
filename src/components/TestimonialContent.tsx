import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TestimonialContentProps {
  rating: number;
  text: string;
  tag: string;
  onRatingChange: (rating: number) => void;
  onTextChange: (text: string) => void;
  onTagChange: (tag: string) => void;
}

const MAX_CHARS = 1200;

export const TestimonialContent = ({
  rating,
  text,
  tag,
  onRatingChange,
  onTextChange,
  onTagChange,
}: TestimonialContentProps) => {
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      console.log("Fetching tags from Supabase");
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .order("name");

      if (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }

      console.log("Fetched tags:", data);
      return data;
    },
  });

  const handleTextChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      onTextChange(value);
    }
  };

  return (
    <>
      <div className="space-y-2 w-full">
        <StarRating rating={rating} onChange={onRatingChange} />
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="tag" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          What product did you use?
        </Label>
        <Select 
          value={tag} 
          onValueChange={onTagChange} 
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Please select..." className="text-gray-400" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag.name} value={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="testimonial" className="after:content-['*'] after:ml-0.5 after:text-red-500">
          Your testimonial
        </Label>
        <div className="text-sm text-muted-foreground mb-2">
          What's your situation? Are you a PM? How has my offer helped you? What was the best thing about my offer?
        </div>
        <Textarea
          id="testimonial"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Share your experience..."
          className="min-h-[150px] w-full resize-none"
          required
          maxLength={MAX_CHARS}
        />
        <div className="text-sm text-muted-foreground text-right">
          {text.length}/{MAX_CHARS} characters
        </div>
      </div>
    </>
  );
};