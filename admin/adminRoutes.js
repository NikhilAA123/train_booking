import Train from '../models/Train.js';
import Coach from '../models/Coach.js';
import Seat from '../models/Seat.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const adminRouter = express.Router();
const API_KEY = process.env.ADMIN_API_KEY;

// Middleware to check API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  next();
};

const validateTrainInput = (req, res, next) => {
    const { trainDetails, coachConfiguration } = req.body;
    
    if (!trainDetails || !coachConfiguration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const requiredTrainFields = ['name', 'number', 'source', 'destination', 'departureTime', 'arrivalTime'];
    for (const field of requiredTrainFields) {
      if (!trainDetails[field]) {
        return res.status(400).json({ error: `Missing required train field: ${field}` });
      }
    }
  
    if (!Array.isArray(coachConfiguration) || coachConfiguration.length === 0) {
      return res.status(400).json({ error: 'Coach configuration must be a non-empty array' });
    }
  
    for (const config of coachConfiguration) {
      const requiredCoachFields = ['type', 'quantity', 'rowsPerCoach', 'seatsPerRow'];
      for (const field of requiredCoachFields) {
        if (!config[field]) {
          return res.status(400).json({ error: `Missing required coach configuration field: ${field}` });
        }
      }
    }
  
    next();
  };


adminRouter.get('/trains', validateApiKey, async (req, res) => {
    try {
      const trains = await Train.findAll({
        include: [{
          model: Coach,
          include: [Seat]
        }]
      });
      res.json(trains);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch trains' });
    }
  });

adminRouter.post('/upload', validateApiKey, validateTrainInput, async (req, res) => {
  try {
    const {
      trainDetails,
      coachConfiguration
    } = req.body;

    // Create train
    const train = await Train.create(trainDetails);

    const coaches = [];
    // Create coaches based on configuration
    for (const config of coachConfiguration) {
      const { type, quantity, seatsPerCoach, rowsPerCoach, seatsPerRow } = config;
      
      for (let i = 0; i < quantity; i++) {
        const coach = await Coach.create({
          type,
          coach_no: i + 1,
          train_id: train.id
        });
        coaches.push(coach);
        
        // Generate and assign seats
        const seats = generateSeats(coach.id, train.id, type, rowsPerCoach, seatsPerRow);
        await Seat.bulkCreate(seats);
      }
    }

    res.status(201).json({
      message: 'Train created successfully',
      trainId: train.id,
      numberOfCoaches: coaches.length
    });
  } catch (err) {
    console.error('Error creating train:', err);
    res.status(500).json({ error: 'Failed to create train' });
  }
});

adminRouter.delete('/trains/:trainId', validateApiKey, async (req, res) => {
    try {
      const result = await Train.destroy({
        where: { id: req.params.trainId }
      });
      if (result) {
        res.json({ message: 'Train deleted successfully' });
      } else {
        res.status(404).json({ error: 'Train not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete train' });
    }
  });

  adminRouter.put('/trains/:trainId', validateApiKey, async (req, res) => {
    try {
      const [updated] = await Train.update(req.body.trainDetails, {
        where: { id: req.params.trainId }
      });
      if (updated) {
        res.json({ message: 'Train updated successfully' });
      } else {
        res.status(404).json({ error: 'Train not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update train' });
    }
  });

const generateSeats = (coachId, trainId, coachType, rows = 12, seatsPerRow = 8) => {
  const seats = [];
  let seatNo = 1;
  const seatNames = ['L', 'M', 'U', 'L', 'M', 'U', 'SL', 'SU'];

  for (let row = 1; row <= rows; row++) {
    for (let i = 0; i < seatsPerRow; i++) {
      const seatName = seatNames[i % seatNames.length];
      const seat = {
        seat_no: seatNo,
        seat_name: seatName,
        row: row,
        coach_id: coachId,
        train_id: trainId,
        coach_type: coachType,
        isBooked: false,
      };
      seats.push(seat);
      seatNo++;
    }
  }

  return seats;
};



export default adminRouter;