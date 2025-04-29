import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PipelineStatus from './PipelineStatus';
import { GitCommit, Clock, User, Code, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped';
  commit: {
    id: string;
    message: string;
    author: string;
    email?: string;
  };
  startedAt: string;
  duration: string;
  stages: {
    name: string;
    status: 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped';
    failureReason?: string | null;
  }[];
  url?: string;
  palmyraVersion?: string;
  failureDetails?: string;
}

interface PipelineCardProps {
  pipeline: Pipeline;
  onClick?: (pipeline: Pipeline) => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({ pipeline, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(pipeline);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="hover:border-primary/50 transition-all cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{pipeline.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <GitCommit className="mr-1 h-3 w-3" />
              <span className="truncate max-w-[200px]" title={pipeline.commit.id}>
                {pipeline.commit.id.substring(0, 7)}
              </span>
            </div>
          </div>
          <PipelineStatus status={pipeline.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm truncate" title={pipeline.commit.message}>
            <span className="text-muted-foreground mr-1">Commit:</span>
            {pipeline.commit.message}
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center">
              <User className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">Author:</span>
              <span className="truncate">{pipeline.commit.author}</span>
            </div>
            {pipeline.commit.email && (
              <div className="flex items-center">
                <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Email:</span>
                <span className="truncate">{pipeline.commit.email}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">Started:</span>
              <span>{formatDate(pipeline.startedAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground mr-1">Duration:</span>
              <span>{pipeline.duration}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Code className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Stages:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pipeline.stages.map((stage, index) => (
                <div key={`${stage.name}-${index}`} className="flex items-center">
                  {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  <Badge variant={stage.status === 'success' ? 'outline' : 'secondary'} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      stage.status === 'success' ? 'bg-pipeline-success' :
                      stage.status === 'error' ? 'bg-pipeline-error' :
                      stage.status === 'warning' ? 'bg-pipeline-warning' :
                      stage.status === 'running' ? 'bg-pipeline-running animate-pulse' :
                      stage.status === 'skipped' ? 'bg-muted' :
                      'bg-pipeline-pending'
                    }`} />
                    {stage.name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {pipeline.status === 'error' && (
            <div className="mt-2 text-sm">
              <div className="text-pipeline-error font-medium">Failed Reason:</div>
              <div className="bg-pipeline-error/10 p-2 rounded text-xs mt-1">
                {pipeline.stages.find(stage => stage.status === 'error')?.failureReason || 'Unknown error'}
              </div>
            </div>
          )}
          
          {pipeline.url && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(pipeline.url, '_blank');
                }}
              >
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineCard;
