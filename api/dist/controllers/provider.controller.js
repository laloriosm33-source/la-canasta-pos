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
exports.deleteProvider = exports.updateProvider = exports.createProvider = exports.getProviders = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getProviders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const providers = yield prisma_1.default.provider.findMany();
        res.json(providers);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching providers' });
    }
});
exports.getProviders = getProviders;
const createProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, contact, phone, email, rfc, address } = req.body;
        const provider = yield prisma_1.default.provider.create({
            data: { name, contact, phone, email, rfc, address }
        });
        res.status(201).json(provider);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating provider' });
    }
});
exports.createProvider = createProvider;
const updateProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, contact, phone, email, rfc, address } = req.body;
        const provider = yield prisma_1.default.provider.update({
            where: { id },
            data: { name, contact, phone, email, rfc, address }
        });
        res.json(provider);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating provider' });
    }
});
exports.updateProvider = updateProvider;
const deleteProvider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.provider.delete({ where: { id } });
        res.json({ message: 'Provider deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting provider' });
    }
});
exports.deleteProvider = deleteProvider;
