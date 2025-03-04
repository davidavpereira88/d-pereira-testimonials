import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export const EmbedCodeGenerator = () => {
  const { toast } = useToast();
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const embedCode = `<!-- Testimonials Embed Code -->
<div id="testimonials-container" style="width: 100%; min-height: 500px;">
  <iframe 
    id="testimonials-embed"
    src="${window.location.origin}/embed${selectedTag !== "all" ? `?tag=${selectedTag}` : ""}"
    style="width: 1px; min-width: 100%; border: none; height: 500px;"
    title="Testimonials embed"
  ></iframe>
</div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = "${window.location.origin}/embed-resizer.js";
    script.async = true;
    script.onload = function() {
      var iframe = document.getElementById('testimonials-embed');
      if (iframe && typeof window.iFrameResize === 'function') {
        window.iFrameResize({}, '#testimonials-embed');
      }
    };
    document.body.appendChild(script);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="tag-select" className="text-sm font-medium">
          Select Tag
        </label>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags?.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="embed-code" className="text-sm font-medium">
          Embed Code
        </label>
        <div className="flex gap-2">
          <Textarea
            id="embed-code"
            value={embedCode}
            readOnly
            className="font-mono text-sm min-h-[200px]"
          />
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};