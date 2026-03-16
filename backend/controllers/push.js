require('dotenv').config({ 
  path: require('path').resolve(__dirname, '../.env') 
});
const fs = require('fs').promises;
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.BUCKET_NAME;

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), '.myvcs');
  const commitsPath = path.join(repoPath, 'commits');

  try {
    // ── Read repoId from config ──────────────────────────────
    let repoId = "default";
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, 'config.json'), 'utf-8')
      );
      repoId = config.repoId || "default";
    } catch {
      console.log("No config found, using default folder.");
    }

    console.log(`Pushing to bucket: ${S3_BUCKET}`);
    console.log(`Repository: ${repoId}`);

    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      for (const file of files) {
        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);

        // FIX — prefix with repoId so each repo has its own folder
        const key = `repos/${repoId}/commits/${commitDir}/${file}`;

        const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: fileContent,
        });

        await s3.send(command);
        console.log(`Uploaded: ${key}`);
      }
    }
    console.log('✓ All commits pushed to S3 successfully!');
  } catch (err) {
    console.error('Error pushing to S3:', err.message);
  }
}

module.exports = { pushRepo };