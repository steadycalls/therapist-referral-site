import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Wand2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIWritingAssistantProps {
  value: string;
  onChange: (value: string) => void;
  purpose?: "therapist_bio" | "blog_post" | "service_description" | "general";
  placeholder?: string;
  label?: string;
  className?: string;
}

export function AIWritingAssistant({
  value,
  onChange,
  purpose = "general",
  placeholder,
  label,
  className,
}: AIWritingAssistantProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rewriteInstructions, setRewriteInstructions] = useState("");
  const [tone, setTone] = useState<
    "professional" | "warm" | "casual" | "academic" | "empathetic"
  >("professional");

  const rewriteMutation = trpc.ai.rewriteText.useMutation({
    onSuccess: (data) => {
      onChange(data.text);
      toast.success("Text rewritten successfully!");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to rewrite: ${error.message}`);
    },
  });

  const improveMutation = trpc.ai.improveContent.useMutation({
    onSuccess: (data) => {
      onChange(data.improvedText);
      toast.success("Content improved!", {
        description: data.changes,
      });
    },
    onError: (error) => {
      toast.error(`Failed to improve: ${error.message}`);
    },
  });

  const handleRewrite = () => {
    if (!value.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    rewriteMutation.mutate({
      text: value,
      purpose,
      instructions: rewriteInstructions || undefined,
      tone,
    });
  };

  const handleImprove = (
    improvementType: "clarity" | "engagement" | "seo" | "compassion" | "professionalism"
  ) => {
    if (!value.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    improveMutation.mutate({
      text: value,
      improvementType,
    });
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] pr-12"
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                title="AI Rewrite"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Rewrite</DialogTitle>
                <DialogDescription>
                  Rewrite your text with AI assistance. Optionally provide specific instructions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="empathetic">Empathetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="instructions">
                    Additional Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    value={rewriteInstructions}
                    onChange={(e) => setRewriteInstructions(e.target.value)}
                    placeholder="E.g., Make it more concise, add more detail about..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={rewriteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRewrite}
                  disabled={rewriteMutation.isPending}
                >
                  {rewriteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Rewrite
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick improvement buttons */}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleImprove("clarity")}
          disabled={improveMutation.isPending || !value.trim()}
        >
          {improveMutation.isPending ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Wand2 className="mr-1 h-3 w-3" />
          )}
          Improve Clarity
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleImprove("engagement")}
          disabled={improveMutation.isPending || !value.trim()}
        >
          {improveMutation.isPending ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Wand2 className="mr-1 h-3 w-3" />
          )}
          More Engaging
        </Button>
        
        {purpose === "therapist_bio" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleImprove("compassion")}
            disabled={improveMutation.isPending || !value.trim()}
          >
            {improveMutation.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="mr-1 h-3 w-3" />
            )}
            More Compassionate
          </Button>
        )}
        
        {purpose === "blog_post" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleImprove("seo")}
            disabled={improveMutation.isPending || !value.trim()}
          >
            {improveMutation.isPending ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="mr-1 h-3 w-3" />
            )}
            Optimize SEO
          </Button>
        )}
      </div>
    </div>
  );
}
