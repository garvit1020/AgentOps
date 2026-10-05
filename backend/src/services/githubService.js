import crypto from 'crypto';
import { Octokit } from '@octokit/rest';

export const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || !secret) {
    return false;
  }
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (err) {
    return false;
  }
};

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export const getRepoInfo = async (repoUrl) => {
  try {
    // Parse owner and repo from URL (e.g. https://github.com/owner/repo)
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');
    
    const owner = match[1];
    const repo = match[2].replace('.git', '');
    
    const response = await octokit.rest.repos.get({
      owner,
      repo
    });
    
    return response.data;
  } catch (error) {
    console.error('[GitHubService] getRepoInfo error:', error.message);
    throw error;
  }
};

export const getLatestCommit = async (owner, repo, branch) => {
  try {
    const response = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: branch
    });
    
    return response.data;
  } catch (error) {
    console.error('[GitHubService] getLatestCommit error:', error.message);
    throw error;
  }
};
