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
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranches = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getBranches = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branches = yield prisma_1.default.branch.findMany({
            include: {
                _count: {
                    select: { customers: true, inventory: true }
                }
            }
        });
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching branches' });
    }
});
exports.getBranches = getBranches;
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, phone } = req.body;
        const branch = yield prisma_1.default.branch.create({
            data: { name, address, phone }
        });
        res.status(201).json(branch);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating branch' });
    }
});
exports.createBranch = createBranch;
const updateBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, address, phone } = req.body;
        const branch = yield prisma_1.default.branch.update({
            where: { id },
            data: { name, address, phone }
        });
        res.json(branch);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating branch' });
    }
});
exports.updateBranch = updateBranch;
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.branch.delete({
            where: { id }
        });
        res.json({ message: 'Branch deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting branch' });
    }
});
exports.deleteBranch = deleteBranch;
