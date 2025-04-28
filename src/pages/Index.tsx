
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
import { generateMockPipelineData } from '@/lib/mock-pipeline-data';
import { History, GitBranch } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repository, setRepository] = useState<string | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleAnalyzeRepository = async (repoUrl: string) => {
    setIsLoading(true);
    setRepository(repoUrl);
    
    try {
      // In a real app, this would be an API call to your backend
      // For now, we're using mock data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const pipelineData = generateMockPipelineData(repoUrl);
      setPipelines(pipelineData);
      
      // Add to history if not already present
      if (!history.includes(repoUrl)) {
        setHistory(prev => [repoUrl, ...prev.slice(0, 4)]);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Found ${pipelineData.length} pipelines for the repository`,
      });
    } catch (error) {
      console.error("Error analyzing repository:", error);
      toast({
        title: "Error",
        description: "Failed to analyze repository pipelines",
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

  const handleHistoryItemClick = (url: string) => {
    handleAnalyzeRepository(url);
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
                    {history.map((url, index) => (
                      <Button 
                        key={`${url}-${index}`}
                        variant="outline" 
                        size="sm"
                        onClick={() => handleHistoryItemClick(url)}
                        className="text-xs"
                      >
                        {(() => {
                          try {
                            const parsed = new URL(url);
                            const pathParts = parsed.pathname.split('/').filter(Boolean);
                            if (pathParts.length >= 2) {
                              return `${pathParts[0]}/${pathParts[1]}`;
                            }
                            return url;
                          } catch {
                            return url;
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
        <DialogContent className="max-w-2xl" showCloseButton={false}>
          <PipelineDetails pipeline={selectedPipeline} onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
