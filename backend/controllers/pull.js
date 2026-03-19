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
    // ── Read userId + repoId from config ──────────────────────
    let repoId = 'default';
    let userId = 'default';
    try {
      const config = JSON.parse(
        await fs.readFile(path.join(repoPath, 'config.json'), 'utf-8')
      );
      repoId = config.repoId || 'default';
      userId = config.userId || 'default';
    } catch {
      console.log('No config found, using default folder.');
    }

    // ── Prefix: userId/repoId/commits/ ────────────────────────
    const prefix = `${userId}/${repoId}/commits/`;

    console.log(`Pulling from : ${S3_BUCKET}`);
    console.log(`User         : ${userId}`);
    console.log(`Repository   : ${repoId}`);
    console.log(`S3 prefix    : ${prefix}\n`);

    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    });

    const data = await s3.send(listCommand);
    const objects = data.Contents || [];

    if (objects.length === 0) {
      console.log('No commits found in S3 for this repository.');
      return;
    }

    console.log(`Found ${objects.length} files in S3...\n`);

    for (const object of objects) {
      const key = object.Key;

      // key format: userId/repoId/commits/commitId/filename
      // parts[0] = userId
      // parts[1] = repoId
      // parts[2] = "commits"
      // parts[3] = commitId
      // parts[4] = filename
      const parts = key.split('/');
      const commitId = parts[3];
      const fileName = parts[4];

      if (!commitId || !fileName) continue;

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

    console.log('\n✓ All commits pulled from S3 successfully!');
  } catch (err) {
    console.error('Error pulling from S3:', err.message);
  }
}

module.exports = { pullRepo };