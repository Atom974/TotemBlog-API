import express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./config/routes";
import * as dotenv from 'dotenv';
import morgan from "morgan";

class App {
    public app: express.Application;
    public routePrv: Routes = new Routes();

    constructor() {
        this.app = express();
        this.config();
        this.routePrv.routes(this.app);
    }
    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true}));
        this.app.use(morgan(`dev`));
        dotenv.config();
        this.app.use(express.static('public'));
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "http://localhost:3001"); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
            next();
          });
    }
}
export default new App().app;