---
name: e2e
description: Test a DARE change end to end in the browser as a real user — multi-turn chats across providers, sources, tools and lifecycle edge cases — and check every shown number against the database. Use after any change a user can see, or that changes what a chat sends, stores, bills or displays; when asked to test properly; and as step 2 of the verify skill.
---

# Test a change end to end

## Set up

- Backend on :8000 with uvicorn, frontend on :5173, RQ workers when files or embeddings are
  involved. Restart uvicorn after backend edits unless it runs with `--reload`.
- Before restarting the backend or switching its branch, run `git status` and
  `git branch --show-current` in `../dare-backend`: another session may share the checkout.
- Test in the developer's own signed-in account in the browser and leave the chats there. Write
  messages the way a student would. Never type a real password.
- Use current models: Claude Sonnet or Haiku 5.5, GPT-6.1 Terra or Sol, Gemini 4.x. Use an older
  model only for an edge only it has, such as a 200K window.

## Matrix

Pick every row the change touches. Each row is a real chat of four or more turns, not one
message.

- **Providers:** one chat each on Claude, OpenAI and Gemini. Tokenizers, caching and usage fields
  differ.
- **Sources:** Files and Embeddings in the same chat; add a file mid-chat; remove one; a file too
  long for the model.
- **Tools:** web search, web fetch, code sandbox needing two rounds, artifact create then update,
  PPTX, diagram, image generation (it switches to an image model).
- **Lifecycle:** switch model mid-chat, Stop mid-reply, reload, a failed reply (context overflow),
  a new empty chat.
- **Layout:** artifact panel open (narrow composer), plus mobile width if layout changed.

After each click on a settings toggle, read the toggle states again: rows shift when a hint line
appears, so the next click can land on the wrong switch.

## Check numbers against the database

Anything that shows or bills tokens, cost or counts gets compared with the stored rows after
every turn, from a Django shell in `../dare-backend`:

```python
from conversations.models import Conversation, Message
conv = Conversation.active_objects.filter(user__email=EMAIL).order_by("-updated_at").first()
for m in Message._base_manager.filter(conversation=conv).order_by("id"):
    for r in m.usage_details or []:
        print(m.id, r.get("input_tokens"), r.get("output_tokens"),
              r.get("cached_input_tokens"), r.get("cache_write_input_tokens"), m.cost)
```

Also check:

- Cache reads on turn two onward, in chats with and without files.
- The reply's `context_trace` lists what the prompt carried. `Message.files` mixes Files and
  Embeddings picks, so it does not tell you which files were read in full.
- Failed replies and image replies: what the UI shows when a reply has no token usage.
- Claude server tools (web fetch, web search, code execution): the recorded input equals the
  API's final usage. The final total arrives at the end of the stream, not the start.

## Report

A table: chat, turn, what was checked, UI value, database value, pass or fail. Fix a failure at
its cause, then rerun every row it touches.
