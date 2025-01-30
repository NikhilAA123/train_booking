import express from 'express';
import Train from '../models/Train.js';
import Coach from '../models/Coach.js';
import Seat from '../models/Seat.js';

const trainRouter = express.Router();

trainRouter.get("/availability", async (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ message: "Source and Destination are required" });
    }
    
    const trains = await Train.findAll({
      where: { source, destination },
      include: [
        {
          model: Coach,
          include: [
            {
              model: Seat,
              attributes: ["isBooked"]
            }
          ]
        }
      ]
    });

    const trainAvailability = trains.map(train => {
      const coachTypes = { AC: 0, Sleeper: 0, General: 0 };
      const totalSeats = { AC: 480, Sleeper: 672, General: 960 };
    
      console.log(`Processing train ${train.name}:`);
      
      train.Coaches.forEach(coach => {
        
        if (coach.Seats && Array.isArray(coach.Seats)) {
          const availableSeats = coach.Seats.filter(seat => seat.isBooked === false).length;
    
          if (coach.type in coachTypes) {
            coachTypes[coach.type] += availableSeats;
          }
        }
      });
    
      // Log final counts
      console.log('Final seat counts:', coachTypes);
    
      const departureTime = new Date(train.departureTime);
      const arrivalTime = new Date(train.arrivalTime);
      const travelTimeMs = arrivalTime - departureTime;
      const travelHours = Math.floor(travelTimeMs / (1000 * 60 * 60));
      const travelMinutes = Math.round((travelTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
      return {
        train_name: train.name,
        train_no: train.train_no,
        AC_seats_available: `${coachTypes.AC} out of ${totalSeats.AC}`,
        Sleeper_seats_available: `${coachTypes.Sleeper} out of ${totalSeats.Sleeper}`,
        General_seats_available: `${coachTypes.General} out of ${totalSeats.General}`,
        Travel_time: `${Math.abs(travelHours)} hrs ${Math.abs(travelMinutes)} min`
      };
    });

    res.json({ trains: trainAvailability });
  } catch (error) {
    console.error("Error fetching seat availability:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


trainRouter.post("/book-seat", async (req, res) => {
  try {
    const { train_name, coach_type } = req.body;

    if (!train_name || !coach_type) {
      return res.status(400).json({ message: "Train name and coach type are required" });
    }

    // Validate coach type
    const validCoachTypes = ['AC', 'Sleeper', 'General'];
    if (!validCoachTypes.includes(coach_type)) {
      return res.status(400).json({ message: "Invalid coach type" });
    }

    // Find the train by name
    const train = await Train.findOne({
      where: { name: train_name },
      include: [
        {
          model: Coach,
          where: { type: coach_type },
          include: [
            {
              model: Seat,
              where: { isBooked: false },
              order: [['seat_no', 'ASC']]
            }
          ]
        }
      ]
    });

    if (!train || !train.Coaches.length) {
      return res.status(404).json({ message: "No available seats found for this train and coach type" });
    }

    const availableCoaches = train.Coaches.filter(coach => coach.Seats.length > 0);

    if (!availableCoaches.length) {
      return res.status(404).json({ message: "No available seats in the selected coach type" });
    }

    const randomCoach = availableCoaches[Math.floor(Math.random() * availableCoaches.length)];
    const randomSeat = randomCoach.Seats[Math.floor(Math.random() * randomCoach.Seats.length)];

    // Mark the seat as booked
    await Seat.update(
      { isBooked: true },
      { where: { id: randomSeat.id } }
    );

    return res.json({
      train_name: train.name,
      train_no: train.train_no,
      coach_type: coach_type,
      coach_no: randomCoach.coach_no,
      seat_no: randomSeat.seat_no,
      seat_name: randomSeat.seat_name,
      status: "Booked"
    });

  } catch (error) {
    console.error("Error booking seat:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


export default trainRouter;
