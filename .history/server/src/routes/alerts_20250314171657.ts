import { Router, Request, Response } from 'express';
import { supabase } from '../config';
import { AlertType, AlertConditions } from '../types';

const router = Router();

// Get alerts for a business
router.get('/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId);

    if (status === 'active') {
      query = query.eq('active', true);
    } else if (status === 'inactive') {
      query = query.eq('active', false);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create a new alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { businessId, type, conditions } = req.body as {
      businessId: string;
      type: AlertType;
      conditions: AlertConditions;
    };

    if (!businessId || !type || !conditions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert([
        {
          business_id: businessId,
          type,
          conditions,
          active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Update alert status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(alert);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Delete an alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;