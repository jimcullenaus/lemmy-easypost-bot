/**
 * Base fields shared by both active and archived posts.
 * All timestamp fields are UTC in ISO 8601 form (e.g. 2025-02-21T15:00:00.000Z).
 */
interface BasePost {
    id: string;
    title: string;
    community: string;
    link?: string | null;
    thumbnailLink?: string | null;
    body?: string | null;
    languageId?: number | null;
    /** When the post was added to the queue (UTC ISO 8601). */
    createdAt: string;
}

/**
 * Active post waiting to be posted (stored in posts.json).
 */
export interface ActivePost extends BasePost {
    /** When to post (UTC ISO 8601). If null/absent, post as soon as possible. */
    scheduledPostTime?: string | null;
}

/**
 * Archived post that has been posted (stored in archive.json).
 */
export interface ArchivedPost extends BasePost {
    /** When the post was published to Lemmy (UTC ISO 8601). */
    postedAt: string;
    lemmyLink: string;
}

/** @param postedAtUtcIso When the post was published (UTC ISO 8601). */
export function fromActivePost(
    activePost: ActivePost,
    postedAtUtcIso: string,
    lemmyLink: string
): ArchivedPost {
    return {
        id: activePost.id,
        title: activePost.title,
        community: activePost.community,
        link: activePost.link,
        thumbnailLink: activePost.thumbnailLink,
        body: activePost.body,
        languageId: activePost.languageId,
        createdAt: activePost.createdAt,
        postedAt: postedAtUtcIso,
        lemmyLink
    };
}
