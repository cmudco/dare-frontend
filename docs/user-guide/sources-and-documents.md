---
title: Sources and documents
summary: Upload documents, choose processing options and use files in a conversation.
icon: Files
group: start
order: 4
---

# Sources and documents

### Upload and check a document

1. Open [**Sources**](/files) and choose **Upload File**.
2. Select a file or drop it into the upload area. For the exercises below, use PDF, Word, plain text or Markdown. JSON, CSV and Excel files are also accepted. The current upload limit is **100 MB per file**; empty, oversized or unsupported files are rejected.
3. Choose **Basic** for text extraction, or **Advanced** for richer document processing. Advanced processing can use a vision model for scanned pages and figures.
4. Review any model, page-limit or cost choices, then choose **Upload files**.
5. Wait for processing to finish. Check the document's status and any error before using it in a conversation.

Check the status badge beside the file name. It shows the current processing stage and disappears when processing succeeds without warnings; there is no separate **Processed** badge in the Sources list. **Failed** includes error details. A transcription badge can mean scanned pages need recognition or approval; inspect the file's actions for **Review transcription** or **Continue transcription** when offered. Review the model, page count and estimate before starting that work. Advanced processing, transcription and retries can consume credit.

### Organize and inspect your files

1. Open the file's three-dot **Actions** menu in **Sources**, then choose **Add Tags** or **Edit Tags**.
2. Choose an existing tag. To make one, enter its name in **New Tag**, choose **Create Tag**, then select it from **Add Tags**.
3. Choose **Save** and check that the label appears in the file's **Tags** column. Creating a tag alone does not attach it to the file.
4. Use **View** in the file's actions to inspect the stored content, especially after processing a table or scanned page.

Deleting a file moves it to **Recently deleted** in the Sources menu. From there you can restore it or choose **Delete permanently**.

You can also assign tags in the upload form. Tags organize files; they do not grant another user access to them. In a conversation, the **Tags**, **Folders** and **Libraries** tabs let you select a collection instead of individual files, where those collections are available.

The upload form's gear opens chunk settings. **Chunk size** is the number of characters per piece; **Overlap** is the number carried into the next piece. Keep the current values for the first exercise. If you change them, test a small upload and check whether the retrieved passages still contain the facts you need.

### Select how the conversation uses the document

Open the folder icon in the conversation toolbar. It contains separate **Embeddings** and **Files** tabs.

| Selection | What the model receives | Use it for |
| --- | --- | --- |
| **Embeddings** | Retrieved passages from the selected documents. | A specific question in a longer document. |
| **Files** | The selected document's full text, subject to model limits. | A short document, an overall summary or a question about structure. |
| Both tabs | Retrieved passages and full document text. | A task that needs both; expect more context and possible extra usage. |

Under **Files**, a note shows whether the model can read the selected files in full and how many tokens they take. If they are too long for the model, pick a model with a larger context window, or select them under **Embeddings** so the conversation searches them instead.

Select the document in the intended tab, then choose **Done**. The selection summary shows what is included. Use **Clear** to remove selections you no longer need.

To change retrieval behavior, open the gear inside the file-selection panel. In **Vector database settings**, review **Retrieval mode**:

- **Fast** uses a direct vector lookup.
- **Thorough** adds query analysis, hybrid retrieval and reranking.
- **Autonomous** lets the model make document-search calls across multiple rounds.

These are retrieval choices, separate from **Basic** and **Advanced** upload processing.

| Retrieval control | What it changes |
| --- | --- |
| **Context snippets** | Limits the number of passages retained for context. More passages can increase token usage; they do not necessarily improve the answer. |
| **Similarity threshold** | In **Fast** mode, drops passages below the selected score. A higher threshold can remove useful matches. Setting it to **0** keeps the top passages without the score filter. This control is not shown for the other modes. |

Start with the current values, then change one setting at a time. If a response offers **Show Matched Snippets**, open it and check the passages against your question. The control appears only when snippets were returned. A high score describes a match, not whether the model's claim is correct.

### Try a document exercise

Copy the following into a plain text file named `workshop-note.txt`, then upload it through **Sources**:

```text
Workshop planning note
The workshop is on 18 November 2026.
The venue is Library Room 204.
There are 12 registered participants.
Each participant needs 2 sheets of paper.
The budget has not been set.
```

1. Start a new conversation and select the processed file in **Files**.
2. Send: “Using only workshop-note.txt, give the date, venue and total sheets needed. Quote the lines supporting your answer. If a detail is missing, say it is not stated.”
3. Check the response against the file. It should identify **18 November 2026**, **Library Room 204** and **24 sheets**. The paper total is calculated from two lines; the file does not state that total directly.
4. Ask: “What is the workshop budget?” The file says the budget has not been set. A specific monetary amount would be unsupported.
5. Start another conversation with the same model and question, selecting the file only in **Embeddings**. Compare the passages and answer with the full-text result.

If a passage or fact is missing, check the selected document, processing status and retrieval mode before rewriting the question. Open the original file to verify dates, quotations and numerical claims. A citation in a response is not enough by itself.

### Compare two documents

1. Select both processed documents in the conversation's file panel. Check the selection list before sending the question.
2. Name both documents in the request: “Compare the workshop date, venue and participant count in Document A and Document B. Return a table with a separate column for each document, quote the supporting lines and mark missing details as not stated.”
3. Check that the answer includes evidence from **both** files. A search result from one file does not establish what the other says.
4. If one file is missing from the evidence, check its selection and processing status. For short files, compare the result with both selected in **Files**.

Next: [Save the document instructions as a prompt](/help/user-guide/reusable-prompts).
