@ts-nocheck
/**
 * Message Routes
 * 
 * Handles job-related messaging between clients and runners.
 * Messages are scoped to specific jobs for coordination and communication.
 * 
 * @module routes/messages
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPool } from '../db.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * GET /messages/job/:jobId
 * Get all messages for a specific job
 * 
 * Requires authentication. User must be the client or runner of the job.
 */
router.get('/job/:jobId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const userId = (req as any).user?.id;
    const pool = getPool();

    if (!pool) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    // Verify user has access to this job
    const jobResult = await pool.query(
      'SELECT client_id, runner_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = jobResult.rows[0];
    const isClient = job.client_id === userId;
    const isRunner = job.runner_id === userId;

    if (!isClient && !isRunner) {
      res.status(403).json({ error: 'Not authorized to view messages for this job' });
      return;
    }

    // Get messages for this job
    const result = await pool.query(
      `SELECT m.id, m.job_id, m.sender_id, m.content, m.media_url, m.ln_invoice,
              m.created_at, u.username, u.display_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.job_id = $1
       ORDER BY m.created_at ASC`,
      [jobId]
    );

    res.json({
      success: true,
      data: {
        jobId: parseInt(jobId),
        messages: result.rows.map(row => ({
          id: row.id,
          jobId: row.job_id,
          senderId: row.sender_id,
          senderUsername: row.username,
          senderDisplayName: row.display_name,
          content: row.content,
          mediaUrl: row.media_url,
          lnInvoice: row.ln_invoice,
          createdAt: row.created_at,
        })),
      },
    });
  } catch (error) {
    logger.error('[Messages] Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /messages/job/:jobId
 * Post a new message to a job
 * 
 * Requires authentication. User must be the client or runner of the job.
 */
router.post('/job/:jobId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const userId = (req as any).user?.id;
    const { content, media_url, ln_invoice } = req.body;
    const pool = getPool();

    if (!pool) {
      res.status(500).json({ error: 'Database not available' });
      return;
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    if (content.length > 2000) {
      res.status(400).json({ error: 'Message content too long (max 2000 characters)' });
      return;
    }

    // Verify user has access to this job
    const jobResult = await pool.query(
      'SELECT client_id, runner_id FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const job = jobResult.rows[0];
    const isClient = job.client_id === userId;
    const isRunner = job.runner_id === userId;

    if (!isClient && !isRunner) {
      res.status(403).json({ error: 'Not authorized to post messages to this job' });
      return;
    }

    // Insert message
    const result = await pool.query(
      `INSERT INTO messages (job_id, sender_id, content, media_url, ln_invoice, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, job_id, sender_id, content, media_url, ln_invoice, created_at`,
      [jobId, userId, content.trim(), media_url || null, ln_invoice || null]
    );

    const message = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        message: {
          id: message.id,
          jobId: message.job_id,
          senderId: message.sender_id,
          content: message.content,
          mediaUrl: message.media_url,
          lnInvoice: message.ln_invoice,
          createdAt: message.created_at,
        },
      },
    });
  } catch (error) {
    logger.error('[Messages] Failed to post message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

export default router;

