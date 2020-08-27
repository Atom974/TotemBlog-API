import { Request, Response } from "express";
import { Article, ArticleInterface } from "../models/article.model";
import { TagsInterface, Tag } from "../models/tags.model";
import { User } from "../models/user.model";
import { Commentaire } from "../models/commentaire.model";
import { UserController } from './user.controller'
import { UpdateOptions, DestroyOptions, FindOptions, Op } from 'sequelize';
import * as _ from 'lodash';

export class ArticleController {

    public async init(req: Request, res: Response) {
        try {
            const user: User = await UserController.Finduser("totem");
            const myTags: Array<string> = ["test", "ok", "douze"];

            const initArticle = {
                title: 'Welcome on Blog',
                imagePath: 'noavatar.png',
                text: 'Lorem ipsum',
                isPublic: true,
                userId: user.id,
            }
            const article = await Article.create<Article>(initArticle);
            await myTags.map(x => {
                const tag: TagsInterface = {
                    name: x,
                    articleId: article.id
                }
                Tag.create<Tag>(tag)
                    .then((tags: Tag) => console.log(tags))
                    .catch((err) => console.log(err));
            })
            const tags = await Article.findAll({ include: [Tag, User, Commentaire] });
            res.status(200).json(tags);
        } catch (err) {
            res.status(500).json(err);
        }
    }

    public async index(req: Request, res: Response) {
        try {
            if (_.has(req.body, 'decoded')) {
                const pseudo = req.body.decoded.pseudo;
                const user = await UserController.Finduser(pseudo);
                if (user) {
                    Article.findAll<Article>({ where: { [Op.or]: [{ isPublic: true }, { userId: user.id }] }, include: [Tag, User, Commentaire] })
                        .then((article: Array<Article>) => res.json(article))
                        .catch((err: Error) => res.status(500).json(err));
                }
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
    public indexpublic(req: Request, res: Response) {
        Article.findAll<Article>({ where: { isPublic: true }, include: [Tag, User, Commentaire] })
            .then((article: Array<Article>) => {
                res.json(article)
            })
            .catch((err: Error) => res.status(500).json(err));
    }

    public show(req: Request, res: Response) {
        const articleId: string = req.params.id;
        Article.findByPk<Article>(articleId, { include: [Tag, User, Commentaire] })
            .then((article: Article | null) => {
                if (article)
                    res.json(article);
                else
                    res.status(404).json({ Error: ["Article not Found"] })
            })
            .catch((err: Error) => res.status(500).json(err));
    }

    public async search(req: Request, res: Response) {
        try {
            const query: string = req.params.id;
            const article = await Article.findAll<Article>({ where: { title: { [Op.like]: query + '%' } } })
            res.status(200).json(article);
        } catch (err) {

            res.status(500).json(err);
        }
    }

    static FindArticle(toFind: string): Promise<Article> {
        return new Promise((resolve, reject) => {
            const find: FindOptions = {
                where: { id: toFind },
                include: [Tag, Commentaire, User]
            };
            Article.findOne<Article>(find)
                .then((article: Article | null) => {
                    if (article)
                        resolve(article);
                    else
                        reject({ Error: ["Article inexistant"] });
                })
                .catch((err: Error) => reject(err));
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const param = req.body;
            if (param.decoded.pseudo == undefined)
                throw { Error: ["No user"] };

            const user: User = await UserController.Finduser(param.decoded.pseudo);
            const article = await ArticleController.FindArticle(param.id);
            if (article !== undefined && article !== null) {
                if ((article.userId != user.id) && !user.isAdmin) {
                    throw { Error: ["Not allowed to do that"] }
                }
            } else
                throw { Error: ["Article inexistant"] };

            const tagss: Array<string> = req.body.Tags
            const initArticle: ArticleInterface = {
                title: param.title,
                imagePath: param.avatarPath,
                text: param.text,
                isPublic: param.isPublic,
                userId: user.id
            }
            const update: UpdateOptions = {where: { id: param.id }, limit: 1}

            await Article.update<Article>(initArticle, update);

            const updateTagOption: DestroyOptions = { where: { articleId: article.id }}
            await Tag.destroy(updateTagOption);
            if (tagss !== undefined && tagss.length > 0) {
                await tagss.map(x => {
                    const tag: TagsInterface = {
                        name: x,
                        articleId: article.id
                    }
                    Tag.create<Tag>(tag);
                })
                const newArticle = await Article.findOne<Article>({ where: { id: article.id }, include: [Tag] })
                res.status(201).json(newArticle);
            } else {
                res.status(201).json(article);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }

    
    public async create(req: Request, res: Response) {
        try {
            const param = req.body;
            if (param.decoded.pseudo == undefined)
                throw { Error: ["No user"] };
            const user: User = await UserController.Finduser(param.decoded.pseudo);
            const tagss: Array<string> = req.body.tag
            const initArticle: ArticleInterface = {
                title: param.title,
                imagePath: param.avatarPath,
                text: param.text,
                isPublic: param.isPublic,
                userId: user.id
            }
            const article = await Article.create<Article>(initArticle)
            if (tagss !== undefined && tagss.length > 0) {
                await tagss.map(x => {
                    const tag: TagsInterface = {
                        name: x,
                        articleId: article.id
                    }
                    Tag.create<Tag>(tag);
                })
                const newArticle = await Article.findOne<Article>({ where: { id: article.id }, include: [Tag] })
                res.status(201).json(newArticle);
            } else {
                res.status(201).json(article);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const param = req.body;
            if (param.decoded.pseudo == undefined)
                throw { Error: ["No user"] };
            const user: User = await UserController.Finduser(param.decoded.pseudo);
            const article: Article = await ArticleController.FindArticle(param.id);
            if (article !== undefined && article !== null) {
                if ((article.userId != user.id) && !user.isAdmin) {
                    throw { Error: ["Not allowed to do that"] }
                }
            } else
                throw { Error: ["Article inexistant"] };
            const options: DestroyOptions = {
                where: { id: article.id },
                limit: 1
            };
            const rowDelete = await Article.destroy(options);
            const updateTagOption: DestroyOptions = {
                where: { articleId: article.id }
            }
            const tagDelete = await Tag.destroy(updateTagOption);

            const row = { ...{ rowDelete }, ...{ tagDelete } };
            res.status(200).json(row);
        } catch (err) {
            res.status(500).json(err);
        }
    }

} 