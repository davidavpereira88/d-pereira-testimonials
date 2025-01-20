import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestimonialCard, type Testimonial } from "@/components/TestimonialCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TestimonialForm } from "@/components/TestimonialForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { convertDbTestimonialToTestimonial } from "@/utils/testimonialUtils";

export const TestimonialManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order('date', { ascending: false });

      if (error) throw error;
      return data?.map(convertDbTestimonialToTestimonial) || [];
    },
  });

  const { data: tagNames = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ["admin", "tags", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .order("name");

      if (error) throw error;
      return data?.map(tag => tag.name) || [];
    },
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Testimonial>;
    }) => {
      const { error } = await supabase
        .from("testimonials")
        .update({
          text: data.text,
          rating: data.rating,
          author: data.author,
          tags: data.tags,
          approved: data.approved,
        })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
      setEditingTestimonial(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update testimonial",
      });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      setEditingTestimonial(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete testimonial",
      });
    },
  });

  const handleApprove = (id: string) => {
    const testimonial = testimonials.find((t) => t.id === id);
    if (testimonial) {
      updateTestimonialMutation.mutate({
        id,
        data: { approved: !testimonial.approved },
      });
    }
  };

  const handleUpdateTestimonial = (data: any) => {
    if (editingTestimonial) {
      updateTestimonialMutation.mutate({
        id: editingTestimonial.id,
        data: {
          text: data.text,
          rating: data.rating,
          author: data.author,
          tags: data.tags,
        },
      });
    }
  };

  const handleDeleteTestimonial = () => {
    if (editingTestimonial) {
      deleteTestimonialMutation.mutate(editingTestimonial.id);
    }
  };

  const filteredTestimonials = testimonials.filter((testimonial: Testimonial) => {
    const matchesSearch =
      testimonial.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.author.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag =
      selectedTag === "all" || testimonial.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  if (isLoadingTestimonials || isLoadingTags) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Input
          placeholder="Search by name, email, or testimonial keywords"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {tagNames.map((tagName) => (
              <SelectItem key={tagName} value={tagName}>
                {tagName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredTestimonials.map((testimonial: Testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            isAdmin
            onApprove={handleApprove}
            onEdit={(id) => {
              const testimonial = testimonials.find((t) => t.id === id);
              if (testimonial) {
                setEditingTestimonial(testimonial);
              }
            }}
          />
        ))}
      </div>

      <Dialog
        open={!!editingTestimonial}
        onOpenChange={() => setEditingTestimonial(null)}
      >
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {editingTestimonial && (
            <TestimonialForm
              initialData={editingTestimonial}
              onSubmit={handleUpdateTestimonial}
              onCancel={() => setEditingTestimonial(null)}
              onDelete={handleDeleteTestimonial}
              isAdmin
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};