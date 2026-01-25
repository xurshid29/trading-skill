import { Router } from 'express';
import { z } from 'zod';
import { screeningService } from '../services/screening.js';

const router = Router();

// Validation schemas
const createScreeningSchema = z.object({
  name: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  filters: z.record(z.unknown()).optional(),
});

const addResultSchema = z.object({
  ticker: z.string().min(1).max(10),
  price: z.number().optional(),
  changePct: z.number().optional(),
  volume: z.number().optional(),
  avgVolume: z.number().optional(),
  marketCap: z.number().optional(),
  rsi: z.number().optional(),
  sma20Pct: z.number().optional(),
  sma50Pct: z.number().optional(),
  sma200Pct: z.number().optional(),
  high52wPct: z.number().optional(),
  low52wPct: z.number().optional(),
  beta: z.number().optional(),
  atr: z.number().optional(),
  instOwnPct: z.number().optional(),
  instTransPct: z.number().optional(),
  insiderOwnPct: z.number().optional(),
  insiderTransPct: z.number().optional(),
  shortFloatPct: z.number().optional(),
  shortRatio: z.number().optional(),
  profitMarginPct: z.number().optional(),
  peRatio: z.number().optional(),
  debtEquity: z.number().optional(),
  dividendYield: z.number().optional(),
  pattern: z.enum(['starting_uptrend', 'consolidation', 'downtrend_reversal', 'unknown']).optional(),
  tier: z.enum(['buy', 'watch', 'skip']).optional(),
  newsStatus: z.enum(['pending', 'clean', 'red_flag']).optional(),
  newsNotes: z.string().optional(),
  earningsDate: z.string().datetime().optional(),
  rawData: z.record(z.unknown()).optional(),
});

const updateResultSchema = z.object({
  tier: z.enum(['buy', 'watch', 'skip']).optional(),
  newsStatus: z.enum(['pending', 'clean', 'red_flag']).optional(),
  newsNotes: z.string().optional(),
  rawData: z.record(z.unknown()).optional(),
});

// GET /api/screenings - List all screenings
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const screenings = await screeningService.list(limit, offset);
    res.json({ data: screenings });
  } catch (error) {
    console.error('Failed to list screenings:', error);
    res.status(500).json({ error: 'Failed to list screenings' });
  }
});

// POST /api/screenings - Create a new screening session
router.post('/', async (req, res) => {
  try {
    const input = createScreeningSchema.parse(req.body);
    const screening = await screeningService.create(input);
    res.status(201).json({ data: screening });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Failed to create screening:', error);
    res.status(500).json({ error: 'Failed to create screening' });
  }
});

// GET /api/screenings/:id - Get a screening with its results
router.get('/:id', async (req, res) => {
  try {
    const screening = await screeningService.getById(req.params.id);
    if (!screening) {
      res.status(404).json({ error: 'Screening not found' });
      return;
    }
    res.json({ data: screening });
  } catch (error) {
    console.error('Failed to get screening:', error);
    res.status(500).json({ error: 'Failed to get screening' });
  }
});

// POST /api/screenings/:id/complete - Mark screening as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const totalResults = parseInt(req.body.totalResults) || 0;
    await screeningService.complete(req.params.id, totalResults);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to complete screening:', error);
    res.status(500).json({ error: 'Failed to complete screening' });
  }
});

// POST /api/screenings/:id/results - Add results to a screening
router.post('/:id/results', async (req, res) => {
  try {
    const screeningId = req.params.id;

    // Support both single result and array of results
    const body = Array.isArray(req.body) ? req.body : [req.body];
    const validatedResults = body.map((r) => ({
      ...addResultSchema.parse(r),
      screeningId,
      earningsDate: r.earningsDate ? new Date(r.earningsDate) : undefined,
    }));

    const results = await screeningService.addResults(validatedResults);
    res.status(201).json({ data: results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Failed to add results:', error);
    res.status(500).json({ error: 'Failed to add results' });
  }
});

// GET /api/screenings/:id/results - Get results with optional filters
router.get('/:id/results', async (req, res) => {
  try {
    const { tier, pattern } = req.query;
    const results = await screeningService.getResultsByFilter(req.params.id, {
      tier: tier as 'buy' | 'watch' | 'skip' | undefined,
      pattern: pattern as 'starting_uptrend' | 'consolidation' | 'downtrend_reversal' | 'unknown' | undefined,
    });
    res.json({ data: results });
  } catch (error) {
    console.error('Failed to get results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// PATCH /api/screenings/results/:resultId - Update a result
router.patch('/results/:resultId', async (req, res) => {
  try {
    const updates = updateResultSchema.parse(req.body);
    await screeningService.updateResult(req.params.resultId, updates);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Failed to update result:', error);
    res.status(500).json({ error: 'Failed to update result' });
  }
});

// GET /api/screenings/ticker/:ticker - Get latest results for a ticker
router.get('/ticker/:ticker', async (req, res) => {
  try {
    const results = await screeningService.getResultsByTicker(req.params.ticker);
    res.json({ data: results });
  } catch (error) {
    console.error('Failed to get ticker results:', error);
    res.status(500).json({ error: 'Failed to get ticker results' });
  }
});

// DELETE /api/screenings/:id - Delete a screening
router.delete('/:id', async (req, res) => {
  try {
    await screeningService.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete screening:', error);
    res.status(500).json({ error: 'Failed to delete screening' });
  }
});

export default router;
