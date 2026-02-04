"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const router = (0, express_1.Router)();
router.get('/:branchId', inventory_controller_1.getInventoryByBranch);
router.post('/stock', inventory_controller_1.updateStock);
router.post('/adjust', inventory_controller_1.adjustInventory);
exports.default = router;
