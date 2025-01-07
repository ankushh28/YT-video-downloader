# YT-video-downloader
import { Request, Response } from "express";
import { Cart } from "../models/Cart"; // Cart schema

export const addToCart = async (req: Request, res: Response) => {
  const { userId } = req.body; // For logged-in users
  const { sku, quantity } = req.body; // Product details
  let cartId = req.cookies.cartId; // Guest cart identifier from cookie

  try {
    if (!userId) {
      // Guest User Flow
      if (!cartId) {
        // Generate a new cartId if it doesn't exist
        cartId = Math.random().toString(36).substring(2, 15); // Random unique ID
        res.cookie("cartId", cartId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }

      // Find or create the guest cart
      let cart = await Cart.findOne({ cartId });
      if (!cart) {
        cart = await Cart.create({ cartId, products: [] });
      }

      // Update or add product
      const productIndex = cart.products.findIndex((p) => p.sku === sku);
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ sku, quantity });
      }

      await cart.save();
      return res.status(200).json({ message: "Product added to guest cart", cart });
    }

    // Logged-In User Flow
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, cartId, products: [] });
    }

    // Update or add product
    const productIndex = cart.products.findIndex((p) => p.sku === sku);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ sku, quantity });
    }

    await cart.save();
    return res.status(200).json({ message: "Product added to user cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
