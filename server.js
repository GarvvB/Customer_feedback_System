import dotenv from 'dotenv';
dotenv.config();
import e from 'express';
import connectDB from './src/config/database.js';
// Importing the models
import { Customer, Feedback, Response } from './module/schema.js';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const app = e();
app.use(e.json());

//connect to database
connectDB();

app.get('/', (req,res) => {
    res.status(200).json("Working");
})

// Simplify ROLES to just USER
const ROLES = {
    USER: 'user'
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Simplify authorization middleware to only check for authentication
const authorize = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ 
                error: 'Authentication required'
            });
        }
        next();
    };
};

//CRUD 
// Create a new customer
app.post('/customers', async (req, res) => {
  try {
      const customer = new Customer(req.body);
      await customer.save();
      res.status(201).send(customer);
  } catch (error) {
      res.status(400).send(error);
  }
});

// Get all customers
app.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).send(customers);
  } catch (error) {
    res.status(500).send(error);
  }
});

//search customers
app.get('/customers/search', async (req, res) => {
    const { query } = req.query;
    const customers = await Customer.find({ name: { $regex: query, $options: 'i' } });
    res.status(200).send(customers);
});

//update customer
app.put('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Find customer first to check if exists
        const existingCustomer = await Customer.findById(id);
        if (!existingCustomer) {
            return res.status(404).json({
                error: 'Customer not found'
            });
        }

        // Update customer with new timestamp
        const customer = await Customer.findByIdAndUpdate(
            id, 
            { 
                ...(name && { name }),
                ...(email && { email }),
                timeStamp: new Date() // Add new timestamp
            }, 
            { 
                new: true,
                runValidators: true 
            }
        );

        res.status(200).json({
            message: 'Customer updated successfully',
            customer,
            lastUpdated: customer.timeStamp
        });

    } catch (error) {
        res.status(400).json({
            error: 'Failed to update customer',
            details: error.message
        });
    }
});

// Delete all customers
app.delete('/customers/delete-all', async (req, res) => {
    try {
        const result = await Customer.deleteMany({});
        
        res.status(200).json({
            message: 'All customers deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete all customers',
            details: error.message
        });
    }
});

// Delete individual customer
app.delete('/customers/:id', async (req, res) => {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id);
    res.status(200).send({ message: 'Customer deleted' });
});

// Create a new feedback with customer validation
app.post('/customers/feedback', async (req, res) => {
    try {
        const { email, message, satisfaction } = req.body;
        
        // Check if customer exists
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ 
                error: 'Customer not found. Please register first.' 
            });
        }

        // Check for existing feedback from this email
        const existingFeedback = await Feedback.findOne({ customerEmail: email });
        if (existingFeedback) {
            console.log('Duplicate feedback detected:', email); // Debug log
            return res.status(400).json({
                error: 'A feedback from this email already exists'
            });
        }

        // Create feedback
        const feedback = new Feedback({
            customerEmail: email,
            message,
            satisfaction
        });

        await feedback.save();

        res.status(201).json({
            message: 'Feedback created successfully',
            feedback: {
                ...feedback.toObject(),
                customer: {
                    name: customer.name,
                    email: customer.email
                }
            }
        });

    } catch (error) {
        console.error('Feedback submission error:', error); // Debug log
        res.status(400).json({
            error: 'Failed to create feedback',
            details: error.message
        });
    }
});

// Get all feedbacks with customer details
app.get('/feedbacks', authenticateToken, authorize(), async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        
        // Get customer details for each feedback
        const feedbacksWithCustomers = await Promise.all(
            feedbacks.map(async (feedback) => {
                const customer = await Customer.findOne({ email: feedback.customerEmail });
                return {
                    ...feedback.toObject(),
                    customer: customer ? {
                        name: customer.name,
                        email: customer.email
                    } : null
                };
            })
        );
            
        res.status(200).json(feedbacksWithCustomers);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch feedbacks',
            details: error.message
        });
    }
});

// Get feedbacks for a specific customer
app.get('/customers/:email/feedbacks', authenticateToken, authorize(), async (req, res) => {
    try {
        const { email } = req.params;
        
        // Check if customer exists
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(404).json({ 
                error: 'Customer not found' 
            });
        }

        const feedbacks = await Feedback.find({ customerEmail: email })
            .sort({ createdAt: -1 });

        res.status(200).json({
            customer: {
                name: customer.name,
                email: customer.email
            },
            feedbackCount: feedbacks.length,
            feedbacks
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch customer feedbacks',
            details: error.message
        });
    }
});

//update feedback
app.put('/feedbacks/:id', async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(id, { message }, { new: true });
    res.status(200).send(feedback);
});

//delete feedback
app.delete('/feedbacks/:id', async (req, res) => {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).send({ message: 'Feedback deleted' });
});
  
// Create a new response
app.post('/responses', async (req, res) => {
  try {
      // Create new response without requiring an ID
      const response = new Response({
          ...req.body,
          createdAt: new Date()  // Optionally add creation timestamp
      });
      await response.save();
      res.status(201).json({
          message: 'Response created successfully',
          response
      });
    } catch (error) {
      res.status(400).json({
          error: 'Failed to create response',
          details: error.message
      });
  }
});

// Get all responses
app.get('/responses', async (req, res) => {
  try {
      const responses = await Response.find().populate('feedbackId');
      res.status(200).send(responses);
  } catch (error) {
      res.status(500).send(error);
  }
});

//update response
app.put('/responses/:id', async (req, res) => {
    const { id } = req.params;
    const { responseMessage, responder } = req.body;
    try {
        const response = await Response.findByIdAndUpdate(id, { responseMessage, responder }, { new: true });
        res.status(200).send(response);
    } catch (error) {
        res.status(400).send(error);
    }
});

//search responses
app.get('/responses/search', async (req, res) => {
    const { query } = req.query;
    const responses = await Response.find({ responseMessage: { $regex: query, $options: 'i' } });
    res.status(200).send(responses);
});

//delete response
app.delete('/responses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Response.findByIdAndDelete(id);
        res.status(200).send({ message: 'Response deleted' });
    } catch (error) {
        res.status(400).send(error);
    }
});

//overall rating
app.get('/overall-rating', async (req, res) => {
    const overallRating = await Feedback.aggregate([{ $group: { _id: null, averageRating: { $avg: '$satisfaction' } } }]);
    res.status(200).send(overallRating);
});

// Search feedbacks
app.post('/feedbacks/search', authenticateToken, authorize(), async (req, res) => {
  try {
      const {
          message,
          minSatisfaction,
          maxSatisfaction,
          startDate,
          endDate
      } = req.body;

      let query = {};

      // Message search using regex if message is provided
      if (message) {
          query.message = { $regex: message, $options: 'i' }; // Case-insensitive search
      }

      // Satisfaction range
      if (minSatisfaction || maxSatisfaction) {
          query.satisfaction = {};
          if (minSatisfaction) query.satisfaction.$gte = minSatisfaction;
          if (maxSatisfaction) query.satisfaction.$lte = maxSatisfaction;
      }

      // Date range
      if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = new Date(startDate);
          if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const feedbacks = await Feedback.find(query)
          .sort({ createdAt: -1 });

      res.status(200).json(feedbacks);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Backup all data
app.post('/backup', async (req, res) => {
    try {
        // Fetch all data from collections
        const customers = await Customer.find({});
        const feedbacks = await Feedback.find({});
        const responses = await Response.find({});

        const backup = {
            timestamp: new Date(),
            data: {
                customers,
                feedbacks,
                responses
            }
        };

        // Create backup directory if it doesn't exist
        const backupDir = './backups';
        await fs.mkdir(backupDir, { recursive: true });

        // Create backup file with timestamp
        const filename = `backup-${Date.now()}.json`;
        await fs.writeFile(
            path.join(backupDir, filename),
            JSON.stringify(backup, null, 2)
        );

        res.status(200).json({
            message: 'Backup created successfully',
            filename
        });
    } catch (error) {
        res.status(500).json({
            error: 'Backup failed',
            details: error.message
        });
    }
});

// List all backups
app.get('/backups', async (req, res) => {
    try {
        const backupDir = './backups';
        const files = await fs.readdir(backupDir);
        const backups = files.filter(file => file.endsWith('.json'));
        
        res.status(200).json(backups);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to list backups',
            details: error.message
        });
    }
});

// Restore from backup
app.post('/restore/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join('./backups', filename);

        // Read backup file
        const backupData = JSON.parse(
            await fs.readFile(backupPath, 'utf-8')
        );

        // Clear existing data
        await Customer.deleteMany({});
        await Feedback.deleteMany({});
        await Response.deleteMany({});

        // Restore data
        if (backupData.data.customers.length) {
            await Customer.insertMany(backupData.data.customers);
        }
        if (backupData.data.feedbacks.length) {
            await Feedback.insertMany(backupData.data.feedbacks);
        }
        if (backupData.data.responses.length) {
            await Response.insertMany(backupData.data.responses);
        }

        res.status(200).json({
            message: 'Restore completed successfully',
            stats: {
                customers: backupData.data.customers.length,
                feedbacks: backupData.data.feedbacks.length,
                responses: backupData.data.responses.length
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Restore failed',
            details: error.message
        });
    }
});
// Get contents of a specific backup
app.get('/backup/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join('./backups', filename);
        
        // Read and parse the backup file
        const backupContent = JSON.parse(
            await fs.readFile(backupPath, 'utf-8')
        );
        
        res.status(200).json({
            message: 'Backup contents retrieved successfully',
            timestamp: backupContent.timestamp,
            stats: {
                customers: backupContent.data.customers.length,
                feedbacks: backupContent.data.feedbacks.length,
                responses: backupContent.data.responses.length
            },
            data: backupContent.data
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to read backup contents',
            details: error.message
        });
    }
});

// Delete a backup
app.delete('/backup/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join('./backups', filename);
        
        await fs.unlink(backupPath);
        
        res.status(200).json({
            message: 'Backup deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete backup',
            details: error.message
        });
    }
});

// Get all indexes on Feedback collection
app.get('/feedbacks/indexes', async (req, res) => {
    try {
        const indexes = await Feedback.collection.getIndexes();
        
        res.status(200).json({
            message: 'Feedback indexes retrieved successfully',
            indexes,
            totalIndexes: Object.keys(indexes).length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve indexes',
            details: error.message
        });
    }
});

// Get all indexes on Customer collection
app.get('/customers/indexes', async (req, res) => {
    try {
        const indexes = await Customer.collection.getIndexes();
        
        res.status(200).json({
            message: 'Customer indexes retrieved successfully',
            indexes,
            totalIndexes: Object.keys(indexes).length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve indexes',
            details: error.message
        });
    }
});

// Get change stream for specific feedback
app.put('/changestream/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Set headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Create pipeline to filter changes for specific feedback
        const pipeline = [
            {
                $match: {
                    $and: [
                        { 'documentKey._id': mongoose.Types.ObjectId(id) },
                        {
                            $or: [
                                { 'operationType': 'update' },
                                { 'operationType': 'replace' },
                                { 'operationType': 'delete' }
                            ]
                        }
                    ]
                }
            }
        ];

        // Create change stream
        const changeStream = Feedback.watch(pipeline, { fullDocument: 'updateLookup' });

        // Listen for changes
        changeStream.on('change', (change) => {
            const changeData = {
                operationType: change.operationType,
                timestamp: new Date(),
                documentId: change.documentKey._id,
                changes: change.updateDescription?.updatedFields || change.fullDocument,
                fullDocument: change.fullDocument
            };

            // Send the change data to client
            res.write(`data: ${JSON.stringify(changeData)}\n\n`);
        });

        // Handle client disconnect
        req.on('close', () => {
            changeStream.close();
            res.end();
        });

        // Handle errors
        changeStream.on('error', (error) => {
            console.error('Change stream error:', error);
            res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to establish change stream',
            details: error.message
        });
    }
});

// Simplify login route
app.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = {
            email,
            role: ROLES.USER
        };
        
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, ()=>{
    console.log("Server is runing");
})