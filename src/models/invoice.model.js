import { Schema, model } from 'mongoose'


const invoiceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: [true, 'Delivery address is required']
    },
    payment_method: {
        type: String,
        enum: ["pay_on_delivery", "upi", "card"],
        required: [true, 'Payment method is required']
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
        }
    ],
    orderTotal: {
        type: Number,
        required: [true, 'Order total is required']
    }
}, { timestamps: true })

const Invoice = model("Invoice", invoiceSchema)

export default Invoice