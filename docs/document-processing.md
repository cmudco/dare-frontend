# Document processing in DARE

DARE turns uploaded documents into searchable text. The processing mode applies to documents; other file types keep their existing handling.

## Basic and Advanced

**Basic** extracts text with lightweight format-specific readers. Choose it when straightforward text extraction is sufficient.

**Advanced** uses Docling for supported document formats to retain richer structure such as sections, tables, and figures. DARE adds separate vision-model calls to describe relevant figures and transcribe scanned pages. These calls can incur charges through your active wallet. Scanned documents may require approval of a page limit before transcription continues.

[Docling](https://docling-project.github.io/docling/) is an open-source document conversion toolkit. DARE integrates a subset of its capabilities; the upstream documentation is not a list of features available in DARE.

## Choose a vision model

The upload screen lets you choose the vision model used for scanned pages and figures. That choice saves your upload preference. Available models depend on your active wallet.

The **Reprocess document** dialog lets you choose a vision model for that run without changing your upload preference. This selection applies to full Advanced reprocessing as well as failed-image retries. Basic processing does not use a vision model. For scanned pages requiring approval, review the model and page limit in the approval dialog before continuing.

## Retry failed image descriptions

Open the document’s reprocessing action. If image descriptions failed, choose a vision model and select **Retry failed image descriptions**. This retries failed figures while preserving successful descriptions and the current processing mode. For example, if 23 of 50 image descriptions failed, the successful 27 are retained.

Changing models may help with provider or model failures, but it cannot guarantee that every image succeeds. If failures persist, inspect the document’s processing error before retrying again.

## Reprocess the whole document

Choose Basic or Advanced and select **Reprocess document** to parse the stored original again. This rebuilds embeddings; the existing search index remains available until a replacement is ready. Full reprocessing is different from retrying only failed image descriptions.
