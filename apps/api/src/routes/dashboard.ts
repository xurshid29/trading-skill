import { Router } from 'express';
import { getDb } from '../db/index.js';
import { sql } from 'kysely';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
  try {
    const db = getDb();

    // Get total screenings count
    const screeningsCount = await db
      .selectFrom('screenings')
      .select(sql<number>`count(*)::int`.as('count'))
      .executeTakeFirstOrThrow();

    // Get tier counts from all screening results
    const tierCounts = await db
      .selectFrom('screening_results')
      .select([
        sql<number>`count(*) filter (where tier = 'buy')::int`.as('buy'),
        sql<number>`count(*) filter (where tier = 'watch')::int`.as('watch'),
        sql<number>`count(*) filter (where tier = 'skip')::int`.as('skip'),
      ])
      .executeTakeFirstOrThrow();

    // Get recent screenings count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await db
      .selectFrom('screenings')
      .select(sql<number>`count(*)::int`.as('count'))
      .where('created_at', '>=', sevenDaysAgo)
      .executeTakeFirstOrThrow();

    res.json({
      data: {
        totalScreenings: screeningsCount.count,
        recentScreenings: recentCount.count,
        tierCounts: {
          buy: tierCounts.buy ?? 0,
          watch: tierCounts.watch ?? 0,
          skip: tierCounts.skip ?? 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;
