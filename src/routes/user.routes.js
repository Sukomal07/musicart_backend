import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getProfile, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'
import { viewCart } from '../controllers/product.controller.js'
import { sendFeedback } from '../controllers/feedback.controller.js'

const router = Router()

router.post('/signup', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/profile', verifyJWT, getProfile)
router.get('/cart', verifyJWT, viewCart)
router.post("/send_feedback", verifyJWT, sendFeedback)

export default router