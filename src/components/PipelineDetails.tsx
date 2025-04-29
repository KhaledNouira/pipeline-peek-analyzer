
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PipelineStatus from './PipelineStatus';
import { type Pipeline } from './PipelineCard';
import { Clock, GitCommit, GitBranch, User, Calendar, Mail, AlertTriangle, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PipelineDetailsProps {
  pipeline: Pipeline | null;
  onClose: () => void;
}

interface JiraTicket {
  id: string;
  status: 'todo' | 'in-progress' | 'resolved';
}

const PipelineDetails: React.FC<PipelineDetailsProps> = ({ pipeline, onClose }) => {
  const { toast } = useToast();
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [jiraStatus, setJiraStatus] = useState<'todo' | 'in-progress' | 'resolved'>('todo');
  const [linkedJiraTicket, setLinkedJiraTicket] = useState<JiraTicket | null>(null);

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

  const handleLinkJiraTicket = () => {
    if (!jiraTicketId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Jira ticket ID",
        variant: "destructive"
      });
      return;
    }

    setLinkedJiraTicket({
      id: jiraTicketId,
      status: jiraStatus
    });

    toast({
      title: "Success",
      description: `Linked Jira ticket ${jiraTicketId} with status ${jiraStatus}`,
    });
  };

  const handleUpdateJiraStatus = (newStatus: 'todo' | 'in-progress' | 'resolved') => {
    if (!linkedJiraTicket) return;

    setLinkedJiraTicket({
      ...linkedJiraTicket,
      status: newStatus
    });

    toast({
      title: "Success",
      description: `Updated Jira ticket ${linkedJiraTicket.id} status to ${newStatus}`,
    });
  };

  const showJiraSection = pipeline.status === 'error' || linkedJiraTicket;

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
      <CardContent className="space-y-6 max-h-[70vh]">
        <ScrollArea className="h-[calc(70vh-120px)] pr-4">
          <div className="space-y-6">
            {showJiraSection && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Jira Integration</h3>
                <div className="bg-muted p-3 rounded-md">
                  {!linkedJiraTicket ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Link this pipeline to a Jira ticket to track the issue</p>
                      <div className="flex flex-col space-y-2">
                        <Input
                          placeholder="Enter Jira ticket ID (e.g. PROJ-123)"
                          value={jiraTicketId}
                          onChange={(e) => setJiraTicketId(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex space-x-2">
                          <Select 
                            value={jiraStatus}
                            onValueChange={(value) => setJiraStatus(value as 'todo' | 'in-progress' | 'resolved')}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={handleLinkJiraTicket} className="whitespace-nowrap">
                            <Link className="h-4 w-4 mr-2" />
                            Link Ticket
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">{linkedJiraTicket.id}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          linkedJiraTicket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          linkedJiraTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {linkedJiraTicket.status === 'resolved' ? 'Resolved' :
                           linkedJiraTicket.status === 'in-progress' ? 'In Progress' : 'To Do'}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateJiraStatus('todo')}>Mark as To Do</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateJiraStatus('in-progress')}>Mark as In Progress</Button>
                        <Button variant="outline" size="sm" onClick={() => handleUpdateJiraStatus('resolved')}>Mark as Resolved</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-2">Commit Information</h3>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-start">
                  <GitBranch className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                  <div className="space-y-1 w-full">
                    <p className="font-medium break-all">{pipeline.commit.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4 text-sm">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground mr-1">Author:</span>
                        <span>{pipeline.commit.author}</span>
                      </div>
                      {pipeline.commit.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-muted-foreground mr-1">Email:</span>
                          <span>{pipeline.commit.email}</span>
                        </div>
                      )}
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
                  {pipeline.palmyraVersion && (
                    <div className="flex items-center">
                      <GitBranch className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Palmyra Version</p>
                        <p className="font-medium">{pipeline.palmyraVersion}</p>
                      </div>
                    </div>
                  )}
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
                        pipeline.status === 'skipped' ? 'text-muted-foreground' :
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
                          stage.status === 'error' ||
                          stage.status === 'warning'
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
                          stage.status === 'skipped' ? 'bg-muted' :
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
                        
                        {stage.failureReason && stage.status === 'error' && (
                          <div className="mt-2 p-2 bg-pipeline-error/10 rounded-sm border-l-2 border-pipeline-error">
                            <div className="flex items-start">
                              <AlertTriangle className="h-4 w-4 mr-2 text-pipeline-error mt-0.5" />
                              <p className="text-xs">{stage.failureReason}</p>
                            </div>
                          </div>
                        )}
                        
                        {stage.failureReason && stage.status === 'warning' && (
                          <div className="mt-2 p-2 bg-pipeline-warning/10 rounded-sm border-l-2 border-pipeline-warning">
                            <div className="flex items-start">
                              <AlertTriangle className="h-4 w-4 mr-2 text-pipeline-warning mt-0.5" />
                              <p className="text-xs">{stage.failureReason}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PipelineDetails;
