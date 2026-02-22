import { ActivePost, ArchivedPost } from './post';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class Storage {
    private posts: ActivePost[] = [];
    private archive: ArchivedPost[] = [];
    private postsPath: string | null = null;
    private archivePath: string | null = null;

    /**
     * Initialise storage (load JSON files) and automatically create files if needed.
     */
    constructor(postsFilePath: string, archiveFilePath: string) {
        this.postsPath = postsFilePath;
        this.archivePath = archiveFilePath;

        const dataDir = dirname(postsFilePath);
        try {
            mkdirSync(dataDir, { recursive: true });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
                throw error;
            }
        }

        try {
            const data = readFileSync(postsFilePath, 'utf-8');
            this.posts = JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                this.posts = [];
                this.savePosts();
            } else {
                throw error;
            }
        }

        try {
            const data = readFileSync(archiveFilePath, 'utf-8');
            this.archive = JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                this.archive = [];
                this.saveArchive();
            } else {
                throw error;
            }
        }
    }

    close(): void {
        if (this.postsPath && this.posts.length > 0) {
            this.savePosts();
        }
        if (this.archivePath && this.archive.length > 0) {
            this.saveArchive();
        }
        this.postsPath = null;
        this.archivePath = null;
        this.posts = [];
        this.archive = [];
    }

    /**
     * Reload posts from disk so that any external changes to posts.json are picked up.
     */
    reloadPosts(): void {
        this.assertInitialised();
        try {
            const data = readFileSync(this.postsPath!, 'utf-8');
            this.posts = JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                this.posts = [];
            } else {
                throw error;
            }
        }
    }

    /**
     * Get all posts that are ready to be posted:
     * - Either have no scheduledPostTime, or scheduledPostTime (UTC) has passed.
     * All timestamps are UTC (ISO 8601, e.g. 2025-02-21T15:00:00.000Z).
     * Reloads posts from disk first so external additions to posts.json are detected.
     */
    getUnpostedPosts(): ActivePost[] {
        this.reloadPosts();

        const now = new Date();

        return this.posts
            .filter(post => {
                if (!post.scheduledPostTime) {
                    return true;
                }
                const scheduledPostTime = new Date(post.scheduledPostTime);
                return scheduledPostTime <= now;
            })
            .sort((a, b) => {
                if (!a.scheduledPostTime && !b.scheduledPostTime) {
                    return a.createdAt.localeCompare(b.createdAt);
                }
                if (!a.scheduledPostTime) return -1;
                if (!b.scheduledPostTime) return 1;
                const aUtcIso = a.scheduledPostTime;
                const bUtcIso = b.scheduledPostTime;
                if (aUtcIso !== bUtcIso) return aUtcIso.localeCompare(bUtcIso);
                return a.createdAt.localeCompare(b.createdAt);
            });
    }

    /**
     * Mark multiple posts as posted: removes them from active in one pass and appends all to archive, then saves once.
     * @throws if any archived post's id is not found in active posts
     */
    markPostsAsPosted(archivedPosts: ArchivedPost[]): void {
        if (archivedPosts.length === 0) {
            return;
        }
        this.assertInitialised();

        const idsToRemove = archivedPosts.map(post => post.id);
        const beforeCount = this.posts.length;
        this.posts = this.posts.filter(post => !idsToRemove.includes(post.id));
        const removedCount = beforeCount - this.posts.length;

        if (removedCount !== archivedPosts.length) {
            throw new Error('One or more posts not found');
        }

        this.archive.push(...archivedPosts);
        this.savePosts();
        this.saveArchive();
    }

    private assertInitialised(): void {
        if (!this.postsPath) {
            throw new Error('Storage not initialised.');
        }
    }

    private savePosts(): void {
        this.assertInitialised();
        writeFileSync(this.postsPath!, JSON.stringify(this.posts, null, 2), 'utf-8');
    }

    private saveArchive(): void {
        this.assertInitialised();
        writeFileSync(this.archivePath!, JSON.stringify(this.archive, null, 2), 'utf-8');
    }
}
