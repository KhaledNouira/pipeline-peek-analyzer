
import { fetchGitLabPipelines, type PipelineExportData } from "./gitlab-api";
import { type Pipeline } from "@/components/PipelineCard";

// Function to load all pipelines for a repository
export const loadPipelines = async (
  repoUrl: string,
  token: string,
  dateFrom?: Date | null,
  dateTo?: Date | null
): Promise<Pipeline[]> => {
  try {
    return await fetchGitLabPipelines(repoUrl, token, dateFrom, dateTo);
  } catch (error) {
    console.error("Error loading pipelines:", error);
    throw error;
  }
};

// Function to get unique Palmyra versions from pipelines
export const getUniquePalmyraVersions = (pipelines: Pipeline[]): string[] => {
  const versions = new Set<string>();
  
  pipelines.forEach(pipeline => {
    if (pipeline.palmyraVersion) {
      versions.add(pipeline.palmyraVersion);
    }
  });
  
  return Array.from(versions).sort();
};

// Function to count executions by Palmyra version
export const countExecutionsByVersion = (pipelines: Pipeline[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  pipelines.forEach(pipeline => {
    const version = pipeline.palmyraVersion || "Unknown";
    counts[version] = (counts[version] || 0) + 1;
  });
  
  return counts;
};

// Function to analyze failure reasons
export const analyzeFailures = (pipelines: Pipeline[]): Record<string, number> => {
  const failureReasons: Record<string, number> = {};
  
  pipelines
    .filter(p => p.status === 'error')
    .forEach(pipeline => {
      const reason = pipeline.failureDetails || "Unknown error";
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });
  
  return failureReasons;
};
