import { Model, DataTypes, Sequelize } from "sequelize";
import { database } from "../config/database";
import { User } from "./user.model";
import { Article } from "./article.model"; 

export class Commentaire extends Model {
    public id! : string;
    public text!: string;
    public userParams!: number;
    public articleParams!: number;
    public pseudo!: string;
    public avatarPath!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export interface CommentaireInterface {
    pseudo?: string;
    text: string;
    userParams?: number;
    articleParams?: number;
    avatarPath?: string;
}

Commentaire.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        text : {
            type: DataTypes.STRING,
            allowNull: false
        },
        userParams : {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        articleParams : {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        avatarPath: {
            type: DataTypes.STRING(128),
        },
        pseudo: {
            type: DataTypes.STRING(32),
            allowNull: false
        },

    },{
        tableName: "commentaires",
        sequelize: database
    }
)
User.hasMany(Commentaire, {
    sourceKey: "id",
    foreignKey: "userParams",
})
Commentaire.belongsTo(User);
Article.hasMany(Commentaire, {
    sourceKey: 'id',
    foreignKey: "articleParams"
});
Commentaire.belongsTo(Article);

Commentaire.sync({force: true})
.then(() => console.log("Commentaire table created"))
.catch((err) => console.log(err));