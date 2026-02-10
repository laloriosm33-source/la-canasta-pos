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
exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const system_controller_1 = require("./system.controller");
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prisma_1.default.systemSetting.findMany();
        // Convert array to object key-value
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(settingsObj);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener configuración maestra' });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const updates = req.body; // { businessName: '...', rfc: '...' }
        const transactions = Object.entries(updates).map(([key, value]) => {
            return prisma_1.default.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) }
            });
        });
        yield prisma_1.default.$transaction(transactions);
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'System';
        yield (0, system_controller_1.logAction)(userId, 'CONFIG_ACTUALIZADA', 'Parámetros maestros del sistema modificados');
        res.json({ message: 'Parámetros del sistema actualizados con éxito' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al persistir configuración' });
    }
});
exports.updateSettings = updateSettings;
