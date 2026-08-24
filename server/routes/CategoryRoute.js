import express from "express";
import Category from "../model/Category.js";
import authMiddleware from "../middleware/authMiddleware.js";

const categoryRouter = express.Router();


// ======================================================
// GET ALL ACTIVE CATEGORIES
// GET /api/categories
// PUBLIC
// ======================================================

categoryRouter.get("/", async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      status: true,
      categories,
    });

  } catch (error) {
    console.log("Get categories error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to get categories",
    });
  }
});


// ======================================================
// GET SINGLE ACTIVE CATEGORY
// GET /api/categories/:id
// PUBLIC
// ======================================================

categoryRouter.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      category,
    });

  } catch (error) {
    console.log("Get category error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to get category",
    });
  }
});


// ======================================================
// CREATE CATEGORY
// POST /api/categories
// ADMIN ONLY
// ======================================================

categoryRouter.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {

      // Check admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          status: false,
          message: "Admin access required",
        });
      }

      const { name, slug, image } = req.body;

      // Required fields
      if (!name || !slug) {
        return res.status(400).json({
          status: false,
          message: "Category name and slug are required",
        });
      }

      const cleanName = name.trim();
      const cleanSlug = slug.trim().toLowerCase();

      // Check duplicate category
      const existingCategory = await Category.findOne({
        $or: [
          { name: cleanName },
          { slug: cleanSlug },
        ],
      });

      if (existingCategory) {
        return res.status(400).json({
          status: false,
          message: "Category already exists",
        });
      }

      const category = await Category.create({
        name: cleanName,
        slug: cleanSlug,
        image: image || "",
        isActive: true,
      });

      return res.status(201).json({
        status: true,
        message: "Category created successfully",
        category,
      });

    } catch (error) {
      console.log("Create category error:", error);

      // Duplicate key protection
      if (error.code === 11000) {
        return res.status(400).json({
          status: false,
          message: "Category name or slug already exists",
        });
      }

      return res.status(500).json({
        status: false,
        message: "Failed to create category",
      });
    }
  }
);


// ======================================================
// UPDATE CATEGORY
// PUT /api/categories/:id
// ADMIN ONLY
// ======================================================

categoryRouter.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {

      // Check admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          status: false,
          message: "Admin access required",
        });
      }

      const {
        name,
        slug,
        image,
        isActive,
      } = req.body;

      const category = await Category.findById(
        req.params.id
      );

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      // Update name
      if (name !== undefined) {
        const cleanName = name.trim();

        if (!cleanName) {
          return res.status(400).json({
            status: false,
            message: "Category name cannot be empty",
          });
        }

        category.name = cleanName;
      }

      // Update slug
      if (slug !== undefined) {
        const cleanSlug = slug.trim().toLowerCase();

        if (!cleanSlug) {
          return res.status(400).json({
            status: false,
            message: "Category slug cannot be empty",
          });
        }

        category.slug = cleanSlug;
      }

      // Update image
      if (image !== undefined) {
        category.image = image;
      }

      // Update active status
      if (isActive !== undefined) {
        category.isActive = isActive;
      }

      await category.save();

      return res.status(200).json({
        status: true,
        message: "Category updated successfully",
        category,
      });

    } catch (error) {
      console.log("Update category error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          status: false,
          message: "Category name or slug already exists",
        });
      }

      return res.status(500).json({
        status: false,
        message: "Failed to update category",
      });
    }
  }
);


// ======================================================
// DELETE / DEACTIVATE CATEGORY
// DELETE /api/categories/:id
// ADMIN ONLY
// ======================================================

categoryRouter.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {

      // Check admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          status: false,
          message: "Admin access required",
        });
      }

      const category = await Category.findById(
        req.params.id
      );

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      // Don't permanently delete category.
      // Existing FoundItems may still reference it.
      category.isActive = false;

      await category.save();

      return res.status(200).json({
        status: true,
        message: "Category deactivated successfully",
      });

    } catch (error) {
      console.log("Delete category error:", error);

      return res.status(500).json({
        status: false,
        message: "Failed to deactivate category",
      });
    }
  }
);


export default categoryRouter;