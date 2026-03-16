const fs = require('fs').promises;
const path = require('path');

async function initRepo(repoId) {
  const repoPath = path.resolve(process.cwd(), '.myvcs');
  const commitsPath = path.join(repoPath, 'commits');
  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, 'config.json'),
      JSON.stringify({
        Bucket: process.env.BUCKET_NAME,
        repoId: repoId || ""
      })
    );
    console.log('Initialized VCS repository.');
    if (repoId) {
      console.log(`Linked to repository: ${repoId}`);
    }
  } catch (error) {
    console.error('Error initializing repository:', error);
  }
}

module.exports = { initRepo };