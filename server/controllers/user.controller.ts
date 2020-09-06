import { Request, Response, NextFunction } from "express";
import { User, UserInterface, LogInterface, createInterface, Pass, PassInterface } from "../models/user.model";
import { UpdateOptions, DestroyOptions, FindOptions } from "sequelize";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import multer from "multer";
import { Commentaire } from "../models/commentaire.model";



export class UserController {

	public uploadImg(req: Request, res: Response, next: NextFunction): void {
		const params = req.body;
		const storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, "./public/");
			},

			filename: (req: Request, file: Express.Multer.File , cb: CallableFunction) => {
				params.filepath = new Date().toISOString() + file.originalname;
				cb(null, params.filepath);
			},
		});
		const fileFilter = (req: Request, file: Express.Multer.File , cb: CallableFunction) => {
			if (file.mimetype === "image/jpg" ||
                file.mimetype === "image/jpeg" ||
                file.mimetype === "image/png") {

				cb(null, true);
			} else {
				cb(new Error("Image uploaded is not of type jpg/jpeg or png"), false);
			}
		};
		const upload = multer({ storage: storage, fileFilter: fileFilter });

		const test = upload.array("avatarPath", 1);
		test(req, res, (err:unknown) => {
			if (err instanceof multer.MulterError) {
				res.status(500).json({ Error: ["something goes wrong during upload"] });
			} else if (err) {
				res.status(500).json({ Error: ["Wrong File"] });
			} else {
				if (!params.filepath)
					req.body.avatarPath = "noavatar.png";
				else
					req.body.avatarPath = params.filepath;
				next();
			}
		});
	}



	public async init(req: Request, res: Response) : Promise<void> {
		try {
			const bpwd = await bcrypt.hash("test", 5);
			const initUser: UserInterface = {
				pseudo: "totem",
				email: "totem@totem.com",
				isAdmin: true,
				avatarPath: "noavatar.png"
			};
			await UserController.emailIsFree(initUser.email);
			await UserController.pseudoIsFree(initUser.pseudo);
			const user = await User.create<User>(initUser);
			const passInit: PassInterface = {
				password: bpwd,
				ownerId: user.id
			};
			await Pass.create<Pass>(passInit);
			res.json({ succes: ["Admin Create"] });
		} catch (err) {
			res.status(500).json(err);
		}
	}

	static emailIsFree(toFind: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const find: FindOptions = {
				where: { email: toFind },
			};
			User.findOne<User>(find)
				.then((user: User | null) => {
					if (user)
						reject({ Error: ["already existe"] });
					else
						resolve();
				})
				.catch((err: Error) => reject(err));
		});
	}
	static pseudoIsFree(toFind: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const find: FindOptions = {
				where: { pseudo: toFind },
			};
			User.findOne<User>(find)
				.then((user: User | null) => {
					if (user)
						reject({ Error: ["already existe"] });
					else
						resolve();
				})
				.catch((err: Error) => reject(err));
		});
	}

	static Finduser(toFind: string): Promise<User> {
		return new Promise((resolve, reject) => {
			const find: FindOptions = {
				where: { pseudo: toFind },
			};
			User.findOne<User>(find)
				.then((user: User | null) => {
					if (user)
						resolve(user);
					else
						reject({ Error: ["User inexistant"] });
				})
				.catch((err: Error) => reject(err));
		});
	}
	static userCom(toFind: string): Promise<User> {
		return new Promise((resolve, reject) => {
			const find: FindOptions = {
				where: { pseudo: toFind },
				include : [Commentaire]
			};
			User.findOne<User>(find)
				.then((user: User | null) => {
					if (user)
						resolve(user);
					else
						reject({ Error: ["User inexistant"] });
				})
				.catch((err: Error) => reject(err));
		});
	}

	public async create(req: Request, res: Response): Promise<void> {
		try {
			const params: createInterface = req.body;
			const pass = req.body.password;
			const secret: jwt.Secret = "$2y$12$XWnTlev/9oCSySq0zoCfDOHcbZy9NV5Ynsli9XWMiq";
			await UserController.emailIsFree(params.email);
			await UserController.pseudoIsFree(params.pseudo);
			const bpwd = await bcrypt.hash(pass, 5);
			const user = await User.create<User>(params);
			const passInit: PassInterface = {
				password: bpwd,
				ownerId: user.id
			};
			await Pass.create<Pass>(passInit);
			const token = jwt.sign({
				pseudo: user.pseudo,
				email: user.email,
				isAdmin: user.isAdmin,
				date: Date.now()
			}, secret);
			const ret = {
				token: token,
				pseudo: user.pseudo,
				email: user.email,
				avatarPath: user.avatarPath
			};
			res.status(201).json(ret);
		} catch (err) {
			if (err.name === "SequelizeValidationError")
				res.status(500).json({ Error: [err.errors[0].message] });
			else {
				res.status(500).json(err);
			}
		}
	}

	public async login(req: Request, res: Response): Promise<void> {
		try {
			const params: LogInterface = req.body;

			const user = await User.findOne<User>({ where: { pseudo: params.pseudo }, include: [Pass] });
			const secret: jwt.Secret = "$2y$12$XWnTlev/9oCSySq0zoCfDOHcbZy9NV5Ynsli9XWMiq";
			if (user && user.Pass) {
				const isValidPw = await bcrypt.compare(params.password, user.Pass.password);
				if (!isValidPw)
					throw { Error: ["Mdp Invalide"] };

				const token = jwt.sign({
					pseudo: user.pseudo,
					email: user.email,
					isAdmin: user.isAdmin,
					date: Date.now()
				}, secret);
				const ret = {
					token: token,
					pseudo: user.pseudo,
					email: user.email,
					avatarPath: user.avatarPath
				};
				res.status(200).json(ret);
			} else {
				throw { Error: ["No user"] };
			}
		} catch (err) {
			res.status(500).json(err);
		}
	}

	public index(req: Request, res: Response): void {
		User.findAll<User>({})
			.then((users: Array<User>) => res.json(users))
			.catch((err: Error) => res.status(500).json(err));
	}

	public update(req: Request, res: Response): void {
		const userId: string = req.params.id;
		const params: UserInterface = req.body;

		const update: UpdateOptions = {
			where: { id: userId },
			limit: 1
		};
		User.update(params, update)
			.then(() => res.status(202).json({ data: "success" }))
			.catch((err: Error) => res.status(500).json(err));
	}

	public delete(req: Request, res: Response): void {
		const userId: string = req.params.id;
		const options: DestroyOptions = {
			where: { id: userId },
			limit: 1
		};
		User.destroy(options)
			.then(() => res.status(204).json({ data: "success" }))
			.catch((err: Error) => res.status(500).json(err));
	}
}