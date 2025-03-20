const express = require('express');

module.exports = function (db) {
    const router = express.Router();
    const support = db.collection("support");

    // **POST: Submit a Support Request**
    router.post('/', async (req, res) => { 
        try {
            const { name, email, phone, message } = req.body;
    
            if (!name || !email || !phone || !message) {
                return res.status(400).send("All fields (name, email, phone, message) are required");
            }
    
            const supportRequest = { name, email, phone, message, createdAt: new Date() };
            const result = await support.insertOne(supportRequest);
    
            res.status(201).send(`Support request created with ID: ${result.insertedId}`);
        } catch (err) {
            res.status(500).send("Error submitting support request: " + err.message);
        }
    });
    

    // **GET: Fetch All Support Requests**
    router.get('/', async (req, res) => {
        try {
            const allRequests = await support.find().toArray();
            res.status(200).json(allRequests);
        } catch (err) {
            res.status(500).send("Error fetching support requests: " + err.message);
        }
    });

    return router;
};
