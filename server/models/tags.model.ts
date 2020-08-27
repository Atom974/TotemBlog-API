import { Model, DataTypes, Sequelize } from "sequelize";
import { database } from "../config/database";

export class Tag extends Model {
    public id!: number;
    public name!: string;
    public articleId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}
export interface TagsInterface {
    name: string;
    articleId: number;
}

Tag.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        },
        articleId : {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
    },
    {
        tableName: "tags",
        sequelize: database
    }
)

Tag.sync({force: true})
.then(() => console.log("Tags table created"))
.catch(() => console.log("something Wrong witg Db Tags"));