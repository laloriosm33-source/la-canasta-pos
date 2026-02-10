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
const express_1 = require("express");
const product_routes_1 = __importDefault(require("./product.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const branch_routes_1 = __importDefault(require("./branch.routes"));
const inventory_routes_1 = __importDefault(require("./inventory.routes"));
const sale_routes_1 = __importDefault(require("./sale.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const transfer_routes_1 = __importDefault(require("./transfer.routes"));
const provider_routes_1 = __importDefault(require("./provider.routes"));
const finance_routes_1 = __importDefault(require("./finance.routes"));
const system_routes_1 = __importDefault(require("./system.routes"));
const settings_routes_1 = __importDefault(require("./settings.routes"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 🚑 Ruta de Emergencia para Reparar Base de Datos
router.get('/setup-db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Protección simple
    if (req.query.key !== 'lacanasta123') {
        return res.status(403).json({ error: 'Acceso Denegado' });
    }
    try {
        const { exec } = require('child_process');
        // Ejecutar migración de base de datos
        exec('npx prisma migrate deploy', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error de migración: ${error}`);
                return res.status(500).json({
                    status: 'error',
                    mensaje: 'Falló la reparación de la base de datos',
                    detalle: error.message,
                    stderr
                });
            }
            res.json({
                status: 'success',
                mensaje: '¡Base de datos reparada correctamente!',
                output: stdout
            });
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.use('/auth', auth_routes_1.default);
// Protect all following routes
router.use(auth_middleware_1.authMiddleware);
router.use('/products', product_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/branches', branch_routes_1.default);
router.use('/inventory', inventory_routes_1.default);
router.use('/sales', sale_routes_1.default);
router.use('/customers', customer_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/transfers', transfer_routes_1.default);
router.use('/providers', provider_routes_1.default);
router.use('/finance', finance_routes_1.default);
router.use('/system', system_routes_1.default);
router.use('/settings', settings_routes_1.default);
router.get('/', (req, res) => {
    res.json({ message: 'La Canasta API v1' });
});
exports.default = router;
