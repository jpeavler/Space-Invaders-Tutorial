const { create } = require("domain");

let gameRoom;
let deadPlayerCh;
let myClientId;
let myChannel;
let gameOn = false;
let players = {};
let totalPlayers = 0;
let latestShipPosition;
let bulletThatShotMe;
let bulletThatShotSomeone;
let bulletOutOfBounds = "";
let amIalive = false;
let game;

const BASE_SERVER_URL = "http://localhost:5000";
const myNickname = localStorage.getItem("nickame");

const realtime = Ably.Realtime({
    authUrl: BASE_SERVER_URL + "auth"
});

realtime.connection.once("connected", () => {
    myClientId = realtime.auth.clientId;
    gameRoom = realtime.channels.get("game-room");
    deadPlayerCh = realtime.channels.get("dead-player");
    myChannel = realtime.channels.get("clientChannel-" + myClientId);
    gameRoom.presence.enter(myNickname);
    game = new Phaser.Game(config);
});



class GameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    } 
    create() {
        this.avatars = {};
        this.visibleBullets = {};
        this.ship = {};
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
        gameRoom.subscribe("game-state", (msg) => {
            if(msg.data.gameOn) {
                gameOn = true;
                if(msg.data.shipbody["0"]) {
                    latestShipPosition = msg.data.shipBody["0"];
                }
                if(msg.data.bulletOrBlank != "") {
                    let bulletId = msg.data.bulletOrBlank.id;
                    this.visibleBullets[bulletId] = {
                        id: bulletId,
                        y: msg.data.bulletOrBlank.y,
                        toLaunch: true,
                        bulletSprite: ""
                    };
                }
                if(msg.data.killerBulletId) {
                    bulletThatShotSomeone = message.data.killerBulletId;
                }
            }
            players = msg.data.players;
            totalPlayers = msg.data.playerCount; 
        });
        gameRoom.subscribe("game-over", (msg) => {
            gameOn = false;
            localStorage.setItem("totalPlayers", msg.data.totalPlayers);
            localStorage.setItem("winner", msg.data.winner);
            localStorage.setItem("firstRunnerUp", msg.data.firstRunnerUp);
            localStorage.setItem("secondRunnerUp", msg.data.secondRunnerUp);
            gameRoom.unsubscribe();
            deadPlayerCh.unsubscribe();
            myChannel.unsubscribe();
            if(msg.data.winner == "Nobody") {
                window.location.replace(BASE_SERVER_URL + "/gameover");
            } else {
                window.location.replace(BASE_SERVER_URL + "/winner");
            }
        });
    } 
    preload() {
        this.load.spritesheet(
            "avatarA",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderA_00%402x.png?v=1589228669385",
            { frameWidth: 48, frameHeight: 32 }
        );
        this.load.spritesheet(
            "avatarB",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderB_00%402x.png?v=1589228660870",
            { frameWidth: 48, frameHeight: 32 }
        );
        this.load.spritesheet(
            "avatarC",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FInvaderC_00%402x.png?v=1589228654058",
            { frameWidth: 48, frameHeight: 32 }
        );
        this.load.spritesheet(
            "avatarAgreen",
            "https:cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAgreen.png?v=1589839188589",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarAcayn",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAcyan.png?v=1589839190850",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarAyellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderAyellow.png?v=1589839197191",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarBgreen",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBgreen.png?v=1589839187283",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarBcyan",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderBcyan.png?v=1589839193162",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarByellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderByellow.png?v=1589839195096",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarCgreen",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCgreen.png?v=1589839203129",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarCcyan",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCcyan.png?v=1589839200959",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "avatarCyellow",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FinvaderCyellow.png?v=1589839198988",
            { frameWidth: 48, frameHeight: 48 }
        );
        this.load.spritesheet(
            "ship",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2FShip%402x.png?v=1589228730678",
            { frameWidth: 60, frameHeight: 32 }
        );
        this.load.spritesheet(
            "bullet",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fbullet.png?v=1589229887570",
            { frameWidth: 32,
              frameHeight: 48
            }
        );
        this.load.spritesheet(
            "explosion",
            "https://cdn.glitch.com/f66772e3-bbf6-4f6d-b5d5-94559e3c1c6f%2Fexplosion57%20(2).png?v=1589491279459",
            { frameWidth: 48, frameHeight: 48 }
        );
    }
    create() {
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
    }
    update() {

    }
}
const config = {
    width: 1400,
    height: 750,
    backgroundColor: "#FFFFF",
    parent: "gameContainer",
    scene: [GameScene],
    physics: { default: "arcade"}
};
