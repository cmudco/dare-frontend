---
title: Conversations and models
summary: Start a conversation, choose a model and continue the discussion.
icon: MessageSquare
group: start
order: 3
---

# Conversations and models

### Choose a model and compare results

1. Open [**Conversations**](/conversation) and start a conversation.
2. Select a model from the model control.
3. Send a question whose answer you can check. Use the workshop calculation in [Your first conversation](/help/user-guide/your-first-conversation) if you need an example.
4. For a comparison, start another conversation, choose the second model and send the same question with the same prompt and document selections.
5. Record the two model names and compare the answers, source support and token usage.

Changing the model in an existing conversation retains its earlier discussion. Use separate conversations when you want to compare models from the same starting point. The model list reflects access and configuration; a listed model can still fail if its serving endpoint is unavailable.

### Clone, rename and revisit a conversation

1. In the conversation list, open the three-dot **Conversation actions** menu for a conversation you own.
2. Choose **Clone** to open a separate copy. Review the copied messages, model, prompt and documents before continuing.
3. Use **Rename** to distinguish the copies, such as `Workshop — full text` and `Workshop — retrieved passages`. Press **Enter** to save the name.
4. Send a follow-up in each copy and compare the results. Changes in one copy do not continue the other conversation.

Use **Favorite** in the same menu to mark a conversation you want to find again. **Delete conversation** opens a confirmation; check the selected conversation before confirming it.

The response controls also offer **Regenerate AI response**. It makes another model request and can add usage. Clone first when you want to keep separate comparison paths.

### Adjust response settings

Open the gear icon in the conversation toolbar to view **Configuration**.

| Control | What it changes | What to check |
| --- | --- | --- |
| **Temperature** | Variation in generated responses. The control is hidden for models that do not support it. | Keep it unchanged while comparing prompts. A lower value does not guarantee a correct answer. |
| **Max Tokens** | The configured output-token limit for a response. | If a response ends early, check this limit and any error before repeating the request. |
| **History Limit** | The number of previous messages included in context. | If a follow-up loses earlier details, check the limit and the context available to the model. |
| **Effort** | How long the model reasons before answering, from **Faster** to **Smarter**. It appears only for models that support it, with the levels that model offers. | Higher effort can take longer and use more tokens. Keep it unchanged while comparing prompts. |

A token is a piece of text, not a fixed number of words. Prompts, included history, document text and generated responses can all contribute to token usage. Model context limits still apply when you select more history or documents. The History Limit setting does not delete older messages from the saved conversation.

Tool settings such as Web Search appear only when supported and enabled. Asking a model to search in a message does not enable a disabled tool.

### Watch the context window

The ring next to the send button shows how much of the model's context window the last reply used. Open it to see the prompt and reply tokens, the space left, and token totals for the last reply and the whole conversation.

When you add or remove files, the ring previews the change for your next message. It turns red once a reply uses 80% of the window. When that happens, start a new conversation or pick a model with a larger window before adding more history or documents.

### Stop a reply or recover from a dropped connection

Choose **Stop generating** to end a reply early. The text written so far stays in the conversation.

If the connection drops, the message box says the chat is offline and reconnects on its own. A message you were typing stays in the box, and a reply that was running continues once the connection is back.

### Ask several models at once

Where your deployment enables it, the model picker offers **Panel** and **Council** alongside **Single**:

- **Panel**: several models answer at once, and a chairman model combines their answers.
- **Council**: the panel answers, the models review each other's drafts, then the chairman decides.

Choose at least two models. Each model makes its own request, so a panel or council costs more than a single model. Open the panel above the combined answer to read each model's draft.

### Reference another conversation

1. Open the speech-bubble context control in the conversation toolbar. Its panel is titled **Conversation Context**.
2. Choose **Reference Conversations**, search for the conversation and select it.
3. Open the gear inside that panel to review **History Limit per Conversation**.
4. Close the panel and ask a question that names the discussion you want to use.

This adds selected conversation history to the context. It does not merge the conversations or include every message regardless of the history setting. Clear a reference when you no longer need it. **Conversation Summaries** is a separate tab for selecting saved summaries.

### Export a conversation

Open the conversation and choose **Export**. The control downloads the conversation as a PDF. Open the downloaded file and check it before sharing it.

Next: [Add document context](/help/user-guide/sources-and-documents) or [select reusable instructions](/help/user-guide/reusable-prompts).
