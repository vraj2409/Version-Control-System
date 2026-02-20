const fs = require('fs').promises;
const path = require('path');

async function initRepo() {
  const repoPath = path.resolve(process.cwd(),'.myvcs');
  const commotPath = path.join(repoPath,'commits');
  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commotPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, 'config.json'),
      JSON.stringify({Bucket:process.env.BUCKET_NAME })
    );
    console.log('Initialized VCS repository.');
  } catch (error) {
    console.error('Error initializing repository:', error);
  }
}
module.exports = { initRepo };