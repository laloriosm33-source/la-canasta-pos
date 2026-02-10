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
exports.deleteCustomer = exports.recordPayment = exports.updateCustomer = exports.createCustomer = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.query;
        const customers = yield prisma_1.default.customer.findMany({
            where: branchId ? { branchId: String(branchId) } : {},
            include: { branch: true }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching customers' });
    }
});
exports.getCustomers = getCustomers;
const createCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, email, rfc, taxRegime, address, zipCode, creditLimit, branchId } = req.body;
        const customer = yield prisma_1.default.customer.create({
            data: { name, phone, email, rfc, taxRegime, address, zipCode, creditLimit, branchId }
        });
        res.status(201).json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating customer' });
    }
});
exports.createCustomer = createCustomer;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const customer = yield prisma_1.default.customer.update({
            where: { id },
            data
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
});
exports.updateCustomer = updateCustomer;
const recordPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, amount, paymentMethod } = req.body;
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Create payment record
            const payment = yield tx.creditPayment.create({
                data: {
                    customerId,
                    amount,
                    paymentMethod
                }
            });
            // Update customer balance (decrement debt)
            yield tx.customer.update({
                where: { id: customerId },
                data: {
                    currentBalance: { decrement: amount }
                }
            });
            return payment;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Error recording payment' });
    }
});
exports.recordPayment = recordPayment;
const deleteCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.customer.delete({ where: { id } });
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting customer' });
    }
});
exports.deleteCustomer = deleteCustomer;
