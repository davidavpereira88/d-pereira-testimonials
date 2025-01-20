import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBranding } from "@/hooks/useBranding";
import { TruncatedTag } from "./TruncatedTag";

export interface Testimonial {
  id: string;
  author: {
    name: string;
    email: string;
    social?: string;
    photo?: string;
  };
  rating: number;
  text: string;
  date: string;
  tags: string[];
  approved: boolean;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onEdit?: (id: string) => void;
  isEmbedded?: boolean;
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
}

const MAX_VISIBLE_CHARS = 320;

export const TestimonialCard = ({
  testimonial,
  isAdmin,
  onApprove,
  onEdit,
  isEmbedded = window.location.pathname === "/embed",
  onTagClick,
  selectedTag,
}: TestimonialCardProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const { data: branding } = useBranding();
  const primaryColor = branding?.primary_color || '#2e75a9';
  const showTagsOnIndex = branding?.show_tags_on_index === "true";
  
  const formattedDate = new Date(testimonial.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(isAdmin && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderAuthorName = () => {
    if (testimonial.author.social) {
      return (
        <a
          href={testimonial.author.social}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline text-[#292929]"
        >
          {testimonial.author.name}
        </a>
      );
    }
    return (
      <div className="font-semibold text-[#292929]">{testimonial.author.name}</div>
    );
  };

  const isTextLong = testimonial.text.length > MAX_VISIBLE_CHARS;
  const displayText = isTextLong && !isEmbedded
    ? `${testimonial.text.slice(0, MAX_VISIBLE_CHARS)}...`
    : testimonial.text;

  const renderTags = () => {
    if (showTagsOnIndex && testimonial.tags.length > 0) {
      return (
        <div className="mt-4 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0">
          <div className="flex flex-wrap gap-2">
            {testimonial.tags.map((tag, index) => (
              <TruncatedTag 
                key={index} 
                tag={tag} 
                index={index} 
                onClick={onTagClick}
                isSelected={tag === selectedTag}
              />
            ))}
          </div>
          <div className="text-sm text-[#292929]">{formattedDate}</div>
        </div>
      );
    }
    return <div className="mt-4 text-sm text-[#292929]">{formattedDate}</div>;
  };

  const renderTestimonialContent = () => (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {testimonial.author.photo && !imageLoadError ? (
              <AvatarImage
                src={testimonial.author.photo}
                alt={testimonial.author.name}
                className="object-cover"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <AvatarFallback 
                className="text-lg font-semibold text-primary-foreground"
                style={{ backgroundColor: primaryColor }}
              >
                {getInitials(testimonial.author.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>{renderAuthorName()}</div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onApprove?.(testimonial.id)}
            >
              <Heart
                className={`h-5 w-5 ${
                  testimonial.approved ? "text-red-500 fill-current" : "text-gray-300"
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(testimonial.id)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <StarRating rating={testimonial.rating} readonly />
      </div>

      <p className="mt-4 text-[#292929]">{testimonial.text}</p>

      {renderTags()}
    </>
  );

  return (
    <Card className="transition-colors duration-200 hover:bg-[#fafbfc]">
      <CardContent className="p-6">
        {isTextLong && !isEmbedded ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {testimonial.author.photo && !imageLoadError ? (
                    <AvatarImage
                      src={testimonial.author.photo}
                      alt={testimonial.author.name}
                      className="object-cover"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <AvatarFallback 
                      className="text-lg font-semibold text-primary-foreground"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {getInitials(testimonial.author.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>{renderAuthorName()}</div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onApprove?.(testimonial.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        testimonial.approved ? "text-red-500 fill-current" : "text-gray-300"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(testimonial.id)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <StarRating rating={testimonial.rating} readonly />
            </div>

            <p className="mt-4 text-[#292929]">{displayText}</p>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="mt-2 h-auto p-0">
                  Show more
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                {renderTestimonialContent()}
              </DialogContent>
            </Dialog>

            {renderTags()}
          </>
        ) : (
          renderTestimonialContent()
        )}
      </CardContent>
    </Card>
  );
};
