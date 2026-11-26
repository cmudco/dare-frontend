---
title: Agents
summary: Combine a prompt and language model in a reusable agent configuration.
icon: Bot
group: build
order: 6
---

# Agents

### Create an agent template

1. Save a prompt in [**Templates → Prompts**](/templates/prompts) first.
2. Open [**Templates → Agents**](/templates/agents) and choose **Create Agent**.
3. Under **Setup**, enter `Document checker` as the **Name** and describe its task in **Description**.
4. Choose the saved **Prompt** and an available **Model**.
5. Under **Sources & tools**, use **Full-text files** for documents sent in full and **Searched files** for documents searched for passages. Leave both empty if you will select documents for each conversation.
6. Review **Behavior** for response settings, choose **Save agent**, and check that the template appears in the list.

### Apply it to a conversation

1. Open a conversation and use the command-style prompt icon in the toolbar.
2. Open the **Agent Templates** tab and choose the template.
3. Review the model, prompt and file selections before sending a message. Applying a template can change those settings.
4. Ask the workshop-budget question with the workshop note selected.

**Check the result:** the selected template should be identified in the conversation, and its response should follow the document-checking instructions. Saving a template does not run it or guarantee that its selected model is available.

### Use different roles in one conversation

Save the review and revision instructions below as separate prompts in **Templates → Prompts** first. Then try this extract–review–revise sequence:

1. Select the document-checking prompt and ask for three supported facts from the note.
2. Switch to a review prompt that says: “Review the preceding answer against the selected document. List unsupported claims and arithmetic errors. Do not rewrite it yet.” Send a request to perform the review.
3. Switch to a revision prompt that says: “Revise the preceding answer using the review. Keep only claims supported by the selected document.” Send a request to revise it.
4. Check the final answer against the original note.

You are making the requests one at a time. Switching prompts changes the instructions for subsequent requests; it does not launch independent reviewers. Earlier messages remain subject to the conversation's history limit. A second model repeating a claim is not independent evidence for it.

Next: [Build a repeatable workflow](/help/user-guide/workflows) once the manual steps produce results you can check.
