import { Request, Response } from "express";
import { Tag } from "../models/tags.model";


export class TagsController {


	public index(req: Request, res: Response): void {
		Tag.findAll<Tag>({})
			.then((tags: Array<Tag>) => res.json(tags))
			.catch((err: Error) => res.status(500).json(err));
	}


} 