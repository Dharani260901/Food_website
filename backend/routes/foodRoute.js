import express from 'express'
import { addFood, listFood ,removeFood} from '../controllers/foodController.js'
import multer from 'multer'

const foodRouter = express.Router()

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

// addFood needs image upload
foodRouter.post('/add', upload.single("image"), addFood)

// listFood does NOT need multer
foodRouter.get('/list', listFood)
foodRouter.post('/remove',removeFood)


export default foodRouter
