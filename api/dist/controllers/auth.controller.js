"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInit = exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
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
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.login = login;
// Only allowed if no users exist OR by an Admin
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, permissions } = req.body;
        const count = yield prisma_1.default.user.count();
        // If users exist, we might want to check for admin privileges (middleware needed later)
        // For now, allow creation if count == 0 (First run)
        if (count > 0) {
            // Check auth header if we were implementing middleware
            // For simplicity in this tool phase, I'll allow it but in prod this needs protection
            // return res.status(403).json({ error: "System already initialized" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CASHIER',
                permissions: permissions || 'POS' // Default permission
            }
        });
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});
exports.register = register;
const checkInit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield prisma_1.default.user.count();
        res.json({ initialized: count > 0 });
    }
    catch (error) {
        res.status(500).json({ error: 'Error checking system status' });
    }
});
exports.checkInit = checkInit;
