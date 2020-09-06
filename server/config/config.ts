import * as dotenv from "dotenv";

dotenv.config();
let path;
switch (process.env.NODE_ENV) {
case "test" :
	path = `${__dirname}/../../.env`;
}
dotenv.config({path: path});
export const STOKEN = process.env.STOKEN;

