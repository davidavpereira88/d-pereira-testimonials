import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { convertDbTestimonialToTestimonial } from "@/utils/testimonialUtils";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestimonialList } from "@/components/testimonials/TestimonialList";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { triggerConfetti } from "@/utils/confetti";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TestimonialForm } from "@/components/TestimonialForm";
import { useBranding } from "@/hooks/useBranding";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TESTIMONIALS_PER_PAGE = 10;

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: branding } = useBranding();
  const showTagsOnIndex = branding?.show_tags_on_index === "true";

  // Fetch tags that have at least one published testimonial
  const { data: tags = [] } = useQuery({
    queryKey: ["tags", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select('tags')
        .eq('approved', true);

      if (error) throw error;

      // Extract unique tags from approved testimonials
      const uniqueTags = new Set<string>();
      data.forEach(testimonial => {
        testimonial.tags?.forEach(tag => {
          if (tag) uniqueTags.add(tag);
        });
      });

      return Array.from(uniqueTags).sort();
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ["testimonials", "public", selectedTag],
    queryFn: async ({ pageParam }) => {
      const from = Number(pageParam) * TESTIMONIALS_PER_PAGE;
      const to = from + TESTIMONIALS_PER_PAGE - 1;

      let query = supabase
        .from("testimonials")
        .select("*")
        .eq('approved', true)
        .range(from, to)
        .order('date', { ascending: false });

      if (selectedTag) {
        query = query.contains('tags', [selectedTag]);
      }

      const { data: testimonials, error } = await query;

      if (error) throw error;
      
      return {
        testimonials: testimonials?.map(convertDbTestimonialToTestimonial) || [],
        nextPage: testimonials?.length === TESTIMONIALS_PER_PAGE ? Number(pageParam) + 1 : undefined
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const submitTestimonialMutation = useMutation({
    mutationFn: async (formData: any) => {
      const testimonialData = {
        author: {
          name: formData.author.name,
          email: formData.author.email,
          social: formData.author.social || null,
          photo: formData.author.photo || null,
        },
        rating: formData.rating,
        text: formData.text,
        tags: formData.tags,
        approved: false,
        date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("testimonials")
        .insert([testimonialData])
        .select()
        .single();

      if (error) throw error;

      return convertDbTestimonialToTestimonial(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setIsFormOpen(false);
      triggerConfetti();
      toast({
        title: "Thank you for your testimonial! 🎉",
        description: "We'll review it and publish it soon.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit testimonial. Please try again.",
      });
    },
  });

  if (error) {
    return <div className="text-center p-4">Error loading testimonials. Please try again later.</div>;
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading testimonials...</div>;
  }

  const allTestimonials = data?.pages.flatMap(page => page.testimonials) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container max-w-5xl px-4 sm:px-6 py-8 flex-grow">
        <PageHeader 
          isFormOpen={isFormOpen}
          setIsFormOpen={setIsFormOpen}
          onSubmitTestimonial={(data) => submitTestimonialMutation.mutate(data)}
        />
        
        {showTagsOnIndex && (
          <div className="mb-8">
            <Select
              value={selectedTag || "all"}
              onValueChange={(value) => setSelectedTag(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <TestimonialList 
          testimonials={allTestimonials}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          onTagClick={(tag) => setSelectedTag(tag)}
          selectedTag={selectedTag}
        />
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <TestimonialForm
            onSubmit={(data) => submitTestimonialMutation.mutate(data)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;