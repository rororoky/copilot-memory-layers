/**
 * Every factual claim on this site traces back to one of these official pages.
 * `verifiedOn` records the date the page was read, not the date it was published.
 */

export interface Source {
  id: string;
  title: string;
  publisher: 'Visual Studio Code' | 'GitHub';
  url: string;
  verifiedOn: string;
  /** Short description of what this page is used for here. */
  usedFor: string;
}

export const sources: Source[] = [
  {
    id: 'vscode-memory',
    title: 'Use memory with agents in VS Code',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agents/run/memory',
    verifiedOn: '2026-11-10',
    usedFor:
      'Copilot Memory setup and scopes, local memory files, the three local scopes, and the experimental repository-local store.',
  },
  {
    id: 'gh-copilot-memory',
    title: 'About GitHub Copilot Memory',
    publisher: 'GitHub',
    url: 'https://docs.github.com/en/copilot/concepts/agents/copilot-memory',
    verifiedOn: '2026-11-10',
    usedFor:
      'Repository-level facts versus user-level preferences, citations, voting, retention and expiry, what is never stored, and defaults per plan.',
  },
  {
    id: 'vscode-agents',
    title: 'Understand AI agents',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agents/concepts/agents',
    verifiedOn: '2026-11-10',
    usedFor:
      'Where memory sits in the agent loop, alongside sessions, planning, subagents, and customization.',
  },
  {
    id: 'vscode-overview',
    title: 'Customize agents for your workflow',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agent-customization/overview',
    verifiedOn: '2026-11-10',
    usedFor:
      'Choosing a customization type, scope, verification stages, and how customizations combine.',
  },
  {
    id: 'vscode-instructions',
    title: 'Use custom instructions in VS Code',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agent-customization/custom-instructions',
    verifiedOn: '2026-11-10',
    usedFor:
      'Project instruction files, applyTo patterns, task-relevance descriptions, and the limits of instruction following.',
  },
  {
    id: 'vscode-customization',
    title: 'Understand agent customization',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agents/concepts/customization',
    verifiedOn: '2026-11-10',
    usedFor:
      'The building blocks (instructions, skills, custom agents, tools, hooks, plugins) and model-driven versus deterministic behaviour.',
  },
  {
    id: 'vscode-prompts',
    title: 'Use prompt files in VS Code',
    publisher: 'Visual Studio Code',
    url: 'https://code.visualstudio.com/docs/agent-customization/prompt-files',
    verifiedOn: '2026-11-10',
    usedFor:
      'Prompt files as manually invoked slash commands, their frontmatter, and the Local-harness restriction.',
  },
];

export function getSource(id: string): Source {
  const found = sources.find((source) => source.id === id);
  if (!found) {
    throw new Error(`Unknown source: ${id}`);
  }
  return found;
}

export function sourceIndex(id: string): number {
  const index = sources.findIndex((source) => source.id === id);
  return index === -1 ? 0 : index + 1;
}
