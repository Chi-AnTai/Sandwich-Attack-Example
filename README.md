# Sandwich Attack example

To complete the task, you should

1. npm install
2. Paste your Alchemy key in hardhat.config.ts.
3. Go to test/sandwich.ts.
4. Look into the victim tx, figure out how much USDC the victim should receive without sandwich attack.
5. Calculate the victim tx's slippage tolerance based on previous answer.
6. Calculate how much ETH can you frontrun the victim tx.
7. Paste your answer as frontrunAmount and run the command below

```shell
FORK=true npx hardhat test test/sandwich.ts
```
