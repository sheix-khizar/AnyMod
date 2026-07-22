import { CircuitBreaker } from '../src/circuit-breaker';

async function main() {
  const breaker = new CircuitBreaker('test', { failureThreshold: 5, cooldownMs: 30_000 });
  let calls = 0;

  for (let i = 0; i < 5; i++) {
    try {
      await breaker.execute(async () => { calls++; throw new Error('fail'); });
    } catch { /* expected */ }
  }

  console.log(breaker.getState()); // 'open'
  console.log(calls); // 5

  try {
    await breaker.execute(async () => { calls++; return 'ok'; });
  } catch (e) {
    console.log((e as Error).message.includes('OPEN')); // true
  }
  console.log(calls); // still 5 — the 6th call never ran fn()
}

main().catch(console.error);
