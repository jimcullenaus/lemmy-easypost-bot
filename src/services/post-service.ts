import { BotActions } from 'lemmy-bot/dist/types';
import { Storage } from '../db/storage';
import { fromActivePost } from '../db/post';

export default class PostService {

    constructor(
        private readonly botActions: BotActions,
        private readonly instance: string,
        private readonly storage: Storage
    ) { }

    public async postToLemmy(): Promise<void> {
        const posts = this.storage.getUnpostedPosts();
        const archivedPostsTasks = posts.map(async (post) => {
            const communityResponse = await this.botActions.getCommunity({
                name: post.community
            });
            const createPostResponse = await this.botActions.createPost({
                name: post.title,
                community_id: communityResponse.community_view.community.id,
                url: post.link ?? undefined,
                custom_thumbnail: post.thumbnailLink ?? undefined,
                body: post.body ?? undefined,
                language_id: post.languageId ?? 0,
            });

            const postedAtUtcIso = new Date().toISOString();
            const postUrl = `https://${this.instance}/post/${createPostResponse.post_view.post.id}`;
            console.log(`Posted ${post.title} to ${postUrl}`);
            const createdPost = fromActivePost(post, postedAtUtcIso, postUrl);
            return createdPost;
        });

        const archivedPosts = await Promise.all(archivedPostsTasks);
        this.storage.markPostsAsPosted(archivedPosts);
    }
}
