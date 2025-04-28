
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { GitBranch } from 'lucide-react';

interface RepositoryFormProps {
  onSubmit: (repoUrl: string) => void;
  isLoading: boolean;
}

const RepositoryForm: React.FC<RepositoryFormProps> = ({ onSubmit, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }
    
    // Updated validation pattern to include git.vermeg.com
    const validUrlPattern = /^https:\/\/(git\.vermeg\.com|github\.com|gitlab\.com|bitbucket\.org)\/[\w-]+\/[\w.-]+\/?.*$/i;
    
    if (!validUrlPattern.test(repoUrl)) {
      toast({
        title: "Invalid Repository URL",
        description: "Please enter a valid repository URL from git.vermeg.com, GitHub, GitLab, or Bitbucket",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(repoUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="repo-url">Repository URL</Label>
        <div className="flex space-x-2">
          <Input
            id="repo-url"
            placeholder="https://git.vermeg.com/organisation/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
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
        Enter the URL of a repository from git.vermeg.com, GitHub, GitLab, or Bitbucket to analyze its pipelines
      </div>
    </form>
  );
};

export default RepositoryForm;
