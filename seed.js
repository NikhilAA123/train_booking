import Train from './models/Train.js';
import Coach from './models/Coach.js';
import Seat from './models/Seat.js';
import Booking from './models/Booking.js';

const generateRandomTrainData = () => {
  return {
    name: `Train ${Math.floor(Math.random() * 1000)}`,
    number: `T${Math.floor(Math.random() * 10000)}`,
    source: `Station ${Math.floor(Math.random() * 10)}`,
    destination: `Station ${Math.floor(Math.random() * 10)}`,
    departureTime: new Date(Date.now() + Math.floor(Math.random() * 1000000000)),
    arrivalTime: new Date(Date.now() + Math.floor(Math.random() * 1000000000) + 1000000),
  };
};

const seedTrainData = async () => {
  try {
    // Create a random train
    const trainData = generateRandomTrainData();
    const train = await Train.create(trainData);
    console.log(`Train created with ID: ${train.id}`);

    // Define coach types and quantities
    const coachTypes = ['AC', 'Sleeper', 'General'];
    const coaches = [];

    // Create coaches and associate them with the train
    for (const type of coachTypes) {
      let numCoaches;
      if (type === 'AC') numCoaches = 5;
      else if (type === 'Sleeper') numCoaches = 7;
      else numCoaches = 10;

      for (let i = 0; i < numCoaches; i++) {
        const coach = await Coach.create({
          type,
          coach_no: i + 1,
          train_id: train.id  // Changed from trainId to train_id
        });
        coaches.push(coach);
      }
    }

    // Generate and assign seats for each coach
    for (const coach of coaches) {
      const seats = generateSeats(coach.id, train.id, coach.type);  // Pass both coach ID and train ID
      await Seat.bulkCreate(seats);  // Bulk insert all seats
    }

    console.log('Train and seats seeded successfully!');
  } catch (err) {
    console.error('Error seeding train data:', err);
  }
};

// Helper function to generate seats with associated trainId and coachId
const generateSeats = (coachId, trainId, coachType) => {
  const seats = [];
  let seatNo = 1; // Start seat numbering from 1
  const seatNames = ['L', 'M', 'U', 'L', 'M', 'U', 'SL', 'SU'];

  // Create seats for each row (12 rows, 8 seats per row)
  for (let row = 1; row <= 12; row++) {
    for (let i = 0; i < 8; i++) {
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

// Call the seed function
seedTrainData();