import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// Sync models with database (creates tables if they don't exist)
sequelize
  .sync({ alter: true }) // `alter: true` updates tables when models change
  .then(() => {
    console.log("[DB] Tables created or updated successfully");
  })
  .catch((err) => {
    console.error("[DB] Sync error:", err);
  });

export default sequelize;

