import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllInvoices, getInvoiceById, placeOrder } from "../controllers/product.controller.js";

const router = Router()

router.post("/create_invoice", verifyJWT, placeOrder)
router.get("/allInvoice", verifyJWT, getAllInvoices)
router.get("/id/:invoiceId", verifyJWT, getInvoiceById)

export default router