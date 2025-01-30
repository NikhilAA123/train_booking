import { DataTypes } from "sequelize";
import sequelize from "../db.js";

// Define the Seat model
const Seat = sequelize.define("Seat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  seat_name: {
    type: DataTypes.STRING, // L, M, U, SL, SU
    allowNull: false,
  },
  seat_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  row: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coach_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "Coaches",
      key: "id",
    },
    allowNull: false,
  },
  train_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "Trains",
      key: "id",
    },
    allowNull: false,
  },
  coach_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["AC", "Sleeper", "General"]],
    },
  },
  isBooked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['coach_id', 'seat_no'],
    },
  ],
});

export default Seat;



