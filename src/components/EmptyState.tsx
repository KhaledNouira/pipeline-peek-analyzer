
import React from 'react';
import { GitBranch } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No Pipeline Data", 
  description = "Enter a repository URL to analyze its pipelines" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <GitBranch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md">{description}</p>
    </div>
  );
};

export default EmptyState;
