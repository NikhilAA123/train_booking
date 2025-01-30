import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Seat from "./Seat.js";

const Coach = sequelize.define("Coach", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["AC", "Sleeper", "General"]],
    },
  },
  train_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "Trains",
      key: "id",
    },
    allowNull: false,
  },
  coach_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Relationship: A coach has many seats
Coach.hasMany(Seat, { foreignKey: "coach_id", onDelete: "CASCADE" });
Seat.belongsTo(Coach, { foreignKey: "coach_id" });

export default Coach;


