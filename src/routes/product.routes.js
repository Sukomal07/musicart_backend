import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { addProduct, addToCart, filterProducts, getAllProduct, getProductById, searchProductByName, sortProducts } from '../controllers/product.controller.js'


const router = Router()

router.post("/newproduct", verifyJWT, addProduct)
router.get("/allproduct", getAllProduct)
router.get("/get/:productId", getProductById)
router.get("/search", searchProductByName)
router.get("/sort", sortProducts)
router.get("/filter", filterProducts)
router.post("/add", verifyJWT, addToCart)

export default router