const envConfig = require('dotenv').config();
const express = require('express');
const Ably = require('ably');
const p2 = require('p2');
const app = express();
const ABLY_API_KEY = process.env.ABLY_API_KEY;

const CANVAS_HEIGHT = 750;
const CANVAS_WIDTH = 1400;
const SHIP_PLATFORM = 718;
const PLAYER_VERTICAL_INCREMENT = 20;
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const MIN_PLAYERS_TO_START_GAME = 3;
const GAME_TICKER_MS = 100;

let peopleAccessingTheWebsite = 0;
let players = {};
let playerChannels = {};
let shipX = Math.floor((Math.random() * 1370 + 30) * 1000) / 1000;
let shipY = SHIP_PLATFORM;
let avatarcolors = ["green", "cyan", "yellow"];
let avatarTypes = ["A", "B", "C"];
let gameOn = false;
let alivePlayers = 0;
let totalPlayers = 0;
let gameRoom;
let deadPlayerCh;
let gameTickerOn = false;
let bulletTimer = 0;
let shipBody;
let world;
let shipVelocityTimer = 0;
let killerBulletId = "";
let copyOfShipBody = { position: "", velocity: "",};

const realtime = Ably.Realtime({ key: ABLY_API_KEY, echoMessages: false,});

//creating uniqueIds to assign to clients on auth
const uniqueId = function() {
    return "id-" + totalPlayers + Math.random().toString(36).substr(2, 16);
};

app.use(express.static("js"));

app.get("/auth", (req, res) => {
    const tokenParams = { clientId: uniqueId() };
    realtime.auth.createToeknRequest(tokenParams, function (err, tokenRequest) {
        if(err) {
            res.status(500).send("Error requesting token: " + JSON.stringify(err));
        } else {
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(tokenRequest));
        }
    });
});

app.get("/", (req, res) => {
    res.header("Acess-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if(++peopleAccessingTheWebsite > MIN_PLAYERS_TO_START_GAME) {
        res.sendFile(_dirname + "/views/gameRoomFull.html");
    } else {
        res.sendFile(_dirname + "/views/intro.html");
    }
});

app.get("/gameplay", (req, res) => {
    res.sendFile(_dirname + "/views/index.html");
});

app.get("/winner", (req, res) => {
    res.sendFile(_dirname + "/views/winner.html");
});

app.get("/gameover", (req, res) => {
    res.sendFile(_dirname + "/views/gameover.html");
});

const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});

realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get("game-room");
    deadPlayerCh = realtime.channels.get("dead-player");
    gameRoom.presence.subscribe("enter", (player) => {});
    gameRoom.presence.subscribe("leave", (player) => {});
    deadPlayerCh.subscribe("dead-notif", (msg) => {});
});