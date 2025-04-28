
import { type Pipeline } from "@/components/PipelineCard";

// A function to generate mock pipeline data for demonstration
export const generateMockPipelineData = (repoUrl: string): Pipeline[] => {
  // Extract repo name for use in mock data
  let repoName = "repository";
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      repoName = pathParts[1];
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }

  // Real authors with proper names and roles
  const authors = [
    { name: "Mohammed Ali", email: "mali@vermeg.com" },
    { name: "Sarah Johnson", email: "sjohnson@vermeg.com" },
    { name: "Ahmed Khalid", email: "akhalid@vermeg.com" },
    { name: "Leila Ben Salah", email: "lbensalah@vermeg.com" },
    { name: "Omar Trabelsi", email: "otrabelsi@vermeg.com" }
  ];

  // More realistic commit messages
  const commitMessages = [
    `fix(core): resolve memory leak in data processing module`,
    `feat(ui): implement new dashboard components`,
    `chore(deps): update third-party dependencies`,
    `test(api): add integration tests for auth endpoints`,
    `refactor(services): improve error handling in pipeline executor`,
    `docs(readme): update deployment instructions`,
    `fix(security): address vulnerability in authentication flow`
  ];

  // Template for stages with realistic steps
  const stageTemplates = [
    [
      { name: "Preparation", status: "success", failureReason: null },
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "success", failureReason: null },
      { name: "Deploy", status: "success", failureReason: null }
    ],
    [
      { name: "Preparation", status: "success", failureReason: null },
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "error", failureReason: "3 tests failed in AuthService.spec.ts: Expected token validation to return true" },
      { name: "Deploy", status: "pending", failureReason: null }
    ],
    [
      { name: "Lint", status: "success", failureReason: null },
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "success", failureReason: null },
      { name: "Integration Tests", status: "error", failureReason: "Connection timeout after 30s while connecting to database" },
      { name: "Security Scan", status: "pending", failureReason: null },
      { name: "Deploy", status: "pending", failureReason: null }
    ],
    [
      { name: "Preparation", status: "success", failureReason: null },
      { name: "Build", status: "error", failureReason: "Webpack build failed: Cannot find module './components/Dashboard'" },
      { name: "Tests", status: "skipped", failureReason: null },
      { name: "Deploy", status: "skipped", failureReason: null }
    ],
    [
      { name: "Lint", status: "warning", failureReason: "ESLint found 12 warnings in src/services/" },
      { name: "Build", status: "success", failureReason: null },
      { name: "Unit Tests", status: "success", failureReason: null },
      { name: "Deploy", status: "running", failureReason: null }
    ]
  ] as Array<Array<{name: string, status: 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped', failureReason: string | null}>>;

  // Generate the last 5 pipeline runs (not including skipped ones)
  const now = new Date();
  
  // Create 7 pipelines initially so we can filter out skipped ones later
  const allPipelines = Array.from({ length: 7 }).map((_, idx) => {
    // Determine if this pipeline should be marked as skipped (we'll filter these out later)
    const isSkipped = idx === 1 || idx === 3; // Mark the 2nd and 4th pipelines as skipped
    
    // For non-skipped pipelines, assign a realistic status
    const status = isSkipped ? 'skipped' : (
      idx === 0 ? 'running' :
      idx === 2 ? 'error' :
      idx === 4 ? 'warning' :
      'success'
    ) as 'success' | 'error' | 'warning' | 'running' | 'pending' | 'skipped';
    
    // Get a template based on status
    const templateIndex = status === 'error' ? 1 : 
                          status === 'warning' ? 4 :
                          status === 'running' ? 4 :
                          Math.floor(Math.random() * 3); // random among other templates
    
    const stageTemplate = stageTemplates[templateIndex];
    
    // Select author and commit info
    const authorIndex = Math.floor(Math.random() * authors.length);
    const commitMessageIndex = Math.floor(Math.random() * commitMessages.length);
    
    // Create realistic timestamps - each pipeline is ~2-8 hours apart
    const hoursAgo = idx * 2 + Math.floor(Math.random() * 6); // 2-8 hours between pipelines
    const startedAt = new Date(now);
    startedAt.setHours(startedAt.getHours() - hoursAgo);
    
    // Realistic duration based on stages
    const durationMinutes = stageTemplate.length * 3 + Math.floor(Math.random() * 10);
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

    // Realistic pipeline number - increment for each new run
    const pipelineNumber = 1000 - idx;

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
      url: `${repoUrl}/pipelines/${pipelineNumber}`
    };
  });

  // Filter out skipped pipelines and return only the last 5
  return allPipelines
    .filter(pipeline => pipeline.status !== 'skipped')
    .slice(0, 5);
};
