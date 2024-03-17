import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getProfile, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js'

const router = Router()

router.post('/signup', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/profile', verifyJWT, getProfile)

export default router