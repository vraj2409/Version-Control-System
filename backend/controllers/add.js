const fs = require('fs').promises;
const path = require('path');

async function addRepo(filepath) {
  const repoPath = path.resolve(process.cwd(), '.myvcs');
  const stagingPath = path.join(repoPath, 'staging');
  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const filename = path.basename(filepath);
    await fs.copyFile(filepath, path.join(stagingPath, filename));
    console.log(`File ${filename} added to staging area.`);
  } catch (error) {
    console.error('Error adding file to staging area:', error);
  }
}

module.exports = { addRepo };