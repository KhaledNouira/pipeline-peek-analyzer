
import { type Pipeline } from "@/components/PipelineCard";

// A function to generate mock pipeline data for demonstration
export const generateMockPipelineData = (repoUrl: string): Pipeline[] => {
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

  // Real authors with proper names for the specific projects
  const authors = [
    { name: "Mohammed Trabelsi", email: "mtrabelsi@vermeg.com" },
    { name: "Sarah Ben Salem", email: "sbensalem@vermeg.com" },
    { name: "Ahmed Khalid", email: "akhalid@vermeg.com" },
    { name: "Leila Gharbi", email: "lgharbi@vermeg.com" },
    { name: "Omar Belkhodja", email: "obelkhodja@vermeg.com" }
  ];

  // More realistic commit messages for these specific repositories
  const commitMessages = isBigDataWeb ? [
    `fix(web): resolve memory leak in data processing module`,
    `feat(dashboard): implement new BigData visualization components`,
    `chore(deps): update third-party dependencies for BigDataWeb`,
    `test(api): add integration tests for data endpoints`,
    `refactor(services): improve error handling in pipeline executor`,
    `docs(readme): update BigDataWeb deployment instructions`,
    `fix(security): address vulnerability in data access flow`
  ] : [
    `fix(core): resolve issue with test data generation`,
    `feat(test): add new test scenarios for data validation`,
    `chore(deps): update test dependencies`,
    `test(runner): enhance test runner performance`,
    `refactor(framework): improve error handling in test framework`,
    `docs(readme): update test execution instructions`,
    `fix(security): patch dependency vulnerability in test framework`
  ];

  // Template for stages with realistic steps based on repository
  const stageTemplates = isBigDataWeb ? [
    [
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "success", failureReason: null },
      { name: "Integration Tests", status: "success", failureReason: null },
      { name: "Deploy", status: "success", failureReason: null }
    ],
    [
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "error", failureReason: "Test failed in DataProcessorTest.java: Expected result to contain 15 records but found 12" },
      { name: "Integration Tests", status: "pending", failureReason: null },
      { name: "Deploy", status: "pending", failureReason: null }
    ],
    [
      { name: "Lint", status: "success", failureReason: null },
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "success", failureReason: null },
      { name: "Integration Tests", status: "error", failureReason: "Connection timeout after 30s while connecting to test database" },
      { name: "Deploy", status: "pending", failureReason: null }
    ]
  ] : [
    [
      { name: "Compile", status: "success", failureReason: null },
      { name: "Test Data Generation", status: "success", failureReason: null },
      { name: "Test Execution", status: "success", failureReason: null },
      { name: "Test Report", status: "success", failureReason: null }
    ],
    [
      { name: "Compile", status: "success", failureReason: null },
      { name: "Test Data Generation", status: "error", failureReason: "Failed to generate test data: Invalid schema definition in TestConfig.xml" },
      { name: "Test Execution", status: "skipped", failureReason: null },
      { name: "Test Report", status: "skipped", failureReason: null }
    ],
    [
      { name: "Compile", status: "success", failureReason: null },
      { name: "Test Data Generation", status: "success", failureReason: null },
      { name: "Test Execution", status: "warning", failureReason: "5 tests skipped due to environment configuration" },
      { name: "Test Report", status: "success", failureReason: null }
    ]
  ] as Array<Array<{name: string, status: 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped', failureReason: string | null}>>;

  // Generate realistic pipeline dates - 5 days span with the most recent being today
  const now = new Date();
  
  // Create more than 5 pipelines initially so we can filter out skipped ones later
  const allPipelines = Array.from({ length: 10 }).map((_, idx) => {
    // Determine if this pipeline should be marked as skipped
    const isSkipped = idx === 1 || idx === 3 || idx === 7; 
    
    // For non-skipped pipelines, assign a realistic status
    const status = isSkipped ? 'skipped' : (
      idx === 0 ? 'running' :
      idx === 2 ? 'error' :
      idx === 4 ? 'warning' :
      'success'
    ) as 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped';
    
    // Get a template based on status
    const templateIndex = status === 'error' ? 1 : 
                          status === 'warning' ? 2 :
                          status === 'running' ? 0 :
                          Math.floor(Math.random() * stageTemplates.length);
    
    const stageTemplate = stageTemplates[templateIndex];
    
    // Create realistic date - each pipeline is ~12-24 hours apart
    const daysAgo = Math.floor(idx / 2);  // Every 2 pipelines is roughly 1 day
    const hoursOffset = (idx % 2) * 12;   // Either morning or evening
    const startedAt = new Date(now);
    startedAt.setDate(startedAt.getDate() - daysAgo);
    startedAt.setHours(startedAt.getHours() - hoursOffset);
    
    // Select author and commit info
    const authorIndex = Math.floor(Math.random() * authors.length);
    const commitMessageIndex = Math.floor(Math.random() * commitMessages.length);
    
    // Realistic duration based on stages - complex pipelines take longer
    const durationMinutes = stageTemplate.length * 5 + Math.floor(Math.random() * 15);
    const durationSeconds = Math.floor(Math.random() * 60);
    
    // Format duration
    let duration = '';
    if (durationMinutes > 0) {
      duration += `${durationMinutes}m `;
    }
    duration += `${durationSeconds}s`;
    
    // Generate realistic commit hash
    const commitHash = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');

    // Realistic pipeline number - start from a high number and decrement
    const pipelineNumber = 1250 - idx;

    return {
      id: `${repoName}-pipeline-${pipelineNumber}`,
      name: `${repoName} #${pipelineNumber}`,
      status: isSkipped ? 'skipped' : status,
      commit: {
        id: commitHash,
        message: commitMessages[commitMessageIndex],
        author: authors[authorIndex].name,
        email: authors[authorIndex].email
      },
      startedAt: startedAt.toISOString(),
      duration,
      stages: stageTemplate,
      url: `${repoUrl.replace('.git', '')}/pipelines/${pipelineNumber}`
    };
  });

  // Filter out skipped pipelines and return only the last 5 non-skipped ones
  return allPipelines
    .filter(pipeline => pipeline.status !== 'skipped')
    .slice(0, 5);
};
