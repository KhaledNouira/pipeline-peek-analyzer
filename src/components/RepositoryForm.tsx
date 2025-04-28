
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { GitBranch } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepositoryFormProps {
  onSubmit: (repoUrl: string) => void;
  isLoading: boolean;
}

const RepositoryForm: React.FC<RepositoryFormProps> = ({ onSubmit, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  
  const repositoryOptions = [
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/automatictest-core/BigDataWeb.git",
      label: "BigDataWeb"
    },
    {
      value: "https://git.vermeg.com/Palmyra-Group/Palmyra-IntegrationTests/automatictests/automatictest-core/bigdatatest.git",
      label: "bigdatatest"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please select a repository",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(repoUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="repo-url">GitLab Repository</Label>
        <div className="flex space-x-2">
          <Select value={repoUrl} onValueChange={setRepoUrl}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a repository" />
            </SelectTrigger>
            <SelectContent>
              {repositoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing
              </span>
            ) : (
              <span className="flex items-center">
                <GitBranch className="mr-2 h-4 w-4" />
                Analyze
              </span>
            )}
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Select one of the Vermeg GitLab repositories to analyze its pipelines (using simulated GitLab pipeline data)
      </div>
    </form>
  );
};

export default RepositoryForm;
