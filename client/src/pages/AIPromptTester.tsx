import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, TestTube, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function AIPromptTester() {
  const { user, loading: authLoading } = useAuth();
  const [promptTemplate, setPromptTemplate] = useState("");
  const [systemMessage, setSystemMessage] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const { data: currentConfig, isLoading: configLoading } = 
    trpc.aiReview.getPromptConfig.useQuery(
      { name: "review_summary" },
      { enabled: !!user }
    );

  const { data: therapists } = trpc.therapists.list.useQuery();

  const testMutation = trpc.aiReview.testPrompt.useMutation({
    onSuccess: (data) => {
      setTestResult(data.summary);
      toast.success("Test completed successfully!");
    },
    onError: (error: any) => {
      toast.error(`Test failed: ${error.message}`);
    },
  });

  const saveMutation = trpc.aiReview.updatePromptConfig.useMutation({
    onSuccess: (data) => {
      toast.success(`Prompt configuration ${data.action}!`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const clearCacheMutation = trpc.aiReview.clearCache.useMutation({
    onSuccess: () => {
      toast.success("Cache cleared successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to clear cache: ${error.message}`);
    },
  });

  // Load current config when available
  if (currentConfig && !promptTemplate && !configLoading) {
    setPromptTemplate(currentConfig.promptTemplate);
    setSystemMessage(currentConfig.systemMessage || "");
  }

  const handleTest = () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist to test with");
      return;
    }
    if (!promptTemplate.trim()) {
      toast.error("Please enter a prompt template");
      return;
    }

    testMutation.mutate({
      promptTemplate,
      systemMessage: systemMessage || undefined,
      therapistId: selectedTherapist,
    });
  };

  const handleSave = () => {
    if (!promptTemplate.trim()) {
      toast.error("Please enter a prompt template");
      return;
    }

    saveMutation.mutate({
      name: "review_summary",
      description: "AI-generated summary of therapist reviews",
      promptTemplate,
      systemMessage: systemMessage || undefined,
    });
  };

  const handleClearCache = () => {
    if (!selectedTherapist) {
      toast.error("Please select a therapist");
      return;
    }

    clearCacheMutation.mutate({ therapistId: selectedTherapist });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You must be logged in to access this page.</p>
            <Button asChild>
              <Link href="/">
                <a>Go Home</a>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="text-2xl font-bold text-primary">Leverage Therapy</a>
            </Link>
            <nav className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name || user.email}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <a>Back to Home</a>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-12 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Prompt Tester</h1>
          <p className="text-muted-foreground">
            Test and configure AI prompts for review summaries. Use <code className="bg-muted px-2 py-1 rounded">{"{{reviews}}"}</code> as a placeholder for review data.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="system-message">System Message (Optional)</Label>
                <Textarea
                  id="system-message"
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={3}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sets the AI's role and behavior
                </p>
              </div>

              <div>
                <Label htmlFor="prompt-template">Prompt Template</Label>
                <Textarea
                  id="prompt-template"
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  placeholder="Enter your prompt template here..."
                  rows={12}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use <code className="bg-muted px-1 rounded">{"{{reviews}}"}</code> where review data should be inserted
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle>Test Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="therapist-select">Select Therapist for Testing</Label>
                <Select
                  value={selectedTherapist?.toString() || ""}
                  onValueChange={(value) => setSelectedTherapist(parseInt(value))}
                >
                  <SelectTrigger id="therapist-select" className="mt-1">
                    <SelectValue placeholder="Choose a therapist..." />
                  </SelectTrigger>
                  <SelectContent>
                    {therapists?.map((t: any) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name} ({t.credentials})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  The prompt will be tested with this therapist's reviews
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTest}
                  disabled={testMutation.isPending || !selectedTherapist}
                >
                  {testMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Prompt
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearCache}
                  disabled={clearCacheMutation.isPending || !selectedTherapist}
                >
                  {clearCacheMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Cache
                    </>
                  )}
                </Button>
              </div>

              {testResult && (
                <div className="mt-4">
                  <Label>Test Result</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tips & Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="space-y-2 text-sm">
                <li>Use <code className="bg-muted px-1 rounded">{"{{reviews}}"}</code> as a placeholder - it will be replaced with actual review data</li>
                <li>Be specific about what you want the AI to analyze (strengths, concerns, suitability)</li>
                <li>Keep the tone professional and empathetic for mental health contexts</li>
                <li>Test with different therapists to ensure the prompt works across various review styles</li>
                <li>Clear the cache after updating the prompt to see immediate results</li>
                <li>Summaries are cached for 7 days to reduce API costs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
