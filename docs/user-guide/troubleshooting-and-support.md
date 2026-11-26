---
title: Troubleshooting and support
summary: Resolve model, credit, document and workflow problems.
icon: LifeBuoy
group: manage
order: 10
---

# Troubleshooting and support

| What happened | What to check first |
| --- | --- |
| No model is available | Check the selected wallet and model list. Ask your deployment administrator to confirm model access. |
| The selected model does not reply | Keep the error, model name and time. Your deployment administrator can check the model connection. |
| Insufficient credit | Review the wallet and [Cost Tracking](/billing/), then request help from your deployment administrator. |
| A follow-up loses earlier details | Review **History Limit**, selected references and document selections. |
| A document is missing from the selector | Check upload and processing status in [Sources](/files). |
| Sources or the file selector is missing | Your deployment administrator may have turned off document search. Scanned-page recognition can also be turned off separately. |
| Files are too long for the model | Pick a model with a larger context window, or select the files under **Embeddings** so they are searched. |
| The chat says it is offline | Wait for it to reconnect. Your unsent message stays in the box, and a running reply continues. |
| A reply nearly fills the context window | Start a new conversation or pick a model with a larger window. The ring next to the send button shows the usage. |
| The answer misses a document detail | Check **Embeddings** versus **Files**, retrieved passages and the original document. |
| A quotation or number is wrong | Verify it in the original document. Do not accept a fabricated citation as confirmation. |
| A saved prompt appears to have no effect | Check the selected prompt and version in **Select Prompt**. |
| An agent changes the model or files unexpectedly | Review the template's settings and the selections it applied. |
| A workflow's second step has no context | Check connections, the first result and **Pass Previous Step Context**. |
| A sidebar entry is absent | Ask your deployment administrator whether that feature is enabled and permitted for your account. |

For help, open [**Help**](/help) or contact your deployment administrator. Include the page, action, model if relevant, time, exact error and whether the problem repeats. A screenshot can help; hide passwords, provider keys, invitation codes and verification/reset links.

For connection or signup problems, contact your deployment administrator. Password recovery starts from [Forgot Password?](/forgot-password).
