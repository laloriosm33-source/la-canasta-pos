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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});
exports.getUsers = getUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, permissions, branchId } = req.body;
        const existing = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ error: 'Email already registered' });
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, password, role, permissions, branchId } = req.body;
        const data = {
            name,
            email,
            role,
            permissions,
            branchId: branchId || null
        };
        if (password) {
            data.password = yield bcrypt_1.default.hash(password, 10);
        }
        const user = yield prisma_1.default.user.update({
            where: { id },
            data
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});
exports.deleteUser = deleteUser;
