# Load Testing Script

Simulates multiple concurrent users submitting the quiz form to test system load and performance.

## Quick Start

### Test Production (30 concurrent requests)
```bash
cd /Users/jessrosenberg/campaign-quiz
node scripts/load-test.js
```

### Custom Configuration
```bash
# Test with 50 requests, 20 at a time
NUM_REQUESTS=50 CONCURRENCY=20 node scripts/load-test.js

# Test local development
TEST_URL=http://localhost:3000 NUM_REQUESTS=10 node scripts/load-test.js

# Extreme load test (100 requests, 30 at a time)
NUM_REQUESTS=100 CONCURRENCY=30 node scripts/load-test.js
```

## Environment Variables

- `TEST_URL` - Target URL (default: `https://campaign-quiz.vercel.app`)
- `NUM_REQUESTS` - Total number of form submissions (default: `30`)
- `CONCURRENCY` - Number of concurrent requests per batch (default: `10`)

## What It Tests

The script simulates real form submissions by:
1. Generating unique test user data for each submission
2. Submitting POST requests to `/api/submit-quiz`
3. Tracking response times, success/failure rates
4. Measuring throughput (requests per second)

## Output Metrics

- **Success Rate** - Percentage of successful submissions
- **Avg Response Time** - Average API response time in milliseconds
- **Throughput** - Requests processed per second
- **Failures** - Number of failed requests

## Example Output

```
============================================================
📊 Load Test Configuration
============================================================
Target URL: https://campaign-quiz.vercel.app
Total Requests: 30
Concurrency: 10 (3 batches)
============================================================

🚀 Batch 1: Submitting 10 requests...
✅ Batch 1 complete in 2345ms
   Success: 10, Failed: 0
   Avg response time: 1823ms

🚀 Batch 2: Submitting 10 requests...
✅ Batch 2 complete in 2102ms
   Success: 10, Failed: 0
   Avg response time: 1645ms

🚀 Batch 3: Submitting 10 requests...
✅ Batch 3 complete in 1987ms
   Success: 10, Failed: 0
   Avg response time: 1534ms

============================================================
📈 Final Results
============================================================
Total Duration: 7.23s
Successful: 30/30 (100.0%)
Failed: 0/30
Avg Response Time: 1667ms
Throughput: 4.15 req/s
============================================================

✅ All requests successful!
```

## Testing Best Practices

1. **Start Small** - Test with 10 requests first to verify everything works
2. **Gradual Increase** - Incrementally increase load (30 → 50 → 100)
3. **Monitor Resources** - Watch Vercel logs and database connections during tests
4. **Off-Peak Testing** - Run load tests during low-traffic periods
5. **Clean Up** - Consider deleting test submissions after testing

## Cleaning Up Test Data

After load testing, you may want to remove test submissions:

```bash
# Find test user IDs in your database
# Delete entries where email contains '@loadtest.com'
```

## Interpreting Results

- **Response Time < 2s**: Good performance
- **Response Time 2-5s**: Acceptable under load
- **Response Time > 5s**: May need optimization
- **Success Rate < 95%**: Investigate failures
- **Throughput**: Compare against expected traffic patterns

## Troubleshooting

**"Connection timeout" errors**
- Reduce CONCURRENCY value
- Check Vercel function timeout limits

**High failure rate**
- Check API logs in Vercel dashboard
- Verify database connection pool settings
- Check rate limiting configurations

**Slow response times**
- Profile database queries
- Check external API dependencies (stipple, LinkedIn enrichment)
- Consider caching strategies
