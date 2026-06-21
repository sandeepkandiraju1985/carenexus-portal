const express = require('express');
const { z } = require('zod');

const prisma = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const memberSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  dateOfBirth: z.coerce.date(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().min(1).optional().nullable(),
  address: z.string().trim().min(1).optional().nullable(),
  city: z.string().trim().min(1).optional().nullable(),
  state: z.string().trim().min(1).optional().nullable(),
  zipCode: z.string().trim().min(1).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const memberUpdateSchema = memberSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field is required' }
);

const serializeMember = (member) => ({
  ...member,
  dateOfBirth: member.dateOfBirth.toISOString().slice(0, 10),
});

router.use(requireAuth);

router.get('/', async (_req, res, next) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    res.status(200).json({ members: members.map(serializeMember) });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.status(200).json({ member: serializeMember(member) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = memberSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid member payload',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const member = await prisma.member.create({
      data: parsed.data,
    });

    res.status(201).json({ member: serializeMember(member) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = memberUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid member payload',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    res.status(200).json({ member: serializeMember(member) });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }

    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }

    next(error);
  }
});

module.exports = router;
