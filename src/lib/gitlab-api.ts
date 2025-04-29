
import { type Pipeline } from "@/components/PipelineCard";
import * as XLSX from "xlsx";

export interface PipelineExportData {
  name: string;
  status: string;
  palmyraVersion: string;
  executionCount: number;
  issueDetails: string;
  executionDate: string;
}

// Function to fetch pipeline data from GitLab API
export const fetchGitLabPipelines = async (
  repoUrl: string, 
  token: string,
  dateFrom?: Date | null,
  dateTo?: Date | null
): Promise<Pipeline[]> => {
  // Extract project path from URL
  const projectPath = extractProjectPathFromUrl(repoUrl);
  if (!projectPath) {
    throw new Error("Invalid GitLab repository URL");
  }

  // Encode the project path for API
  const encodedProjectPath = encodeURIComponent(projectPath);
  
  // Build the API URL with date filters if provided
  let apiUrl = `https://git.vermeg.com/api/v4/projects/${encodedProjectPath}/pipelines?per_page=50`;
  
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    apiUrl += `&updated_after=${fromDate.toISOString()}`;
  }
  
  if (dateTo) {
    const toDate = new Date(dateTo);
    // Add one day to include the end date
    toDate.setDate(toDate.getDate() + 1);
    apiUrl += `&updated_before=${toDate.toISOString()}`;
  }
  
  // Set up headers with the provided token
  const headers = { 'PRIVATE-TOKEN': token };
  
  // Make the actual API request
  const response = await fetch(apiUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`GitLab API returned ${response.status}: ${await response.text()}`);
  }
  
  const pipelines = await response.json();
  
  // Filter out skipped pipelines 
  const filteredPipelines = pipelines.filter((p: any) => p.status !== 'skipped');
    
  // Transform GitLab API format to our app's format
  return Promise.all(filteredPipelines.map(async (pipeline: any) => {
    // Get pipeline details including stages
    const pipelineDetailsUrl = `https://git.vermeg.com/api/v4/projects/${encodedProjectPath}/pipelines/${pipeline.id}`;
    const pipelineResponse = await fetch(pipelineDetailsUrl, { headers });
    
    if (!pipelineResponse.ok) {
      throw new Error(`Failed to fetch pipeline details: ${pipelineResponse.status}`);
    }
    
    const pipelineDetails = await pipelineResponse.json();
    
    // Fetch commit details
    const commitUrl = `https://git.vermeg.com/api/v4/projects/${encodedProjectPath}/repository/commits/${pipeline.sha}`;
    const commitResponse = await fetch(commitUrl, { headers });
    
    if (!commitResponse.ok) {
      throw new Error(`Failed to fetch commit details: ${commitResponse.status}`);
    }
    
    const commitDetails = await commitResponse.json();
    
    // Fetch jobs to get stages information
    const jobsUrl = `https://git.vermeg.com/api/v4/projects/${encodedProjectPath}/pipelines/${pipeline.id}/jobs`;
    const jobsResponse = await fetch(jobsUrl, { headers });
    
    if (!jobsResponse.ok) {
      throw new Error(`Failed to fetch pipeline jobs: ${jobsResponse.status}`);
    }
    
    const jobs = await jobsResponse.json();
    
    // Process jobs to extract unique stages and their statuses
    const stagesMap = new Map();
    
    jobs.forEach((job: any) => {
      // If this stage hasn't been processed yet, or if the current job's status should take precedence
      if (!stagesMap.has(job.stage) || shouldUpdateStageStatus(stagesMap.get(job.stage).status, job.status)) {
        stagesMap.set(job.stage, {
          name: job.stage,
          status: mapGitLabStatus(job.status),
          failureReason: job.status === 'failed' ? job.failure_reason || 'Unknown failure' : null
        });
      }
    });
    
    // Calculate duration
    const duration = pipeline.duration 
      ? formatDuration(pipeline.duration) 
      : 'In progress';
    
    // Format the URL to view the pipeline in GitLab
    const pipelineUrl = `${repoUrl.replace('.git', '')}/-/pipelines/${pipeline.id}`;
    
    // Extract Palmyra version - try to find it in commit message or variables
    let palmyraVersion = "Unknown";
    
    // Check if there's a version in commit message (e.g., "Update to Palmyra v5.2.1")
    const versionRegex = /palmyra\s+(?:version|v)?[:\s]*([\d\.]+)/i;
    const commitMessageMatch = commitDetails.message.match(versionRegex);
    if (commitMessageMatch && commitMessageMatch[1]) {
      palmyraVersion = commitMessageMatch[1];
    }
    
    // Construct pipeline object in our app's format
    return {
      id: pipeline.id.toString(),
      name: `${extractRepoName(repoUrl)} #${pipeline.id}`,
      status: mapGitLabStatus(pipeline.status),
      commit: {
        id: commitDetails.id,
        message: commitDetails.message,
        author: commitDetails.author_name,
        email: commitDetails.author_email
      },
      startedAt: pipeline.created_at,
      duration,
      stages: Array.from(stagesMap.values()),
      url: pipelineUrl,
      palmyraVersion,
      failureDetails: stagesMap.get('test')?.failureReason || ""
    };
  }));
};

// Export pipelines data to Excel file
export const exportPipelinesToExcel = (pipelines: Pipeline[]): void => {
  if (pipelines.length === 0) {
    console.error("No data to export");
    return;
  }
  
  // Group pipelines by Palmyra version to count executions
  const versionCounts = new Map<string, number>();
  pipelines.forEach(pipeline => {
    const version = pipeline.palmyraVersion || "Unknown";
    versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
  });
  
  // Prepare data for export
  const exportData: PipelineExportData[] = pipelines.map(pipeline => {
    // Find the first failed stage for issue details
    let issueDetails = "";
    if (pipeline.status === 'error') {
      const failedStage = pipeline.stages.find(stage => stage.status === 'error');
      if (failedStage) {
        issueDetails = failedStage.failureReason || "Unknown error";
      }
    }
    
    return {
      name: pipeline.name,
      status: capitalizeFirstLetter(pipeline.status),
      palmyraVersion: pipeline.palmyraVersion || "Unknown",
      executionCount: versionCounts.get(pipeline.palmyraVersion || "Unknown") || 1,
      issueDetails: issueDetails,
      executionDate: new Date(pipeline.startedAt).toLocaleDateString()
    };
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pipelines");
  
  // Generate Excel file
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `pipeline-report-${today}.xlsx`);
};

// Helper function to extract project path from GitLab URL
function extractProjectPathFromUrl(url: string): string | null {
  try {
    const gitlabUrl = new URL(url);
    // Remove leading and trailing slashes, then get the path
    const pathParts = gitlabUrl.pathname.replace(/^\/|\/$/g, '').split('/');
    
    if (pathParts.length >= 2) {
      return pathParts.join('/').replace(/\.git$/, '');
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
}

// Helper function to extract repository name from URL
function extractRepoName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1].replace('.git', '');
  } catch (e) {
    return "repository";
  }
}

// Helper function to format duration in minutes and seconds
function formatDuration(seconds: number): string {
  if (seconds === null || seconds === undefined) return 'Unknown';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let duration = '';
  if (minutes > 0) {
    duration += `${minutes}m `;
  }
  duration += `${remainingSeconds}s`;
  
  return duration;
}

// Helper function to map GitLab status to our app's status format
function mapGitLabStatus(status: string): 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped' {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'error';
    case 'canceled':
      return 'warning';
    case 'running':
      return 'running';
    case 'pending':
    case 'waiting_for_resource':
    case 'preparing':
    case 'scheduled':
      return 'pending';
    case 'skipped':
      return 'skipped';
    default:
      return 'pending';
  }
}

// Helper function to determine if we should update a stage's status based on job status priority
function shouldUpdateStageStatus(currentStatus: string, newStatus: string): boolean {
  const statusPriority: Record<string, number> = {
    'failed': 5,
    'canceled': 4,
    'running': 3,
    'pending': 2,
    'success': 1,
    'skipped': 0
  };
  
  return (statusPriority[newStatus] || 0) > (statusPriority[currentStatus] || 0);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
