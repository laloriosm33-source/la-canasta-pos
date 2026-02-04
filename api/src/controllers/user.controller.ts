import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                branchId: true,
                branch: { select: { name: true } },
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, permissions, branchId } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                permissions,
                branchId: branchId || null
            }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, permissions, branchId } = req.body;

        const data: any = {
            name,
            email,
            role,
            permissions,
            branchId: branchId || null
        };

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};
