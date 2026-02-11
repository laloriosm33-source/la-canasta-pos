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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use((0, cors_1.default)({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    credentials: true,
}));
app.use(express_1.default.json());
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Routes
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let dbStatus = 'unknown';
    try {
        yield prisma.$queryRaw `SELECT 1`;
        dbStatus = 'connected';
    }
    catch (e) {
        dbStatus = 'error: ' + e.message;
    }
    res.json({
        status: 'ok',
        service: 'La Canasta API',
        database: dbStatus,
        environment: process.env.NODE_ENV,
        timestamp: new Date()
    });
}));
app.use('/api', routes_1.default);
// Error Handling / 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
exports.default = app;
