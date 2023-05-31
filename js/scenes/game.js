class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, path) {
        // Crear un enemigo y agregarlo al grupo de enemigos
        super(scene, path, 0, 0, 'sprites', 'enemy');
        // Configurar la velocidad del enemigo
        this.startFollow({
            positionOnPath: true,
            duration: 15000,
            yoyo: false,
            repeat: -1,
            rotateToPath: true,
            verticalAdjust: true
        });
        // Agregar la propietat health al enemic
        this.health = 3;
    }

    update(time, delta) {
        super.update(time, delta);
        
        let tolerance = 0.01;
        let point = this.path.getPoint(1 - tolerance);
        if (this.isFollowing() && Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y) < tolerance) {
          // enemy has reached the end of the path
          this.scene.loseLife();
          this.destroy();
        }
      }
      
      
      

    // Funció per a reduir la salud del enemic
    takeDamage() {
        this.health -= 1;
        if (this.health <= 0) {
            // Si la salud del enemic es menor o igual a cero, destruir-ho
            this.scene.gold += 100;
            this.scene.goldText.setText(`Gold: ${this.scene.gold}`);
            this.destroy();
        }
    }

    // Métode par a detectar si l'enemic ha sigut colpejat per una bala
    hit(bullet) {
        // check if the bullet has reached its target
        if (Phaser.Math.Distance.Between(this.x, this.y, bullet.x, bullet.y) < 10) {
            // reduce the enemy's health
            this.takeDamage();
            
            // disable the bullet
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }
}

class Turret extends Phaser.GameObjects.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprites', 'turret');
        
        // add the turret to the scene
        scene.add.existing(this);
        
        // set the turret's firing rate
        this.fireRate = 1000;
        this.nextFire = 0;
    }

    findNearestEnemy() {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        // loop through all active enemies
        for (let i = 0; i < this.scene.enemies.getChildren().length; i++) {
            let enemy = this.scene.enemies.getChildren()[i];
            if (enemy.active) {
                let distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < nearestDistance && distance < 200) {
                    nearestEnemy = enemy;
                    nearestDistance = distance;
                }
            }
        }
        
        return nearestEnemy;
       }
       
    
    fire() {
        // get the current time
        let time = this.scene.time.now;
        
        // check if the turret can fire
        if (time > this.nextFire) {
            // find the nearest enemy
            let enemy = this.findNearestEnemy();
            
            if (enemy) {
                // create a bullet
                let bullet = this.scene.bullets.get();
                if (bullet) {
                    bullet.fire(this.x, this.y, enemy.x, enemy.y);
                }
                
                // set the time for the next shot
                this.nextFire = time + this.fireRate;
            }
        }
    }
       
}

class Bullet extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene, 0, 0, 'bullet');
        
        // set the bullet's speed
        this.speed = Phaser.Math.GetSpeed(600, 1);
    }
    
    // call this function to fire the bullet towards the target
    fire(x, y, targetX, targetY) {
        // set the bullet's position
        this.setPosition(x, y);
        
        // set the bullet's target
        this.targetX = targetX;
        this.targetY = targetY;

        // set the bullet's lifetime
        this.lifetime = 1000;
        
        // enable the bullet
        this.setActive(true);
        this.setVisible(true);
    }
    
    update(time, delta) {
        // move the bullet towards its target
        this.x += this.speed * delta * (this.targetX - this.x) / Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
        this.y += this.speed * delta * (this.targetY - this.y) / Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

        // reduce the bullet's lifetime
        this.lifetime -= delta;
        
        if (this.lifetime <= 0) {
            // disable the bullet
            this.setActive(false);
            this.setVisible(false);
        }

        // loop through all active enemies
        for (let i = 0; i < this.scene.enemies.getChildren().length; i++) {
            let enemy = this.scene.enemies.getChildren()[i];
            if (enemy.active) {
                // call the enemy's hit method
                enemy.hit(this);
            }
        }
    }
}
   


class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene');

        this.graphics;
        this.path;
        this.gold;
        this.goldText;
        this.lives;
        this.livesText;
    }

    preload(){
        this.load.atlas('sprites', '/resources/spritesheet.png', '/resources/spritesheet.json');
        this.load.image('bullet', '/resources/bullet.png');
    }

    create(){
        this.lives = 3;
        this.livesText = this.add.text(16, 64, `Lives: ${this.lives}`, { fontSize: '32px', fill: '#fff' });


        this.gold = 300;
        // create the gold text object
        this.goldText = this.add.text(16, 16, `Gold: ${this.gold}`, { fontSize: '32px', fill: '#fff' });

        this.input.on('pointerdown', this.placeTurret, this);

        this.graphics = this.add.graphics();    
    
        // the path for our enemies
        // parameters are the start x and y of our path
        this.path = this.add.path(96, -32);
        this.path.lineTo(96, 164);
        this.path.lineTo(480, 164);
        this.path.lineTo(480, 544);
        
        this.graphics.lineStyle(3, 0xffffff, 1);
        // visualize the path
        this.path.draw(this.graphics);

        let graphics = this.add.graphics();
        graphics.lineStyle(1, 0xffffff, 0.8);
        
        // draw vertical lines
        for(let i = 0; i < this.game.config.width; i += 64){
            graphics.moveTo(i, 0);
            graphics.lineTo(i, this.game.config.height);
        }
        
        // draw horizontal lines
        for(let i = 0; i < this.game.config.height; i += 64){
            graphics.moveTo(0, i);
            graphics.lineTo(this.game.config.width, i);
        }
        
        graphics.strokePath();

        // initialize the grid
        this.grid = [];
        for (let i = 0; i < this.game.config.height / 64; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.game.config.width / 64; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        // initialize the turrets group
        this.turrets = this.add.group();

        // create a pool of bullets
        this.bullets = this.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });

        // initialize the enemies group
        this.enemies = this.add.group({
            runChildUpdate: true
        });



        setInterval(() => {
            let enemy = new Enemy(this, this.path);
            this.enemies.add(enemy);
            this.add.existing(enemy);
           }, 2000);
           
        
    }

    update(){
        // loop through all active turrets
        for (let i = 0; i < this.turrets.getChildren().length; i++) {
            let turret = this.turrets.getChildren()[i];
            if (turret.active) {
                // call the turret's fire method
                turret.fire();
            }
        }
           

    }

    placeTurret(pointer) {
        if(this.gold>=200){
            // get the grid coordinates
            let i = Math.floor(pointer.y / 64);
            let j = Math.floor(pointer.x / 64);
            
            // get the center of the grid cell
            let cellCenterX = j * 64 + 32;
            let cellCenterY = i * 64 + 32;
            
            // get the points along the path
            let points = this.path.getPoints();
            
            // check if any of the points are within a certain distance of the cell center
            for (let p = 0; p < points.length; p++) {
                let dx = points[p].x - cellCenterX;
                let dy = points[p].y - cellCenterY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 32) {
                    // don't place a turret on the path
                    return;
                }
            }
            
            // check if the cell is empty
            if (this.grid[i][j] === 0) {
                // create a new turret
                let turret = new Turret(this, j * 64 + 32, i * 64 + 32);
            
                // add the turret to the group
                this.turrets.add(turret);
            
                // mark the cell as occupied
                this.grid[i][j] = 1;

                this.gold -= 200;

                // actualitzar el text de gold
                this.goldText.setText(`Gold: ${this.gold}`);
            }

        }
        
    }
       
    findNearestEnemy() {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        // loop through all active enemies
        for (let i = 0; i < this.scene.enemies.getChildren().length; i++) {
            let enemy = this.scene.enemies.getChildren()[i];
            if (enemy.active) {
                let distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (distance < nearestDistance && distance < 200) {
                    nearestEnemy = enemy;
                    nearestDistance = distance;
                }
            }
        }
        
        return nearestEnemy;
    }

    loseLife(){
        this.lives -= 1;
        this.livesText.setText(`Lives: ${this.lives}`);
    }
       
    
    
    
}