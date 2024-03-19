import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from '../utils/error.js'
import { apiResponse } from '../utils/apiResponse.js'
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";

export const addProduct = asyncHandler(async (req, res) => {
    const { name, description, about, modelNo, price, colour, type, company, pictures, rating, customer } = req.body
    if (!name || !description || !about || !modelNo || !price || !colour || !type || !company || !rating || !customer) {
        throw new apiError(400, 'All feild required')
    }

    if (!pictures || !Array.isArray(pictures) || pictures.length == 0) {
        throw new apiError(400, 'At least one picture link is required')
    }
    const product = new Product({
        name,
        description,
        about,
        modelNo,
        price,
        colour,
        type,
        company,
        rating,
        customer,
        pictures
    })

    try {
        await product.validate()
    } catch (error) {
        const validationErrors = [];
        for (const key in error.errors) {
            validationErrors.push(error.errors[key].message);
        }
        throw new apiError(400, validationErrors.join(', '));
    }

    await product.save()

    res.status(201).json(
        new apiResponse(201, product, 'Product aded successfully')
    )
})

export const getAllProduct = asyncHandler(async (req, res) => {
    const product = await Product.aggregate([
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                about: 1,
                modelNo: 1,
                price: 1,
                colour: 1,
                type: 1,
                company: 1,
                pictures: 1,
                rating: 1,
                customer: 1
            }
        }
    ])
    if (product.length === 0) {
        res.status(200).json(new apiResponse(200, [], `No product found`));
    } else {
        res.status(200).json(new apiResponse(200, product, `product fetched successfully`));
    }
})

export const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params

    if (!productId) {
        throw new apiError(404, 'Product id is required')
    }

    const product = await Product.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(productId)
            }
        }
    ])

    if (product.length == 0) {
        throw new apiError(404, 'No product found')
    }

    res.status(200).json(
        new apiResponse(200, product[0], 'Product fetch successfully')
    )
})

export const searchProductByName = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new apiError(400, 'Search query is required')
    }

    const products = await Product.aggregate([
        {
            $match: {
                name: { $regex: new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') }
            }
        }
    ]);

    if (products.length === 0) {
        throw new apiError(404, 'No products found');
    }

    res.status(200).json(new apiResponse(200, products, 'All products'));
})

export const sortProducts = asyncHandler(async (req, res) => {
    const { sortBy } = req.query;
    let sortField = 'price';
    let sortOrder = 1;

    if (sortBy === 'lowest') {
        sortOrder = 1;
    } else if (sortBy === 'highest') {
        sortOrder = -1;
    } else if (sortBy === 'a-z') {
        sortField = 'name';
        sortOrder = 1;
    } else if (sortBy === 'z-a') {
        sortField = 'name';
        sortOrder = -1;
    } else {
        throw new apiError(400, 'Invalid sortBy parameter');
    }

    const products = await Product.aggregate([
        {
            $sort: {
                [sortField]: sortOrder
            }
        }
    ]);

    res.status(200).json(new apiResponse(200, products, 'Sorted products'));
})

export const filterProducts = asyncHandler(async (req, res) => {
    const { type, company, colour, price } = req.query;
    const filters = [];

    if (type) {
        filters.push({ type });
    }

    if (company) {
        filters.push({ company });
    }

    if (colour) {
        filters.push({ colour });
    }

    if (price) {
        const priceRange = price.split('-').map(Number);
        if (priceRange.length === 2) {
            filters.push({ price: { $gte: priceRange[0], $lte: priceRange[1] } });
        }
    }
    const products = await Product.aggregate([
        { $match: { $and: filters } }
    ]);

    res.status(200).json(new apiResponse(200, products, 'Filtered products'));
})


export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user?._id

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = new Cart({ userId, items: [], total: 0 });
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId.equals(new mongoose.Types.ObjectId(productId)));

    if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({ productId, quantity });
    }

    try {
        await cart.validate()
    } catch (error) {
        const validationErrors = [];
        for (const key in error.errors) {
            validationErrors.push(error.errors[key].message);
        }
        throw new apiError(400, validationErrors.join(', '));
    }

    await cart.save();

    res.status(200).json(
        new apiResponse(200, cart, 'Product added successfully')
    );
})

export const viewCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const cart = await Cart.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: 0,
                name: "$product.name",
                colour: "$product.colour",
                price: "$product.price",
                picture: { $arrayElemAt: ["$product.pictures", 0] },
                quantity: "$items.quantity",
                totalItemPrice: { $multiply: ["$product.price", "$items.quantity"] }
            }
        },
        {
            $group: {
                _id: null,
                items: {
                    $push: {
                        name: "$name",
                        colour: "$colour",
                        price: "$price",
                        picture: "$picture",
                        quantity: "$quantity",
                        totalItemPrice: "$totalItemPrice"
                    }
                },
                totalCartPrice: { $sum: "$totalItemPrice" }
            }
        }
    ]);

    if (cart.length === 0) {
        throw new apiError(404, 'Cart not found');
    }

    res.status(200).json(
        new apiResponse(200, cart, 'Cart details')
    );
})