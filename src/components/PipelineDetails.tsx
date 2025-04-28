
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PipelineStatus from './PipelineStatus';
import { type Pipeline } from './PipelineCard';
import { Clock, GitCommit, Git, User, Calendar, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineDetailsProps {
  pipeline: Pipeline | null;
  onClose: () => void;
}

const PipelineDetails: React.FC<PipelineDetailsProps> = ({ pipeline, onClose }) => {
  if (!pipeline) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{pipeline.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <GitCommit className="mr-1 h-4 w-4" />
              <span>Pipeline {pipeline.id}</span>
            </div>
          </div>
          <PipelineStatus status={pipeline.status} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Commit Information</h3>
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-start">
                <Git className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                <div className="space-y-1 w-full">
                  <p className="font-medium break-all">{pipeline.commit.message}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 text-sm">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Author:</span>
                      <span>{pipeline.commit.author}</span>
                    </div>
                    <div className="flex items-center">
                      <GitCommit className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Commit:</span>
                      <span className="font-mono">{pipeline.commit.id.substring(0, 10)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Timing</h3>
              <div className="bg-muted p-3 rounded-md space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Started at</p>
                    <p className="font-medium">{formatDate(pipeline.startedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{pipeline.duration}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Overview</h3>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className={`text-sm font-medium ${
                      pipeline.status === 'success' ? 'text-pipeline-success' :
                      pipeline.status === 'error' ? 'text-pipeline-error' :
                      pipeline.status === 'warning' ? 'text-pipeline-warning' :
                      pipeline.status === 'running' ? 'text-pipeline-running' :
                      'text-pipeline-pending'
                    }`}>
                      {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Stages</span>
                    <span className="text-sm font-medium">{pipeline.stages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed Stages</span>
                    <span className="text-sm font-medium">
                      {pipeline.stages.filter(stage => 
                        stage.status === 'success' || 
                        stage.status === 'error'
                      ).length} / {pipeline.stages.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Pipeline Stages</h3>
            <div className="relative">
              {pipeline.stages.map((stage, index) => (
                <div key={`${stage.name}-${index}`} className="mb-4">
                  <div className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        stage.status === 'success' ? 'bg-pipeline-success' :
                        stage.status === 'error' ? 'bg-pipeline-error' :
                        stage.status === 'warning' ? 'bg-pipeline-warning' :
                        stage.status === 'running' ? 'bg-pipeline-running' :
                        'bg-pipeline-pending'
                      }`}>
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      {index < pipeline.stages.length - 1 && (
                        <div className="h-10 w-0.5 bg-muted-foreground/20 mt-1"></div>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-md flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{stage.name}</h4>
                        <PipelineStatus status={stage.status} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />
        
        <div className="flex justify-end">
          {pipeline.url && (
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => window.open(pipeline.url, '_blank')}
            >
              View in CI/CD
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineDetails;
