---
title: Knowledge graphs
summary: See the people, places and organizations in a set of documents, and fix how their names are matched.
icon: Network
group: start
order: 4.5
---

# Knowledge graphs

### Names and their spellings

A knowledge graph shows the names found in the documents you chose. Spellings of one name become
one entry: "Fredk Brown", "Fred'k Brown" and "Frederick Brown" are one person, and so are "Richard
Heyward" and "Richard Hayward". Open a name to see its spellings and the passages it appears in.

DARE scores every pair of names. Short forms ("Benj", "Wm", "Jno"), surnames that sound alike, a
shared document and the same people named nearby all raise the score. A clear match merges, an
unclear one waits for the model check that runs with a relationships read, and the rest stay apart.
A bare "Brown" or "Paul" is only merged when one person with that name appears in its documents.

Names are shared by every graph you build over the same documents, so a fix in one graph shows in
the others.

### Re-check names

Graphs built before the current matching rules may still show variants apart or a bare name inside
one person. Open the graph and press **Re-check names** under its title, then confirm.

1. DARE re-scores the names in this graph's documents. This is free and takes up to a minute.
2. Clear matches merge. Names that an older rule joined and that no longer match are separated.
3. When it finishes, the line next to the button says how many names merged, how many were
   separated and how many pairs wait for review.

Running it again changes nothing unless your documents changed. Merges you made and names you
separated with **Separate** are kept.

### Fix a match yourself

Open a name in the graph. Use **Separate** on a spelling that belongs to someone else, or merge two
entries that are the same. DARE remembers your choice and never undoes it.
