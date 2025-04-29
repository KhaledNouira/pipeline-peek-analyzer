
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { fetchGitLabPipelines, exportPipelinesToExcel } from "@/lib/gitlab-api";
import RepositoryForm from "@/components/RepositoryForm";
import { useToast } from "@/hooks/use-toast";
import { FileText, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PipelineCard from "@/components/PipelineCard";
import PipelineSkeleton from "@/components/PipelineSkeleton";
import EmptyState from "@/components/EmptyState";
import { type Pipeline } from "@/components/PipelineCard";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  const handleFetchPipelines = async (repoUrl: string, token: string, dateFrom?: Date | null, dateTo?: Date | null) => {
    setIsLoading(true);

    try {
      const data = await fetchGitLabPipelines(repoUrl, token, dateFrom, dateTo);
      setPipelines(data);

      // Store repository info in localStorage for future use
      const repositories = getStoredRepositories();
      const existingRepoIndex = repositories.findIndex(
        (repo: { url: string }) => repo.url === repoUrl
      );

      if (existingRepoIndex >= 0) {
        repositories[existingRepoIndex] = { url: repoUrl, token };
      } else {
        repositories.push({ url: repoUrl, token });
      }

      localStorage.setItem("repositories", JSON.stringify(repositories));
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch pipelines",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (pipelines.length === 0) {
      toast({
        title: "No data to export",
        description: "Please fetch some pipelines first.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportPipelinesToExcel(pipelines);
      toast({
        title: "Export Successful",
        description: "Pipelines data has been exported to Excel.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export pipelines data.",
        variant: "destructive",
      });
    }
  };

  const getStoredRepositories = () => {
    const storedRepos = localStorage.getItem("repositories");
    return storedRepos ? JSON.parse(storedRepos) : [];
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Pipeline Monitor</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExportToExcel}
            disabled={pipelines.length === 0 || isLoading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline" asChild>
            <Link to="/analysis" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Advanced Analysis
            </Link>
          </Button>
        </div>
      </div>

      <RepositoryForm onSubmit={handleFetchPipelines} isLoading={isLoading} />

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <PipelineSkeleton key={i} />
            ))}
          </div>
        ) : pipelines.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {pipelines.map((pipeline) => (
              <PipelineCard key={pipeline.id} pipeline={pipeline} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No pipelines found"
            description="Enter a repository URL and token to fetch pipelines."
          />
        )}
      </div>
    </div>
  );
};

export default Index;
