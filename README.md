# lemmy-easypost-bot
A bot to make manually posting links from various sites to Lemmy easier

## Contributing

Please use [conventional commits](https://www.conventionalcommits.org/) so releases can be generated automatically.

## Use

This bot relies on input from another source into its `posts.json` file. It takes a JSON array with objects in the following format:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the post (UUID format recommended but not enforced). |
| `title` | string | The title of the post. |
| `community` | string | Target community in the form `<community>@<instance>`. |
| `link` | string (optional) | URL to link in the post. |
| `thumbnailLink` | string (optional) | URL for the post thumbnail image. |
| `body` | string (optional) | The post body/content. |
| `languageId` | number (optional) | Lemmy language ID (e.g. 37 for English). |
| `createdAt` | string | ISO 8601 timestamp when the post was created. e.g. "2026-02-23T12:51Z" or "2026-02-23T22:51+10:00". If no time zone is specified, it assumes the local time of the machine on which it runs. |
| `scheduledPostTime` | string (optional) | ISO 8601 timestamp when the post should be published (can include timezone). |

## Running

Set environment variables or add a `.env` file with the following values:

```env
LOGIN_INSTANCE_NAME='<domain>'
USERNAME='<username>'
PASSWORD='<password>'
```
