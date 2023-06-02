import Enemy from "../enemy.js";
import Turret from "../turret.js";
import Bullet from "../bullet.js";

class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene');

        this.level;
        this.enemiesDefeated;
        this.graphics;
        this.path;
        this.gold;
        this.goldText;
        this.lives;
        this.livesText;
    }

    preload(){
        // carrega les imatges i sprites
        this.load.atlas('sprites', '/resources/spritesheet.png', '/resources/spritesheet.json');
        this.load.image('bullet', '/resources/bullet.png');
    }

    create(){
        // inicialitza les variables de nivell i enemics derrotats
        this.level = 1;
        this.enemiesDefeated = 0;

        // inicialitza la salut i la velocitat dels enemics
        this.enemyHealth = 0;
        this.enemySpeed = 0;

        // crea un objecte de text per mostrar el nivell actual
        this.levelText = this.add.text(450, 16, `Nivell: ${this.level}`, { fontSize: '32px', fill: '#fff' });

        // inicialitza les vides i el text de les vides
        this.lives = 3;
        this.livesText = this.add.text(120, 16, `Vides: ${this.lives}`, { fontSize: '32px', fill: '#fff' });


        // inicialitza l'or i el text de l'or
        this.gold = 300;
        // crea l'objecte de text d'or
        this.goldText = this.add.text(290, 16, `Or: ${this.gold}`, { fontSize: '32px', fill: '#fff' });

        // afegeix un esdeveniment per col·locar una torreta quan es fa clic amb el ratolí
        this.input.on('pointerdown', this.placeTurret, this);

        // crea un objecte gràfic per dibuixar el camí dels enemics
        this.graphics = this.add.graphics();

        // el camí per als nostres enemics
        // els paràmetres són l'inici x i y del nostre camí
        this.path = this.add.path(96, -32);
        this.path.lineTo(96, 164);
        this.path.lineTo(480, 164);
        this.path.lineTo(480, 544);

        // dibuixa el camí amb una línia blanca
        this.graphics.lineStyle(3, 0xffffff, 1);
        // visualitza el camí
        this.path.draw(this.graphics);

        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff, 0.8);

        // dibuixa línies verticals
        for(let i = 0; i < this.game.config.width; i += 64){
            graphics.moveTo(i, 0);
            graphics.lineTo(i, this.game.config.height);
        }

        // dibuixa línies horitzontals
        for(let i = 0; i < this.game.config.height; i += 64){
            graphics.moveTo(0, i);
            graphics.lineTo(this.game.config.width, i);
        }

        graphics.strokePath();

        // inicialitza la graella
        this.grid = [];
        for (let i = 0; i < this.game.config.height / 64; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.game.config.width / 64; j++) {
                // marca totes les cel·les com a buides
                this.grid[i][j] = 0;
            }
        }

        // inicialitza el grup de torretes
        this.turrets = this.add.group();

        // crea un grup de bales amb una mida màxima de 30
        // executa l'actualització dels fills per actualitzar les bales cada fotograma
        this.bullets =this.add.group({
            classType: Bullet,
            maxSize:30,
            runChildUpdate:true
        });

        // inicialitza el grup d'enemics amb l'actualització dels fills activada per actualitzar els enemics cada fotograma
        this.enemies=this.add.group({
            runChildUpdate:true
        });



        // estableix un interval per generar enemics cada dos segons
        setInterval(() => {
            this.spawnEnemy();
        },2000);

        // Crea un nou objecte Key per a la tecla 'P'
        this.pauseKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    update(){
        // recorre totes les torretes actives
        for(let i=0;i<this.turrets.getChildren().length;i++){
            let turret=this.turrets.getChildren()[i];
            if(turret.active){
                // crida al mètode fire de la torreta
                turret.fire();
            }
        }

        // Comprova si s'ha premut la tecla 'P'
        if(Phaser.Input.Keyboard.JustDown(this.pauseKey)){
            // Pausa el joc i llança l'escena PauseMenu
            this.scene.pause('GameScene');
            this.scene.launch('PauseMenu');
        }

        // comprova si el jugador ha derrotat prou enemics per avançar al següent nivell
        if(this.enemiesDefeated>=10){
            this.level++;
            this.enemiesDefeated=0;
            this.levelText.setText(`Nivell: ${this.level}`);
            // augmenta la dificultat aquí
            this.enemySpeed+=1000;
            this.enemyHealth+=1;
        }
    }

    spawnEnemy(){
        // crea un nou enemic amb el camí especificat com a paràmetre
        let enemy=new Enemy(this,this.path);
        // estableix la velocitat i la salut de l'enemic en funció del nivell actual
        enemy.speed=this.enemySpeed;
        enemy.health=this.enemyHealth;
        // afegeix l'enemic al grup d'enemics i a l'escena
        this.enemies.add(enemy);
        this.add.existing(enemy);
        }

    placeTurret(pointer){
        if(this.gold>=200){
            // obté les coordenades de la graella on es fa clic amb el ratolí
            let i=Math.floor(pointer.y/64);
            let j=Math.floor(pointer.x/64);

            // obté el centre de la cel·la de la graella on es fa clic amb el ratolí
            let cellCenterX=j*64+32;
            let cellCenterY=i*64+32;

            // obté els punts del camí dels enemics
            let points=this.path.getPoints();

            // comprova si algun dels punts està a una certa distància del centre de la cel·la on es fa clic amb el ratolí
            for(let p=0;p<points.length;p++){
                let dx=points[p].x-cellCenterX;
                let dy=points[p].y-cellCenterY;
                let distance=Math.sqrt(dx*dx+dy*dy);
                if(distance<32){
                    // no col·loquis una torreta al camí dels enemics
                    return;
                }
            }

            // comprova si la cel·la està buida (no hi ha cap torreta)
            if(this.grid[i][j]===0){
                // crea una nova torreta al centre de la cel·la on es fa clic amb el ratolí
                let turret=new Turret(this,j*64+32,i*64+32);

                // afegeix la torreta al grup de torretes
                this.turrets.add(turret);

                // marca la cel·la com a ocupada (hi ha una torreta)
                this.grid[i][j]=1;

                // resta l'or necessari per col·locar una torreta (200)
                this.gold-=200;

                // actualitza el text d'or per mostrar l'or restant després de col·locar una torreta.
                this.goldText.setText(`Or: ${this.gold}`);
            }

    }

    }

    loseLife(){
        // resta una vida al jugador quan un enemic arriba al final del camí.
        this.lives-=1;
        this.livesText.setText(`Vides: ${this.lives}`);

        if(this.lives===0){
            // finalitza el joc si no queden vides.
            this.gameOver();
        }
    }

    gameOver(){
        window.location.href='gameOver.html';
    }

    sceneLoad(){
        if(!this.scene.isActive('PauseMenu')){
            this.scene.pause('GameScene');
            this.scene.launch('PauseMenu');
        }else{
            this.scene.setVisible(true,'PauseMenu');
        }

    }

    enemyDefeated(){
        // augmenta el comptador d'enemics derrotats quan un enemic és derrotat.
        this.enemiesDefeated++;
        // augmenta l'or del jugador quan un enemic és derrotat.
        this.gold+=10;
        // actualitza el text d'or per mostrar l'or guanyat després de derrotar un enemic
        this.goldText.setText(`Or: ${this.gold}`);
    }
}

export default GameScene