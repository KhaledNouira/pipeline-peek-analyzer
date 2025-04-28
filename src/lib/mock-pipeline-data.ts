
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

  const statuses: Array<'success' | 'error' | 'warning' | 'running' | 'pending'> = [
    'success', 'success', 'success', 'error', 'warning', 'running', 'pending'
  ];
  
  const stageTemplates = [
    [
      { name: "Build", status: "success" },
      { name: "Test", status: "success" },
      { name: "Deploy", status: "success" }
    ],
    [
      { name: "Build", status: "success" },
      { name: "Test", status: "error" },
      { name: "Deploy", status: "pending" }
    ],
    [
      { name: "Lint", status: "success" },
      { name: "Build", status: "success" },
      { name: "Unit Tests", status: "success" },
      { name: "E2E Tests", status: "warning" },
      { name: "Deploy", status: "pending" }
    ],
    [
      { name: "Build", status: "success" },
      { name: "Test", status: "success" },
      { name: "Security Scan", status: "running" },
      { name: "Deploy", status: "pending" }
    ]
  ] as Array<Array<{name: string, status: 'success' | 'error' | 'warning' | 'running' | 'pending'}>>;

  const commitMessages = [
    `feat: add new dashboard features`,
    `fix: resolve login issue`,
    `chore: update dependencies`,
    `refactor: improve pipeline performance`,
    `docs: update README.md`,
    `test: add unit tests for auth module`,
    `style: format code according to style guide`,
    `ci: update CI configuration`
  ];

  const authors = [
    "John Doe",
    "Jane Smith",
    "Alex Johnson",
    "Taylor Williams",
    "Sam Brown"
  ];

  // Generate 5-7 random pipelines
  const pipelineCount = Math.floor(Math.random() * 3) + 5;
  const now = new Date();
  
  return Array.from({ length: pipelineCount }).map((_, idx) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stageTemplate = stageTemplates[Math.floor(Math.random() * stageTemplates.length)];
    const commitMessage = commitMessages[Math.floor(Math.random() * commitMessages.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    // Random duration between 1-30 minutes
    const durationMinutes = Math.floor(Math.random() * 30) + 1;
    const durationSeconds = Math.floor(Math.random() * 60);
    
    // Random start time within the last 3 days
    const startedAt = new Date(now);
    startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 4320)); // Random time in the last 3 days
    
    // Format duration
    let duration = '';
    if (durationMinutes > 0) {
      duration += `${durationMinutes}m `;
    }
    duration += `${durationSeconds}s`;
    
    // Generate mock commit hash
    const commitHash = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      id: `${repoName}-pipeline-${idx + 1}`,
      name: `${repoName} #${idx + 1}`,
      status,
      commit: {
        id: commitHash,
        message: commitMessage,
        author
      },
      startedAt: startedAt.toISOString(),
      duration,
      stages: stageTemplate,
      url: `${repoUrl}/actions/runs/${100 + idx}`
    };
  });
};
