import { Commentaire, CommentaireInterface } from "../models/commentaire.model";
import { Request, Response, NextFunction } from "express";
import { UserController } from './user.controller';
import { Article, ArticleInterface } from "../models/article.model";
import { TagsInterface, Tag } from "../models/tags.model";
import { User, UserInterface } from "../models/user.model";

import { FindOptions, DestroyOptions, UpdateOptions  } from "sequelize";
import { ArticleController } from "./article.controller";


export class CommentaireController {
    public index(req: Request, res: Response) {
        Commentaire.findAll<Commentaire>({})
            .then((commentaires: Array<Commentaire>) => res.json(commentaires))
            .catch((err: Error) => res.status(500).json(err));
    }

    public async create(req: Request, res: Response) {
        try {
            const params = req.body;
            const user = await UserController.Finduser(params.decoded.pseudo)
            const article = await ArticleController.FindArticle(params.id)
            const initCommentaire: CommentaireInterface = {
                text: params.text,
                articleParams: article.id,
                userParams: user.id,
                pseudo: user.pseudo,
                avatarPath: user.avatarPath
            }
            const con = await Commentaire.create<Commentaire>(initCommentaire);
            const articleCom = await Article.findByPk( article.id,
                {include : [Tag, Commentaire, User]})
            const userCom = await UserController.userCom(user.pseudo);
            res.status(200).json(userCom);
        } catch (err) {
            res.status(500).json(err);
        }
    }
    static FindCommentaire(toFind: number): Promise<Commentaire> {
        return new Promise((resolve, reject) => {

            Commentaire.findByPk<Commentaire>(toFind)
                .then((commentaire: Commentaire | null) => {
                    if (commentaire)
                        resolve(commentaire);
                    else
                        reject({ Error: ["Commentaire Inexistant"] });
                })
                .catch((err: Error) => reject(err));
        })
    }
    public async delete(req: Request, res: Response) {
        try {
            const param = req.body
            if (param.decoded.pseudo == undefined)
                throw { Error: ["No user"] };
            const user: User = await UserController.Finduser(param.decoded.pseudo);
            const com : Commentaire = await CommentaireController.FindCommentaire(req.body.id);
            if (com !== undefined && com !== null) {
                if ((com.userParams != user.id) && !user.isAdmin) {
                    throw { Error: ["Not allowed to do that"] }
                }
            } else
                throw { Error: ["Article inexistant"] };
            const options: DestroyOptions = {
                where: {id : com.id}
            }
            const rowDelete = await Commentaire.destroy(options);
            res.status(200).json(rowDelete);
        } catch (err) { 
            res.status(500).json(err);
        }
    }
    public async update(req: Request, res: Response) {
        try {
            const param = req.body
            if (param.decoded.pseudo == undefined)
                throw { Error: ["No user"] };
            const user: User = await UserController.Finduser(param.decoded.pseudo);
            const com : Commentaire = await CommentaireController.FindCommentaire(req.body.id);
            if (com !== undefined && com !== null) {
                if ((com.userParams != user.id) && !user.isAdmin) {
                    throw { Error: ["Not allowed to do that"] }
                }
            } else
                throw { Error: ["Article inexistant"] };
            const initCommentaire: CommentaireInterface = {
                text: param.text
            }
            const options: UpdateOptions = {
                where: {id : com.id}
            }
            await Commentaire.update(initCommentaire, options);
            const comUp : Commentaire = await CommentaireController.FindCommentaire(req.body.id);
            res.status(200).json(comUp);
        } catch (err) { 
            res.status(500).json(err);
        }
    }
}