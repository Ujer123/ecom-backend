import express from "express";
import { 
    addProduct, 
    getProducts, 
    getProductById, 
    deleteProductById, 
    getPopularProducts, 
    getTopProducts, getProductId } from "../controller/productController.js";

const router= express.Router();

router.use((req, res, next) => {
    req.db = router.productsDB;
    next();
});

router.route('/')
    .post(addProduct)
    .get(getProducts);


router.get('/:id', getProductId);

router.put("/products/:id", getProductById);

export default router;