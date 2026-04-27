const express = require("express");
const Joi = require("joi");
const { authenticate, requireInstitute } = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();
  const materials = db.collection("materials");
  const { ObjectId } = require("mongodb");

  const createSchema = Joi.object({
    name: Joi.string().min(2).max(300).required(),
    type: Joi.string().valid("pdf", "doc", "image", "video", "file").required(),
    subject: Joi.string().allow("").optional(),
    batch: Joi.string().allow("").optional(),
    url: Joi.string().allow("").optional(),
    base64Data: Joi.any().optional(),
    restricted: Joi.boolean().optional().default(false),
  });

  router.get("/materials", authenticate, requireInstitute, async (req, res) => {
    try {
      const instituteId = new ObjectId(req.user.instituteId);
      const { subject, batch } = req.query;
      const query = { instituteId };
      if (subject) query.subject = subject;
      if (batch) query.batch = batch;
      const docs = await materials
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res
        .status(200)
        .json({ materials: docs.map((d) => ({ ...d, id: d._id.toString() })) });
    } catch (err) {
      console.error("List materials error:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to list materials" });
    }
  });

  router.post(
    "/materials",
    authenticate,
    requireInstitute,
    async (req, res) => {
      try {
        const { error, value } = createSchema.validate(req.body);
        if (error)
          return res.status(400).json({ error: error.details[0].message });
        const instituteId = new ObjectId(req.user.instituteId);
        let fileUrl = value.url || "";
        
        if (value.base64Data) {
          const fs = require('fs');
          const path = require('path');
          
          // Determine extension from type or filename
          let ext = value.name.split('.').pop() || 'file';
          const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'materials');
          
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = path.join(uploadsDir, filename);
          const base64Content = value.base64Data.includes(',') ? value.base64Data.split(',')[1] : value.base64Data;
          fs.writeFileSync(filePath, base64Content, 'base64');
          
          // Use relative URL so frontend can fetch from same host
          fileUrl = `/uploads/materials/${filename}`;
        }

        const doc = {
          instituteId,
          name: value.name,
          type: value.type,
          subject: value.subject || "Uncategorized",
          batch: value.batch || "General",
          url: fileUrl,
          restricted: !!value.restricted,
          views: 0,
          downloads: 0,
          uploadDate: new Date().toISOString().split("T")[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const result = await materials.insertOne(doc);
        res
          .status(201)
          .json({
            message: "Material created",
            id: result.insertedId.toString(),
            material: { id: result.insertedId.toString(), ...doc },
          });
      } catch (err) {
        console.error("Create material error:", err);
        res
          .status(500)
          .json({ error: err.message || "Failed to create material" });
      }
    },
  );

  router.put(
    "/materials/:id/metrics",
    authenticate,
    requireInstitute,
    async (req, res) => {
      try {
        const { views, downloads, restricted } = req.body || {};
        const update = { updatedAt: new Date() };
        if (typeof views === "number") update.views = views;
        if (typeof downloads === "number") update.downloads = downloads;
        if (typeof restricted === "boolean") update.restricted = restricted;
        const id = new ObjectId(req.params.id);
        const instituteId = new ObjectId(req.user.instituteId);
        const result = await materials.updateOne(
          { _id: id, instituteId },
          { $set: update },
        );
        if (result.matchedCount === 0)
          return res.status(404).json({ error: "Material not found" });
        res.status(200).json({ message: "Material updated" });
      } catch (err) {
        console.error("Update material error:", err);
        res
          .status(500)
          .json({ error: err.message || "Failed to update material" });
      }
    },
  );

  router.delete(
    "/materials/:id",
    authenticate,
    requireInstitute,
    async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const instituteId = new ObjectId(req.user.instituteId);
        const result = await materials.deleteOne({ _id: id, instituteId });
        if (result.deletedCount === 0)
          return res.status(404).json({ error: "Material not found" });
        res.status(200).json({ message: "Material deleted" });
      } catch (err) {
        console.error("Delete material error:", err);
        res
          .status(500)
          .json({ error: err.message || "Failed to delete material" });
      }
    },
  );

  return router;
};
