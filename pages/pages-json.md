# The `pages.json` Manifest

`pages.json` is an optional, manually-maintained content manifest that lives at the root of your `uncompiled` site. It enables a [searchable page index](?q=pages/index.md) without requiring a build step.

## Schema

```json
[
  {
    "title": "My Post Title",
    "path": "pages/my-post.md",
    "date": "2024-03-15",
    "description": "A short summary shown in the index.",
    "tags": ["writing", "meta"]
  }
]
```

| Field | Required | Description |
| ----- | -------- | ----------- |
| `title` | Yes | Display name shown in the index and search results. |
| `path` | Yes | Relative path to the Markdown file, used as the `?q=` value. |
| `date` | No | ISO 8601 date string (`YYYY-MM-DD`). Used for sorting. |
| `description` | No | Short summary shown beneath the title in the index. |
| `tags` | No | Array of strings for filtering. |

## Workflow

1. Write your Markdown file and place it somewhere under your repo.
2. Add an entry to `pages.json` with the path, title, and any metadata.
3. The [page index](?q=pages/index.md) will automatically include it.

## Notes

- `pages.json` is maintained manually — the same way you maintain `config.json`. Keeping it in sync is the explicit tradeoff for avoiding a build step.
- Entries are sorted by `date` descending in the index. Entries without a date appear last.
- The index page's search filters across `title`, `description`, and `tags`.
