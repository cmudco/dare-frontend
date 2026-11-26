---
title: Workflows
summary: Build, save and test a small workflow before expanding it.
icon: Workflow
group: build
order: 7
---

# Workflows

### Build two connected steps

Prepare two saved prompts first:

- **Extract facts:** “Read the supplied text. Return the date, venue, participant count and sheets per participant. Quote the supporting lines. Mark missing fields as not stated.”
- **Check totals:** “Use the preceding extraction to calculate the sheets needed. Show the multiplication. List any information needed for a budget that is still missing.”

Then:

1. Open [**Workflows**](/workflows) and choose **Create Workflow**.
2. Add **Start** from **Components** if one is not already present. Select it, enter a **Title**, and set **Execution Mode** to **Sequential**.
3. Add a **Step**, connect it after Start, and select it. Set **Prompt** to `Extract facts`, choose an **LLM Model**, and paste the workshop-note text into **Text Input (Optional)**.
4. Add a second **Step** and connect it after the extraction step. Set its **Prompt** to `Check totals`, choose an **LLM Model**, and leave **Pass Previous Step Context** enabled.
5. Review the node connections and required fields. Choose **Save**. Saving requires at least one Step; a successful save opens the edit page.
6. Review models and wallet credit, then choose **Run All**.
7. Inspect each step's result. The first should extract the source facts; the second should calculate **24 sheets** and identify the unset budget.

Keep **Pass Previous Step Context** on for the checking step so it receives the extraction. If you switch it off, supply the input that step needs separately.

### Use documents in a workflow step

Select a Step and use **Files** for full document text or **Embedding** for retrieved passages. These selections belong to that step; do not assume a conversation's document selections carry into the workflow. **Tags** selects files for retrieval by tag, and **Shared Libraries** appears when libraries are available.

For example, select the workshop note under **Files** in the extraction step and remove the pasted Text Input. Keep the checking step connected with **Pass Previous Step Context** on. Run the small example again and check for the same **24-sheet** result before adding more documents.

### Choose execution and inspect failures

**Sequential** runs steps in sequence; use it when a later step needs an earlier result. **Parallel** is a separate Execution Mode for independent processing. Check the two-step sequential example before attempting parallel or batch work.

The edit page provides **Run Next Step** when manual execution is enabled. Use it to inspect intermediate results. **Run Batch** is for repeated runs across inputs; check one small run before submitting a batch.

If a later step has no usable input, inspect the earlier output, connections and **Pass Previous Step Context** setting. A saved workflow can still fail because of missing input, unavailable models or insufficient credit. Repeating the whole run can repeat model usage.

The builder is full screen. Use **Back to Workflows** to return to the list.

### Keep a reusable workflow

Give the workflow a title and description that state its input and expected result. In the workflow list, its actions include **Clone** for a separate version and **Export JSON** for a downloaded definition. JSON export is not a report of the model's answers or a copy of uploaded source files. Check the definition's selected prompts, models and documents before reusing it.

**Sharing** is available only when enabled. Review its recipients and visibility before confirming a share; a local clone or downloaded file does not itself share the workflow through DARE.
