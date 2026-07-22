import { withRetry } from '../src/retry';
import { RateLimitError } from '../src/errors';

let attempts = 0;
async function main() {
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) throw new RateLimitError();
    return 'success';
  });
  console.log(result, attempts); // 'success' 3
}

main().catch(console.error);
