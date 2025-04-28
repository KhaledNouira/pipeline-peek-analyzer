
import { type Pipeline } from "@/components/PipelineCard";

// A function to fetch or generate mock pipeline data
export const generateMockPipelineData = async (repoUrl: string): Promise<Pipeline[]> => {
  try {
    // Try to fetch real data from GitLab API
    return await fetchGitLabPipelines(repoUrl);
  } catch (error) {
    // If API fails, fall back to mock data
    console.error("Error fetching GitLab pipelines:", error);
    return generateFallbackData(repoUrl);
  }
};

// Function to fetch real pipeline data from GitLab API
async function fetchGitLabPipelines(repoUrl: string): Promise<Pipeline[]> {
  // Extract project path from URL
  const projectPath = extractProjectPathFromUrl(repoUrl);
  if (!projectPath) {
    throw new Error("Invalid GitLab repository URL");
  }

  // Encode the project path for API
  const encodedProjectPath = encodeURIComponent(projectPath);
  
  // GitLab API URL for pipelines
  // Note: This would typically need an access token for private repositories
  const apiUrl = `https://git.vermeg.com/api/v4/projects/${encodedProjectPath}/pipelines?per_page=10`;

  // You would need a token for authentication with most GitLab instances
  // const headers = { 'PRIVATE-TOKEN': 'your_access_token' };
  
  // For this simulation, we'll throw an error since we can't actually access the API
  throw new Error("GitLab API access requires authentication token");
  
  // If you had a token, you would make the actual API request:
  /*
  const response = await fetch(apiUrl, { headers });
  if (!response.ok) {
    throw new Error(`GitLab API returned ${response.status}: ${await response.text()}`);
  }
  
  const pipelines = await response.json();
  
  // Filter out skipped pipelines and take only the last 5
  const filteredPipelines = pipelines
    .filter(p => p.status !== 'skipped')
    .slice(0, 5);
    
  // We would need additional API calls to get details for each pipeline
  return Promise.all(filteredPipelines.map(async pipeline => {
    // Get pipeline details, commits, etc.
    return transformGitLabPipelineToOurFormat(pipeline);
  }));
  */
}

// Helper function to extract project path from GitLab URL
function extractProjectPathFromUrl(url: string): string | null {
  try {
    const gitlabUrl = new URL(url);
    // Remove leading and trailing slashes, then get the path
    const pathParts = gitlabUrl.pathname.replace(/^\/|\/$/g, '').split('/');
    
    // For example: Palmyra-Group/Palmyra-IntegrationTests/automatictests/automatictest-core/bigdatatest
    if (pathParts.length >= 2) {
      return pathParts.join('/').replace(/\.git$/, '');
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
}

// Fallback function to generate realistic mock data for the specific GitLab repositories
function generateFallbackData(repoUrl: string): Pipeline[] {
  // Extract repo name for use in mock data
  let repoName = "repository";
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    repoName = pathParts[pathParts.length - 1].replace('.git', '');
  } catch (e) {
    console.error("Error parsing URL:", e);
  }
  
  const isBigDataWeb = repoName.toLowerCase().includes('bigdataweb');

  // GitLab-specific authors with proper names for these projects
  const authors = [
    { name: "Mohammed Trabelsi", email: "mtrabelsi@vermeg.com" },
    { name: "Sarah Ben Salem", email: "sbensalem@vermeg.com" },
    { name: "Ahmed Khalid", email: "akhalid@vermeg.com" },
    { name: "Leila Gharbi", email: "lgharbi@vermeg.com" },
    { name: "Omar Belkhodja", email: "obelkhodja@vermeg.com" }
  ];

  // GitLab-specific commit messages for these repositories
  const commitMessages = isBigDataWeb ? [
    `fix(web): resolve memory leak in data processing module`,
    `feat(dashboard): implement new BigData visualization components`,
    `chore(deps): update third-party dependencies for BigDataWeb`,
    `test(api): add integration tests for data endpoints`,
    `refactor(services): improve error handling in pipeline executor`
  ] : [
    `fix(core): resolve issue with test data generation`,
    `feat(test): add new test scenarios for data validation`,
    `chore(deps): update test dependencies`,
    `test(runner): enhance test runner performance`,
    `refactor(framework): improve error handling in test framework`
  ];

  // GitLab-specific stage templates based on repository type
  const stageTemplates = isBigDataWeb ? [
    [
      { name: "Build", status: "success" as const, failureReason: null },
      { name: "Unit Tests", status: "success" as const, failureReason: null },
      { name: "Integration Tests", status: "success" as const, failureReason: null },
      { name: "Deploy", status: "success" as const, failureReason: null }
    ],
    [
      { name: "Build", status: "success" as const, failureReason: null },
      { name: "Unit Tests", status: "error" as const, failureReason: "Test failed in DataProcessorTest.java: Expected result to contain 15 records but found 12" },
      { name: "Integration Tests", status: "pending" as const, failureReason: null },
      { name: "Deploy", status: "pending" as const, failureReason: null }
    ],
    [
      { name: "Lint", status: "success" as const, failureReason: null },
      { name: "Build", status: "success" as const, failureReason: null },
      { name: "Unit Tests", status: "success" as const, failureReason: null },
      { name: "Integration Tests", status: "error" as const, failureReason: "Connection timeout after 30s while connecting to test database" },
      { name: "Deploy", status: "pending" as const, failureReason: null }
    ]
  ] : [
    [
      { name: "Compile", status: "success" as const, failureReason: null },
      { name: "Test Data Generation", status: "success" as const, failureReason: null },
      { name: "Test Execution", status: "success" as const, failureReason: null },
      { name: "Test Report", status: "success" as const, failureReason: null }
    ],
    [
      { name: "Compile", status: "success" as const, failureReason: null },
      { name: "Test Data Generation", status: "error" as const, failureReason: "Failed to generate test data: Invalid schema definition in TestConfig.xml" },
      { name: "Test Execution", status: "skipped" as const, failureReason: null },
      { name: "Test Report", status: "skipped" as const, failureReason: null }
    ],
    [
      { name: "Compile", status: "success" as const, failureReason: null },
      { name: "Test Data Generation", status: "success" as const, failureReason: null },
      { name: "Test Execution", status: "warning" as const, failureReason: "5 tests skipped due to environment configuration" },
      { name: "Test Report", status: "success" as const, failureReason: null }
    ]
  ];

  // Generate realistic pipeline dates - 5 days span with the most recent being today
  const now = new Date();
  
  // Create pipeline data specifically for GitLab-style pipelines
  const allPipelines = Array.from({ length: 10 }).map((_, idx) => {
    const isSkipped = idx === 1 || idx === 3 || idx === 7; 
    
    const status = isSkipped ? 'skipped' as const : (
      idx === 0 ? 'running' as const :
      idx === 2 ? 'error' as const :
      idx === 4 ? 'warning' as const :
      'success' as const
    );
    
    const templateIndex = status === 'error' ? 1 : 
                          status === 'warning' ? 2 :
                          status === 'running' ? 0 :
                          Math.floor(Math.random() * stageTemplates.length);
    
    const stageTemplate = stageTemplates[templateIndex];
    
    // Create realistic date - each pipeline is ~12-24 hours apart
    const daysAgo = Math.floor(idx / 2);
    const hoursOffset = (idx % 2) * 12;
    const startedAt = new Date(now);
    startedAt.setDate(startedAt.getDate() - daysAgo);
    startedAt.setHours(startedAt.getHours() - hoursOffset);
    
    const authorIndex = Math.floor(Math.random() * authors.length);
    const commitMessageIndex = Math.floor(Math.random() * commitMessages.length);
    
    const durationMinutes = stageTemplate.length * 5 + Math.floor(Math.random() * 15);
    const durationSeconds = Math.floor(Math.random() * 60);
    
    let duration = '';
    if (durationMinutes > 0) {
      duration += `${durationMinutes}m `;
    }
    duration += `${durationSeconds}s`;
    
    // Generate realistic commit hash (40 characters for GitLab)
    const commitHash = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');

    // GitLab-style pipeline number (incremental from a high base)
    const pipelineNumber = 1250 - idx;
    
    // GitLab-specific pipeline URL format
    const pipelineUrl = `${repoUrl.replace('.git', '')}/-/pipelines/${pipelineNumber}`;

    return {
      id: `${repoName}-pipeline-${pipelineNumber}`,
      name: `${repoName} #${pipelineNumber}`,
      status,
      commit: {
        id: commitHash,
        message: commitMessages[commitMessageIndex],
        author: authors[authorIndex].name,
        email: authors[authorIndex].email
      },
      startedAt: startedAt.toISOString(),
      duration,
      stages: stageTemplate,
      url: pipelineUrl
    };
  });

  // Filter out skipped pipelines and return only the last 5 non-skipped ones
  return allPipelines
    .filter(pipeline => pipeline.status !== 'skipped')
    .slice(0, 5);
}
