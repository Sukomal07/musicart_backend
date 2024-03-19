import { Schema, model } from 'mongoose'

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        minLength: [3, 'Product name must be at least 3 character']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minLength: [15, 'Product description must be at least 15 character']
    },
    about: {
        type: String,
        required: [true, 'Product about is required'],
        minLength: [15, 'Product about must be at least 15 characters']
    },
    modelNo: {
        type: String,
        required: [true, 'Model no is required'],
        unique: true,
        minLength: [3, 'Model number must be at least 3 character']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [1, 'Price must be at least 1'],
        max: [20000, 'Price cannot exceed 20000']
    },
    colour: {
        type: String,
        enum: ['blue', 'black', 'white', 'red', 'brown'],
        required: [true, 'Colour is needed']
    },
    type: {
        type: String,
        enum: ['in-ear', 'on-ear', 'over-ear'],
        required: [true, 'Please specify headphone type']
    },
    company: {
        type: String,
        enum: ['jbl', 'sony', 'boat', 'zebronics', 'marshall', 'ptron'],
        required: [true, 'Company name required']
    },
    pictures: [
        {
            type: String,
            required: true
        }
    ],
    rating: {
        type: Number,
        validate: {
            validator: function (num) {
                return num >= 1 && num <= 5
            },
            message: 'Rating must between 1 to 5'
        },
        required: true
    },
    customer: {
        type: Number,
        required: [true, 'Please add number of customer']
    }
}, { timestamps: true })

const Product = model("Product", productSchema)

export default Product