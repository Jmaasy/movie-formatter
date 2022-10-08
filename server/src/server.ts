import * as express from 'express'
import * as http from 'http'
import * as path from "path";
import * as cors from "cors";
import * as dotenv from 'dotenv';
import Logger from './logger';
import { Server } from "socket.io";
import MovieFormatter from './movieFormatter';
import { DownloadFormatted } from './downloadFormatted';

const movieFormatter = new MovieFormatter()
const env = dotenv.config();
const port = 5000;

const app = express()
      app.use(cors());
      app.use(express.static('../client/build'));
      app.use("/public/images", express.static('../client/build/images'));
      app.use("/public/style", express.static('../client/build/style'));
      app.get("/*", (req: any, res: any) => {
        res.sendFile(path.resolve("../client/build/index.html"));
      });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, allowEIO3: true, pingInterval: 100, transports: ["websocket"]});

io.on("connect_error", (err) => Logger.ERROR(err));
io.on('connection', (socket) => {
  movieFormatter.retrieveMovies(socket);
  socket.on("retrieve-files", () => movieFormatter.retrieveMovies(socket));
  socket.on("move-files", (files: DownloadFormatted[][]) => movieFormatter.moveFiles(socket, files));
});

server.listen(port, () => Logger.LOG("STARTING", `Running on port ${port}`));

// movieFormatter.retrieveMovies(null);