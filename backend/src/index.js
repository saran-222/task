import express from "express";
import Connect from './helper/mongoConnect.js'
import 'dotenv/config'
import compression from 'compression';
import { routesv1 } from "./controller/index.js";
import cookieParser from "cookie-parser";
import cors from "cors"





const app = express();
app.use(compression({level: 6}))
app.use(express.static("./public"))
// app.use(cors())
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'], 
};
app.use(cors(corsOptions));
app.use(express.json())
app.use(cookieParser())  
app.use(express.static("./public"))
app.use(express.static("./uploads"))                                         

app.use('/api/v1', routesv1)

const main = async () => {
    try {
    await Connect(); 
    const server = await app.listen(process.env.PORT);
    console.log(`App listening on port: ${process.env.PORT}`);
    } catch (error) {
      console.error(error.message);
    }
  };
  
  main();
  