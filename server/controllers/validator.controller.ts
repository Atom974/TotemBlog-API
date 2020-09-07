import { Request, Response, NextFunction } from "express";
import { UserInterface } from "../models/user.model";
import * as jwt from "jsonwebtoken";
import { STOKEN } from "../config/config";

export class ValidatorController {

	public createUser(req: Request, res: Response, next: NextFunction): void | Response {
		const user: UserInterface = {
			pseudo: req.body.pseudo,
			email: req.body.email,
			Pass : {
				password: req.body.password
			}
		};
		req.body.user = user;
		if (!user?.email || !user?.Pass|| !user?.pseudo)
			return res.status(500).send({ Error: ["params missing"] });
		if (user.email.length < 3 || user.email.length > 127) {
			return res.status(500).send({ Error: ["email not correctly formated"] });
		}
		if (user.pseudo.length < 3 || user.pseudo.length > 16) {
			return res.status(500).send({ Error: ["pseudo not correctly formated"] });
		}
		if (user.Pass.password.length < 3 || user.Pass.password.length > 16) {
			return res.status(500).send({ Error: ["Password not correctly formated"] });
		} else {
			next();
		}
	}
	public inputLog(req: Request, res: Response, next: NextFunction): void | Response {
		const params: UserInterface = {
			pseudo: req.body.pseudo,
			Pass : {
				password: req.body.password
			}
		};
		req.body.user = params;
		if (!params?.Pass|| !params?.pseudo)
			return res.status(500).send({ Error: ["params missing"] });
		if (params.pseudo.length < 3 || params.pseudo.length > 16) {
			return res.status(500).send({ Error: ["pseudo not correctly formated"] });
		}
		if (params.Pass.password.length < 3 || params.Pass.password.length > 16) {
			return res.status(500).send({ Error: ["Password not correctly formated"] });
		}
		next();
	}

	public verify(req: Request, res: Response, next: NextFunction): void {
		const token = req.headers["x-access-token"];
		if (!token) {
			res.status(403).send({ Error: ["No token provided."] });
			return;
		}
		if (STOKEN !== undefined) {
			jwt.verify(token.toString(), STOKEN, function (err, decoded) {
				if (err)
					res.status(500).send({ Error: ["Failed to authenticate token."] });
				req.body.decoded = decoded;
				next();
			});
		}
	}
	public verifyAdmin(req: Request, res: Response, next: NextFunction): void {
		const token = req.headers["x-access-token"];
		const secret: jwt.Secret = "$2y$12$XWnTlev/9oCSySq0zoCfDOHcbZy9NV5Ynsli9XWMiq";
		if (!token) {
			res.status(403).send({ Error: ["No token provided."] });
			return;
		}
		jwt.verify(token.toString(), secret, (err, decoded) => {
			if (err)
				return res.status(500).send({ Error: ["Failed to authenticate token."] });
			req.body.decoded = decoded;
			if (!req.body.decoded.isAdmin)
				return res.status(500).json({ Error: ["Youre not allowed to be here "] });

			next();
		});
	}
}