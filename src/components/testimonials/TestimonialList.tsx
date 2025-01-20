import { useEffect, useRef } from 'react';
import Masonry from 'react-masonry-css';
import { TestimonialCard, type Testimonial } from "@/components/TestimonialCard";
import { useInView } from '@/hooks/useInView';

interface TestimonialListProps {
  testimonials: Testimonial[];
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
}

export const TestimonialList = ({ 
  testimonials,
  hasNextPage,
  fetchNextPage,
  onTagClick,
  selectedTag
}: TestimonialListProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreRef);

  useEffect(() => {
    if (isInView && hasNextPage && fetchNextPage) {
      console.log('Loading more testimonials...');
      fetchNextPage();
    }
  }, [isInView, hasNextPage, fetchNextPage]);

  const breakpointColumns = {
    default: 2,
    1100: 2,
    700: 1
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-6 w-auto"
        columnClassName="pl-6 bg-clip-padding"
      >
        {testimonials
          .filter((t: Testimonial) => t.approved)
          .map((testimonial: Testimonial) => (
            <div key={testimonial.id} className="mb-6">
              <TestimonialCard 
                testimonial={testimonial} 
                onTagClick={onTagClick}
                selectedTag={selectedTag}
              />
            </div>
          ))}
      </Masonry>
      <div ref={loadMoreRef} className="h-10" />
    </>
  );
};