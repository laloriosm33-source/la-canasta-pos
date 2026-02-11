"use strict";
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
// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'La Canasta API',
        environment: process.env.NODE_ENV,
        timestamp: new Date()
    });
});
app.use('/api', routes_1.default);
// Error Handling / 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
exports.default = app;
