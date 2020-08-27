import { Request, Response, NextFunction } from "express";
import { Article, ArticleInterface } from "../models/article.model";
import { TagsInterface, Tag } from "../models/tags.model";
import { User, UserInterface } from "../models/user.model";
import { UserController } from './user.controller'

export class TagsController {


    public index(req: Request, res: Response) {
        Tag.findAll<Tag>({})
            .then((tags: Array<Tag>) => res.json(tags))
            .catch((err: Error) => res.status(500).json(err));
    }


} 