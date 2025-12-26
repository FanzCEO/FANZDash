import { Router, Request, Response } from 'express';
import { db } from '../db';
import { eq, desc, and, sql, ilike } from 'drizzle-orm';
import { isAuthenticated, requireAgeVerification } from '../middleware/auth';

const router = Router();

// =====================================================
// FORUM CATEGORIES
// =====================================================

// Get all forum categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.query.forumCategories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    // Get last post info for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (cat) => {
        const lastThread = await db.query.forumThreads.findFirst({
          where: eq(forumThreads.categoryId, cat.id),
          orderBy: (threads, { desc }) => [desc(threads.lastReplyAt)],
          with: { author: true },
        });
        return {
          ...cat,
          lastPost: lastThread ? {
            threadId: lastThread.id,
            title: lastThread.title,
            author: lastThread.author?.username,
            createdAt: lastThread.lastReplyAt || lastThread.createdAt,
          } : null,
        };
      })
    );

    res.json({ success: true, categories: categoriesWithStats });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// =====================================================
// FORUM THREADS
// =====================================================

// Get threads (with filtering)
router.get('/threads', async (req: Request, res: Response) => {
  try {
    const { categoryId, search, sort = 'hot', page = 1, limit = 20 } = req.query;

    let orderBy: any = [desc(forumThreads.lastReplyAt)];
    if (sort === 'new') orderBy = [desc(forumThreads.createdAt)];
    if (sort === 'top') orderBy = [desc(forumThreads.likeCount)];
    if (sort === 'hot') orderBy = [desc(forumThreads.viewCount), desc(forumThreads.replyCount)];

    const conditions = [];
    if (categoryId) conditions.push(eq(forumThreads.categoryId, categoryId as string));
    if (search) conditions.push(ilike(forumThreads.title, `%${search}%`));

    const threads = await db.query.forumThreads.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      with: {
        author: {
          columns: { id: true, username: true, profileImageUrl: true },
        },
        category: true,
      },
    });

    // Move pinned threads to top
    const pinned = threads.filter(t => t.isPinned);
    const regular = threads.filter(t => !t.isPinned);

    res.json({ success: true, threads: [...pinned, ...regular] });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch threads' });
  }
});

// Get single thread with posts
router.get('/threads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const thread = await db.query.forumThreads.findFirst({
      where: eq(forumThreads.id, id),
      with: {
        author: {
          columns: { id: true, username: true, profileImageUrl: true },
        },
        category: true,
        posts: {
          orderBy: (posts, { asc }) => [asc(posts.createdAt)],
          with: {
            author: {
              columns: { id: true, username: true, profileImageUrl: true },
            },
          },
        },
      },
    });

    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    // Increment view count
    await db.update(forumThreads)
      .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
      .where(eq(forumThreads.id, id));

    res.json({ success: true, thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch thread' });
  }
});

// Create new thread
router.post('/threads', isAuthenticated, requireAgeVerification, async (req: any, res: Response) => {
  try {
    const { categoryId, title, content, isAnonymous, isNsfw, tags } = req.body;
    const userId = req.user.id;

    // Generate anonymous alias if needed
    const anonymousAlias = isAnonymous ? generateAnonymousAlias() : null;

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const [thread] = await db.insert(forumThreads).values({
      categoryId,
      authorId: userId,
      title,
      slug,
      content,
      contentHtml: content, // In production, render markdown
      isAnonymous,
      anonymousAlias,
      isNsfw,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
    }).returning();

    // Update category stats
    await db.update(forumCategories)
      .set({
        threadCount: sql`${forumCategories.threadCount} + 1`,
        lastPostAt: new Date(),
        lastPostUserId: userId,
      })
      .where(eq(forumCategories.id, categoryId));

    res.json({ success: true, thread });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ success: false, error: 'Failed to create thread' });
  }
});

// Create reply to thread
router.post('/threads/:id/posts', isAuthenticated, requireAgeVerification, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isAnonymous, parentPostId } = req.body;
    const userId = req.user.id;

    const anonymousAlias = isAnonymous ? generateAnonymousAlias() : null;

    const [post] = await db.insert(forumPosts).values({
      threadId: id,
      authorId: userId,
      parentPostId,
      content,
      contentHtml: content,
      isAnonymous,
      anonymousAlias,
    }).returning();

    // Update thread stats
    await db.update(forumThreads)
      .set({
        replyCount: sql`${forumThreads.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyUserId: userId,
      })
      .where(eq(forumThreads.id, id));

    // Get thread for category update
    const thread = await db.query.forumThreads.findFirst({
      where: eq(forumThreads.id, id),
    });

    if (thread) {
      await db.update(forumCategories)
        .set({
          postCount: sql`${forumCategories.postCount} + 1`,
          lastPostAt: new Date(),
          lastPostUserId: userId,
        })
        .where(eq(forumCategories.id, thread.categoryId));
    }

    res.json({ success: true, post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// Like thread
router.post('/threads/:id/like', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await db.update(forumThreads)
      .set({ likeCount: sql`${forumThreads.likeCount} + 1` })
      .where(eq(forumThreads.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking thread:', error);
    res.status(500).json({ success: false, error: 'Failed to like thread' });
  }
});

// =====================================================
// CHAT ROOMS
// =====================================================

// Get all chat rooms
router.get('/chat/rooms', async (req: Request, res: Response) => {
  try {
    const rooms = await db.query.chatRooms.findMany({
      orderBy: (rooms, { desc }) => [desc(rooms.onlineCount)],
    });

    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat rooms' });
  }
});

// Get room messages
router.get('/chat/rooms/:id/messages', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { before, limit = 50 } = req.query;

    const conditions = [eq(chatMessages.roomId, id), eq(chatMessages.isDeleted, false)];
    if (before) {
      conditions.push(sql`${chatMessages.createdAt} < ${before}`);
    }

    const messages = await db.query.chatMessages.findMany({
      where: and(...conditions),
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      limit: Number(limit),
      with: {
        sender: {
          columns: { id: true, username: true, profileImageUrl: true },
        },
      },
    });

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Send message (REST fallback - WebSocket preferred)
router.post('/chat/rooms/:id/messages', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { content, messageType = 'text', isAnonymous, mediaUrl } = req.body;
    const userId = req.user.id;

    const anonymousAlias = isAnonymous ? generateAnonymousAlias() : null;

    const [message] = await db.insert(chatMessages).values({
      roomId: id,
      senderId: userId,
      messageType,
      content,
      mediaUrl,
      isAnonymous,
      anonymousAlias,
    }).returning();

    // Update room stats
    await db.update(chatRooms)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatRooms.id, id));

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Join room
router.post('/chat/rooms/:id/join', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already member
    const existing = await db.query.chatRoomMembers.findFirst({
      where: and(
        eq(chatRoomMembers.roomId, id),
        eq(chatRoomMembers.userId, userId)
      ),
    });

    if (!existing) {
      await db.insert(chatRoomMembers).values({
        roomId: id,
        userId,
        role: 'member',
      });

      await db.update(chatRooms)
        .set({ memberCount: sql`${chatRooms.memberCount} + 1` })
        .where(eq(chatRooms.id, id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ success: false, error: 'Failed to join room' });
  }
});

// Create room
router.post('/chat/rooms', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { name, description, isNsfw, roomType = 'public', themeColor } = req.body;
    const userId = req.user.id;

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const [room] = await db.insert(chatRooms).values({
      name,
      slug,
      description,
      ownerId: userId,
      roomType,
      isNsfw,
      themeColor: themeColor || '#ff00ff',
    }).returning();

    // Add creator as owner member
    await db.insert(chatRoomMembers).values({
      roomId: room.id,
      userId,
      role: 'owner',
    });

    res.json({ success: true, room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, error: 'Failed to create room' });
  }
});

// =====================================================
// REPUTATION SYSTEM
// =====================================================

router.get('/reputation/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    let reputation = await db.query.userReputation.findFirst({
      where: eq(userReputation.userId, userId),
    });

    if (!reputation) {
      // Create default reputation
      [reputation] = await db.insert(userReputation).values({
        userId,
        totalPoints: 0,
        level: 1,
        title: 'Newcomer',
      }).returning();
    }

    res.json({ success: true, reputation });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reputation' });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateAnonymousAlias(): string {
  const adjectives = ['Shadow', 'Midnight', 'Cyber', 'Neon', 'Dark', 'Silent', 'Ghost', 'Phantom', 'Mystic', 'Hidden'];
  const nouns = ['Wolf', 'Fox', 'Owl', 'Raven', 'Tiger', 'Dragon', 'Phoenix', 'Panther', 'Hawk', 'Viper'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

export default router;
