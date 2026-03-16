require('dotenv').config({ 
  path: require('path').resolve(__dirname, '../.env') 
});
const fs = require('fs').promises;
const path = require('path');
const { ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.BUCKET_NAME;

async function pullRepo() {
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

    console.log(`Pulling from bucket: ${S3_BUCKET}`);
    console.log(`Repository: ${repoId}`);

    // FIX — only list objects for THIS repo
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: `repos/${repoId}/commits/`,
    });

    const data = await s3.send(listCommand);
    const objects = data.Contents || [];

    if (objects.length === 0) {
      console.log('No commits found in S3 for this repository.');
      return;
    }

    console.log(`Found ${objects.length} files in S3...`);

    for (const object of objects) {
      const key = object.Key;

      // Extract: repos/{repoId}/commits/{commitId}/{file}
      const parts = key.split('/');
      const commitId = parts[3];
      const fileName = parts[4];

      const commitDir = path.join(commitsPath, commitId);
      await fs.mkdir(commitDir, { recursive: true });

      const getCommand = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      const fileData = await s3.send(getCommand);

      const chunks = [];
      for await (const chunk of fileData.Body) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const filePath = path.join(commitDir, fileName);
      await fs.writeFile(filePath, buffer);
      console.log(`Downloaded: ${commitId}/${fileName}`);
    }

    console.log('✓ All commits pulled from S3 successfully!');
  } catch (err) {
    console.error('Error pulling from S3:', err.message);
  }
}

module.exports = { pullRepo };