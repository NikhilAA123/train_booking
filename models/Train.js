import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Coach from "./Coach.js";
import Booking from "./Booking.js";
import Seat from "./Seat.js";

const Train = sequelize.define("Train", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, unique: true, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  departureTime: { type: DataTypes.DATE, allowNull: false },
  arrivalTime: { type: DataTypes.DATE, allowNull: false },
});

// Relationships
Train.hasMany(Coach, { 
  foreignKey: "train_id"
});
Coach.belongsTo(Train, { 
  foreignKey: "train_id"
});


Train.hasMany(Booking, { foreignKey: "train_id", onDelete: "CASCADE" });
Booking.belongsTo(Train, { foreignKey: "train_id" });

Train.hasMany(Seat, { foreignKey: "train_id", as: "seats" }); 
Seat.belongsTo(Train, { foreignKey: "train_id", as: "train" });

export default Train;

