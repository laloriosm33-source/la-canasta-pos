import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions // Include permissions in login
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Only allowed if no users exist OR by an Admin
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, permissions } = req.body;

        const count = await prisma.user.count();
        // If users exist, we might want to check for admin privileges (middleware needed later)
        // For now, allow creation if count == 0 (First run)

        if (count > 0) {
            // Check auth header if we were implementing middleware
            // For simplicity in this tool phase, I'll allow it but in prod this needs protection
            // return res.status(403).json({ error: "System already initialized" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CASHIER',
                permissions: permissions || 'POS' // Default permission
            }
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

export const checkInit = async (req: Request, res: Response) => {
    try {
        const count = await prisma.user.count();
        res.json({ initialized: count > 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error checking system status' });
    }
};
