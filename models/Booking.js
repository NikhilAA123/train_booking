import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  seat_no: {
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
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Booking;

