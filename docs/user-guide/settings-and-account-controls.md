---
title: Settings and account controls
summary: Adjust appearance and preferences, and review account data controls.
icon: Settings
group: manage
order: 9
---

# Settings and account controls

### Change preferences

Open [**Settings**](/settings). The **Account** tab contains profile, avatar and password controls. [**Appearance**](/settings/appearance) controls the theme. Under [**Chat**](/settings/chat), choose **Message Font Size** and check the preview. That changes how messages are displayed; model, token and history settings remain in the conversation's **Configuration** panel.

**Background models** controls models used for background tasks. **Memory** and **Integrations** appear when enabled; they have their own Settings tabs. Personal provider keys appear under Chat when your deployment enables them.

Use **Set as Default Prompt** when saving a prompt in **Templates → Prompts** if you want it assigned to new conversations. It is separate from the font-size preference.

The [conversation context panel](/help/user-guide/conversations-and-models) can show **Memory** when the feature is enabled for your account. Use **See what it remembers** to inspect saved memory before relying on it in later conversations. Memory and selected conversation references are separate controls.

### Export, restore or delete data

In [**Settings → Data**](/settings/data), open **Your data and account**:

- **Export everything** downloads an archive of conversations, prompts, workflows, memories and profile data. It **does not include uploaded files, their embeddings or run history**. Keep your original source files separately.
- **Export memories only** downloads the memory data rather than the full account archive.
- **Restore from export** accepts a DARE `.zip` archive. Choose the file, review the dialog and select **Restore**. Restore **adds** records to the account; it does not replace existing data or restore the excluded files. Check the restored items and any skipped-item notices.
- **Delete account** starts a permanent deletion process. Read the items listed in the dialog and export anything you need before completing its confirmation. An export is not a complete backup of uploaded documents.

A conversation's **Export** control downloads that conversation as PDF, rather than an account archive. A workflow's **Export JSON** downloads its definition. Choose the export that matches what you need to keep.

### Create an account and sign in

To create an account, open [**Create Account**](/register). If you have an access code, enter it in **Access Code (optional)**. On a deployment that reviews signups, leave the code blank to ask an administrator for approval. You then see **Account awaiting approval**, and you can sign in once an administrator approves you and you have verified your email. Use **Resend** there if the verification email does not arrive. To get a single-use code instead, use [**Request access**](/request-access): give your name, email and an optional reason, then register with the code you receive if you are approved.

If your deployment offers single sign-on, the login page shows a **Sign in with** button for your organization. That account's password is managed by your organization, not by DARE.

Use [**Forgot Password?**](/forgot-password) on the login page for a forgotten password. Changing a password or profile does not approve an account, change permissions or allocate wallet credit.
