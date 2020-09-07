import { Application } from "express";
import { UserController } from "../controllers/user.controller";
import { ValidatorController } from "../controllers/validator.controller";
import { ArticleController } from "../controllers/article.controller";
import { TagsController } from "../controllers/tags.controller";
import { CommentaireController } from "../controllers/commentaire.controller";


export class Routes {
	public userCtrl: UserController = new UserController();
	public validator: ValidatorController = new ValidatorController();
	public articleCtrl: ArticleController = new ArticleController();
	public tagsCtrl: TagsController = new TagsController();
	public commentaireCtrl: CommentaireController = new CommentaireController();

	public routes(app: Application): void {
		app
			.route("/user")
			.get(this.validator.verifyAdmin, this.userCtrl.index)
			.post(this.userCtrl.uploadImg, this.validator.createUser, this.userCtrl.create);
		app
			.route("/generate")// genere un Admin => log=totem pwd=test
			.get(this.userCtrl.init);
		app
			.route("/login")
			.post(this.validator.inputLog, this.userCtrl.login);
		app
			.route("/article")
			.get(this.validator.verify, this.articleCtrl.index)
			.post(this.validator.verify, this.userCtrl.uploadImg, this.validator.verify, this.articleCtrl.create)
			.put(this.validator.verify, this.userCtrl.uploadImg, this.validator.verify, this.articleCtrl.update)
			.delete(this.validator.verify, this.articleCtrl.delete);
		app
			.route("/articlepublic") // retourne tout les articles publics
			.get(this.articleCtrl.indexpublic);
		app
			.route("/article/:id")
			.get(this.validator.verify, this.articleCtrl.show);
		app
			.route("/articlesearch/:id") // route pour la search bar (noToken)
			.get(this.articleCtrl.search);
		app
			.route("/articleg")  //generation d'un Article Admin (Si l'admin existe deja)
			.get(this.articleCtrl.init);
		app
			.route("/tags")
			.get(this.tagsCtrl.index); //permet de voir les Tags existant (noToken)
		app
			.route("/commentaires")
			.get(this.commentaireCtrl.index) // permet de voir les Commentaires existant (noToken)
			.post(this.validator.verify, this.commentaireCtrl.create)
			.put(this.validator.verify, this.commentaireCtrl.update)
			.delete(this.validator.verify, this.commentaireCtrl.delete);
	}
}