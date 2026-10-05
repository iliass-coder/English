# Oxford 3000 data

`oxford-3000.json` is derived from the community transcription at
https://gist.github.com/naiyerasif/95f65ac734b55ecfb4b1f4e2a7c42c25
(downloaded October 5, 2026).

Only records with a non-null `ox3000` level are included. Records with the
same spelling are combined.
This produces 2,979 distinct spellings, rather than exactly 3,000 entries.
This is a community transcription, not a verified official export.

Each entry has exactly `word` and `definition`, matching the original word
file's core format. English definitions are drawn from the community dataset:
https://github.com/ciwga/Oxford3000_Vocab/blob/main/oxford3000_vocabulary_with_collocations_and_definitions_datasets.csv
(downloaded October 5, 2026). The 339 entries absent from that dataset have
short definitions written for this app. Definitions give a common meaning,
not necessarily every sense, and are not presented as official Oxford text.
They are stored locally; displaying a definition needs no dictionary lookup.

## App-specific phrasal verb additions

An additional 192 common phrasal verbs and related multiword verb expressions
were selected for everyday and intermediate practice, bringing the file to
3,171 entries. These include expressions such as `give up`, `find out`,
`put off`, and `look forward to`. The selection also includes prepositional
verbs and related expressions, such as `look after` and `get rid of`.
These are additions for this app, not a claim of official Oxford 3000 membership
or an exhaustive list. Their definitions were written for this app and cover
common meanings. They use the same `word` and `definition` format as the
original entries.

About the official list:
https://www.oxfordlearnersdictionaries.com/about/oxford3000

The page chooses a list with 50% probability, then a word uniformly from that
list. Individual runs need not contain equal counts from both lists. Both lists
must load before selection is enabled. Add and edit operations continue to use
the existing server endpoints targeting `words.json` only.
