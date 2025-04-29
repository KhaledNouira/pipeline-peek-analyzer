
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import RepositoryForm from '@/components/RepositoryForm';
import PipelineCard, { type Pipeline } from '@/components/PipelineCard';
import PipelineDetails from '@/components/PipelineDetails';
import EmptyState from '@/components/EmptyState';
import PipelineSkeleton from '@/components/PipelineSkeleton';
import { fetchGitLabPipelines } from '@/lib/gitlab-api';
import { History, GitBranch } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repository, setRepository] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [history, setHistory] = useState<{url: string, token: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeRepository = async (repoUrl: string, token: string) => {
    setIsLoading(true);
    setRepository(repoUrl);
    setError(null);
    
    try {
      const pipelineData = await fetchGitLabPipelines(repoUrl, token);
      setPipelines(pipelineData);
      
      // Add to history if not already present
      if (!history.some(item => item.url === repoUrl)) {
        setHistory(prev => [{url: repoUrl, token}, ...prev.slice(0, 4)]);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Found ${pipelineData.length} pipelines for the repository`,
      });
    } catch (error) {
      console.error("Error analyzing repository:", error);
      setError(`Failed to fetch pipeline data: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error",
        description: "Failed to analyze repository pipelines. Check your token and try again.",
        variant: "destructive",
      });
      setPipelines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePipelineClick = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setDialogOpen(true);
  };

  const handleHistoryItemClick = (url: string, token: string) => {
    handleAnalyzeRepository(url, token);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <PipelineSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">API Access Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm">
            Make sure your GitLab token has the appropriate permissions to access the API and the repository.
          </p>
        </div>
      );
    }

    if (!repository || pipelines.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <PipelineCard
            key={pipeline.id}
            pipeline={pipeline}
            onClick={handlePipelineClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-6">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <GitBranch className="mr-2 h-6 w-6" />
            Pipeline Peek Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze and visualize CI/CD pipelines across repositories
          </p>
        </div>
      </header>
      
      <main className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <RepositoryForm 
              onSubmit={handleAnalyzeRepository}
              isLoading={isLoading}
            />
          </div>
          
          {history.length > 0 && (
            <div className="w-full md:w-auto">
              <Tabs defaultValue="recent">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="recent" className="flex items-center">
                    <History className="h-4 w-4 mr-1" />
                    Recent
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="recent" className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {history.map((item, index) => (
                      <Button 
                        key={`${item.url}-${index}`}
                        variant="outline" 
                        size="sm"
                        onClick={() => handleHistoryItemClick(item.url, item.token)}
                        className="text-xs"
                      >
                        {(() => {
                          try {
                            const parsed = new URL(item.url);
                            const pathParts = parsed.pathname.split('/').filter(Boolean);
                            if (pathParts.length >= 2) {
                              return pathParts[pathParts.length - 1].replace('.git', '');
                            }
                            return item.url;
                          } catch {
                            return item.url;
                          }
                        })()}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        
        {repository && (
          <div className="border rounded-md p-4 bg-muted/30">
            <h2 className="font-semibold">Current Repository</h2>
            <p className="text-sm break-all">{repository}</p>
          </div>
        )}
        
        <div className="mt-8">
          {renderContent()}
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <PipelineDetails pipeline={selectedPipeline} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
