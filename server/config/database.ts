import { Sequelize } from "sequelize";

export const database = new Sequelize({
    database: "totem_blog",
    dialect: "sqlite",
    storage: ":memory:"
});