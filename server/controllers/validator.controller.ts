import { Request, Response, NextFunction } from "express";
import { LogInterface } from '../models/user.model';
import * as jwt from 'jsonwebtoken';

export class ValidatorController {

    public inputCreate(req: Request, res: Response, next: NextFunction) {
        const params: LogInterface = req.body;
        if (!params.email || !params.password || !params.pseudo)
            return res.status(500).send({ Error: ["params missing"] });
        if (params.email.length < 3 || params.email.length > 127) {
            return res.status(500).send({ Error: ["email not correctly formated"] });
        }
        if (params.pseudo.length < 3 || params.pseudo.length > 16) {
            return res.status(500).send({ Error: ["pseudo not correctly formated"] });
        }
        if (params.password.length < 3 || params.password.length > 16) {
            return res.status(500).send({ Error: ["Password not correctly formated"] });
        } else {
        next();
        }
    }
    public inputLog(req: Request, res: Response, next: NextFunction) {
        const params: LogInterface = req.body;
        if (!params.password || !params.pseudo)
            return res.status(500).send({ Error: ["params missing"] });
        if (params.pseudo.length < 3 || params.pseudo.length > 16) {
            return res.status(500).send({ Error: ["pseudo not correctly formated"] });
        }
        if (params.password.length < 3 || params.password.length > 16) {
            return res.status(500).send({ Error: ["Password not correctly formated"] });
        }
        next();
    }

    public verify(req: Request, res: Response, next: NextFunction) {
        let token = req.headers['x-access-token'];
        const secret: jwt.Secret = '$2y$12$XWnTlev/9oCSySq0zoCfDOHcbZy9NV5Ynsli9XWMiq';
        if (!token)
            return res.status(403).send({ Error: ["No token provided."] });

        jwt.verify(token.toString(), secret, function (err, decoded) {
            if (err)
                return res.status(500).send({ Error: ["Failed to authenticate token."] });
            req.body.decoded = decoded;
            next();
        });
    }
    public verifyAdmin(req: Request, res: Response, next: NextFunction) {
        let token = req.headers['x-access-token'];
        const secret: jwt.Secret = '$2y$12$XWnTlev/9oCSySq0zoCfDOHcbZy9NV5Ynsli9XWMiq';
        if (!token)
            return res.status(403).send({ Error: ["No token provided."] });

        jwt.verify(token.toString(), secret, (err, decoded) => {
            if (err)
                return res.status(500).send({ Error: ["Failed to authenticate token."] });
            req.body.decoded = decoded;
            if (!req.body.decoded.isAdmin)
                return res.status(500).json({ Error : ['Youre not allowed to be here ' ]});
            
            next();
        });
    }
}