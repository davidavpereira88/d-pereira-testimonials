import { Card } from "@/components/ui/card";
import { ColorEditor } from "./ColorEditor";
import { BrandingImageUpload } from "./BrandingImageUpload";
import { TextEditor } from "./TextEditor";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: showTagsOnIndex } = useQuery({
    queryKey: ["branding", "show_tags_on_index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branding")
        .select("value")
        .eq("key", "show_tags_on_index")
        .single();

      if (error) throw error;
      return data?.value === "true";
    },
  });

  const updateShowTagsMutation = useMutation({
    mutationFn: async (checked: boolean) => {
      const { error } = await supabase
        .from("branding")
        .update({ value: checked.toString() })
        .eq("key", "show_tags_on_index");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding"] });
      toast({
        title: "Success",
        description: "Display settings updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update display settings",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Colors</h3>
        <Card className="p-6">
          <ColorEditor />
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Display Settings</h3>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-tags"
              checked={showTagsOnIndex}
              onCheckedChange={(checked) => {
                updateShowTagsMutation.mutate(checked as boolean);
              }}
            />
            <Label htmlFor="show-tags">
              Show tags on public testimonials page
            </Label>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Page Content</h3>
        <Card className="p-6">
          <div className="space-y-6">
            <TextEditor
              textKey="header_title"
              label="Header Title"
              description="The main title displayed at the top of your testimonials page."
            />
            <TextEditor
              textKey="header_subtitle"
              label="Header Subtitle"
              description="The subtitle text displayed below the main title."
            />
            <TextEditor
              textKey="footer_text"
              label="Footer Text"
              description="The text displayed in the footer of your site."
            />
            <TextEditor
              textKey="footer_url"
              label="Footer URL"
              description="The URL that the footer text links to."
            />
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Images</h3>
        <Card className="p-6">
          <div className="space-y-6">
            <BrandingImageUpload
              imageKey="profile_picture"
              label="Profile Picture"
              description="This image appears at the top of your testimonials page and as a preview when sharing on social media."
            />
            <BrandingImageUpload
              imageKey="favicon"
              label="Favicon"
              description="This icon appears in browser tabs and bookmarks."
            />
          </div>
        </Card>
      </div>
    </div>
  );
};