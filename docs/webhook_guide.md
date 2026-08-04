# Developer Webhook Payout Guide

AstroGates supports Webhook integrations to enable automated content delivery or custom order processing when a transaction settles on the Stellar ledger.

## Configured Event Payload

When a payment succeeds, the gateway triggers a POST request to your configured Webhook Payout URL with the following JSON payload:

```json
{
  "event": "astrogates.unlock_success",
  "timestamp": 1783938499000,
  "linkId": "abc1234",
  "title": "Premium Photography Ebook",
  "price": 10,
  "token": "XLM",
  "txHash": "df9d4a15461752293745828b09889c75f0ea3e8e0ed01ecafc9987f0f0d66413",
  "buyer": "GBFD6XFDUOZO5KYYW6NHKI4FPGLGFQOV6R3I2AUAWIBLZNP5LISZXDRG"
}
```

## Security Best Practices

1. **Verify Transaction Hash**: Use the `@stellar/stellar-sdk` or Horizon API to query the `txHash` and verify on-chain that the transaction actually occurred, sent the correct amount, and transferred tokens to your designated creator address.
2. **Idempotency**: Maintain a database of processed `txHash` records. If you receive a webhook with an already-processed hash, ignore it to prevent replay attacks.
3. **Response Status**: Your webhook handler endpoint must return a `200 OK` response within 5 seconds to complete the simulator handshake.
