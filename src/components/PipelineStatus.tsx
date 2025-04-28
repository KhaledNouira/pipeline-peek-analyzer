
import React from 'react';
import { CheckCircle, AlertCircle, Clock, Play, XCircle, SkipForward } from 'lucide-react';
import { cn } from "@/lib/utils";

type StatusType = 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped';

interface PipelineStatusProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PipelineStatus: React.FC<PipelineStatusProps> = ({ 
  status, 
  className,
  size = 'md' 
}) => {
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size];
  
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-pipeline-success',
      text: 'Success',
      bgColor: 'bg-pipeline-success/10',
      animate: false
    },
    error: {
      icon: XCircle,
      color: 'text-pipeline-error',
      text: 'Failed',
      bgColor: 'bg-pipeline-error/10',
      animate: false
    },
    warning: {
      icon: AlertCircle,
      color: 'text-pipeline-warning',
      text: 'Warning',
      bgColor: 'bg-pipeline-warning/10',
      animate: false
    },
    running: {
      icon: Play,
      color: 'text-pipeline-running',
      text: 'Running',
      bgColor: 'bg-pipeline-running/10',
      animate: true
    },
    pending: {
      icon: Clock,
      color: 'text-pipeline-pending',
      text: 'Pending',
      bgColor: 'bg-pipeline-pending/10',
      animate: false
    },
    skipped: {
      icon: SkipForward,
      color: 'text-muted-foreground',
      text: 'Skipped',
      bgColor: 'bg-muted/30',
      animate: false
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-full px-2 py-1",
      config.bgColor,
      className
    )}>
      <StatusIcon 
        size={iconSize} 
        className={cn(
          config.color,
          config.animate && "animate-pulse"
        )} 
      />
      <span className={cn(
        "text-sm font-medium",
        config.color
      )}>
        {config.text}
      </span>
    </div>
  );
};

export default PipelineStatus;
