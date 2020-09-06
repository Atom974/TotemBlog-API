import { Model, DataTypes } from "sequelize";
import { database } from "../config/database";
import { Tag } from "../models/tags.model";
 

export class Article extends Model {
    public id!: number;
    public title!: string;
    public imagePath!: string;
    public text!: string;
    public isPublic!: false;
    public userId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export interface ArticleInterface {
    title: string;
    imagePath: string;
    text: string;
    isPublic: boolean;
    userId: number;
}



Article.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true
		},
		title : {
			type: DataTypes.STRING,
			allowNull: false
		},
		imagePath : {
			type: DataTypes.STRING,
			allowNull: false
		},
		text : {
			type: DataTypes.TEXT,
			allowNull: false
		},
		isPublic : {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false
		},
		userId : {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false
		}
	},
	{
		tableName: "articles",
		sequelize: database
	}
);

Article.hasMany(Tag, {
	sourceKey: "id",
	foreignKey: "articleId",
});
Tag.belongsTo(Article);



Article.sync({force: true})
	.then(() => console.log("Article table created"))
	.catch(() => console.log("something Wrong witg Db Article"));
