import { Model, DataTypes } from "sequelize";
import { database } from "../config/database";
import { Article } from "../models/article.model";

export class User extends Model {
    public id!: number;
    public pseudo!: string;
    public email!: string;
    public isAdmin!: boolean;
    public avatarPath!: string;
    public Pass?: Pass;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

}

export class Pass extends Model {
    public id!: number;
    public password!: string;
    public ownerId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true
		},
		pseudo: {
			type: DataTypes.STRING(32),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(128),
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		avatarPath: {
			type: DataTypes.STRING(128),
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		}
	},
	{
		tableName: "users",
		sequelize: database
	}
);
Pass.init({
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true
	},
	password: {
		type: DataTypes.STRING(128),
		allowNull: false
	},
	ownerId : {
		type: DataTypes.INTEGER.UNSIGNED,
		allowNull: false
	}
}, {
	tableName: "password",
	sequelize: database
});

User.hasOne(Pass, {
	foreignKey: "ownerId"
});
Pass.belongsTo(User);
User.hasMany(Article, {
	sourceKey: "id",
	foreignKey: "userId",
});
Article.belongsTo(User);

Pass.sync({ force: true })
	.then(() => console.log("pass table created"))
	.catch(() => console.log("something Wrong with Db Pass"));

User.sync({ force: true })
	.then(() => console.log("users table created"))
	.catch(() => console.log("something Wrong with Db User"));

export interface PassInterface {
    password: string;
    ownerId: number;
}

export interface UserInterface {
    pseudo: string;
    email: string;
    token?: string;
    isAdmin?: boolean;
    avatarPath?: string;
    Pass?: PassInterface;
}
export interface createInterface {
    pseudo: string;
    email: string;
    avatarPath: string;
}
export interface LogInterface {
    password: string;
    pseudo: string;
    email: string;
    avatarPath?: string;
}
