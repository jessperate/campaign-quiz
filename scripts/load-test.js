#!/usr/bin/env node

/**
 * Load testing script for quiz form submissions
 * Simulates multiple concurrent users submitting the quiz
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'https://campaign-quiz.vercel.app';
const NUM_REQUESTS = parseInt(process.env.NUM_REQUESTS || '30', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10', 10); // How many at once

// Sample test data
const generateTestData = (index) => ({
  firstName: `TestUser${index}`,
  lastName: `Load${index}`,
  email: `test${index}@loadtest.com`,
  title: 'Load Test Engineer',
  company: 'AirOps Testing',
  role: 'sales',
  headshotPreview: '',
  answers: {
    q1: 'a',
    q2: 'b',
    q3: 'c',
    q4: 'a',
    q5: 'b',
    q6: 'c',
    q7: 'a',
    q8: 'b',
  },
  wantsDemo: false,
});

function submitQuiz(data) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/submit-quiz', BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const startTime = Date.now();
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          duration,
          success: res.statusCode === 200,
          body: body.substring(0, 100), // First 100 chars
        });
      });
    });

    req.on('error', (error) => {
      reject({ error: error.message, duration: Date.now() - startTime });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject({ error: 'Timeout', duration: 30000 });
    });

    req.write(postData);
    req.end();
  });
}

async function runBatch(batchNum, size) {
  console.log(`\n🚀 Batch ${batchNum}: Submitting ${size} requests...`);
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < size; i++) {
    const index = (batchNum - 1) * CONCURRENCY + i;
    promises.push(submitQuiz(generateTestData(index)));
  }

  const results = await Promise.allSettled(promises);
  const duration = Date.now() - startTime;

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(r => r.status === 'rejected' || !r.value?.success).length;
  const avgDuration = results
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.value.duration, 0) / successful;

  console.log(`✅ Batch ${batchNum} complete in ${duration}ms`);
  console.log(`   Success: ${successful}, Failed: ${failed}`);
  console.log(`   Avg response time: ${Math.round(avgDuration)}ms`);

  return { successful, failed, duration, avgDuration };
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Load Test Configuration`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Total Requests: ${NUM_REQUESTS}`);
  console.log(`Concurrency: ${CONCURRENCY} (${Math.ceil(NUM_REQUESTS / CONCURRENCY)} batches)`);
  console.log(`${'='.repeat(60)}\n`);

  const overallStart = Date.now();
  const numBatches = Math.ceil(NUM_REQUESTS / CONCURRENCY);
  const allResults = [];

  for (let batch = 1; batch <= numBatches; batch++) {
    const batchSize = Math.min(CONCURRENCY, NUM_REQUESTS - (batch - 1) * CONCURRENCY);
    const result = await runBatch(batch, batchSize);
    allResults.push(result);

    // Small delay between batches to avoid overwhelming the server
    if (batch < numBatches) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const totalDuration = Date.now() - overallStart;
  const totalSuccess = allResults.reduce((sum, r) => sum + r.successful, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
  const overallAvgDuration = allResults.reduce((sum, r) => sum + r.avgDuration, 0) / allResults.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📈 Final Results`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Successful: ${totalSuccess}/${NUM_REQUESTS} (${((totalSuccess / NUM_REQUESTS) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${totalFailed}/${NUM_REQUESTS}`);
  console.log(`Avg Response Time: ${Math.round(overallAvgDuration)}ms`);
  console.log(`Throughput: ${(NUM_REQUESTS / (totalDuration / 1000)).toFixed(2)} req/s`);
  console.log(`${'='.repeat(60)}\n`);

  if (totalFailed > 0) {
    console.log(`⚠️  ${totalFailed} requests failed`);
    process.exit(1);
  } else {
    console.log(`✅ All requests successful!`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});
