---
title: Wallets and cost tracking
summary: Review your selected wallet, credit and transaction history.
icon: Wallet
group: manage
order: 8
---

# Wallets and cost tracking

### Read the allowance and usage

The **DARE Wallet** records allocated usage credit. Your deployment administrator sets the allowance and access policy. A displayed balance alone does not establish whether your deployment charges users.

1. Open the wallet control in the header and check the selected wallet.
2. Open [**Cost Tracking**](/billing/) and inspect the transaction history.
3. After one small conversation, find its usage entry. Review the model, input/output tokens and recorded amount.
4. Compare the amount with the balance change. Check for other transactions if the difference includes more than that one request.

### Understand tokens and rates

Input tokens can include the selected prompt, current question, included history and document context. Output tokens are the model's generated response. Follow-up questions can send earlier context again; they are not priced only on the new sentence you typed.

DARE uses the selected model's configured input and output rates to calculate a token-based amount:

```text
amount = (input tokens × input rate per million
        + output tokens × output rate per million) / 1,000,000
```

Where cached-input pricing is configured and reported, that part of the input can use a separate rate. Tool or service calls can also add usage. Check the transaction rather than inferring the amount from response length alone.

For a locally hosted model, a configured token rate is an accounting rate. It does not automatically measure electricity, GPU time or the full operating cost. A zero recorded amount does not establish that hosting the model costs nothing.

### Handle insufficient credit

An allowance is not unlimited access. An insufficient-balance error can prevent a request. Send your deployment administrator the model name, time and error when requesting more credit.

Personal provider keys and external-wallet options have separate billing behavior. If you select your own provider credentials, that provider's usage charges can apply outside the DARE Wallet.
