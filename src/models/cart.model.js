import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        max: [8, 'Quantity must be between 1 and 8.']
    }
});

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema]
});

const Cart = model('Cart', cartSchema);

export default Cart;
