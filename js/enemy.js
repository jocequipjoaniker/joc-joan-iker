class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, path) {
        // Crea un enemic i afegeix-lo al grup d'enemics
        super(scene, path, 0, 0, 'sprites', 'enemy');
        // Configura la velocitat de l'enemic
        this.startFollow({
            positionOnPath: true,
            duration: 15000 - this.scene.enemySpeed,
            yoyo: false,
            repeat: -1,
            rotateToPath: true,
            verticalAdjust: true
        });
        // Afegeix la propietat health a l'enemic
        this.health = 2;
    }

    update(time, delta) {
        super.update(time, delta);

        let tolerance = 0.01;
        let point = this.path.getPoint(1);
        if (this.isFollowing() && Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y) < tolerance) {
            // l'enemic ha arribat al final del camí
            this.scene.loseLife();
            this.destroy();
        }
    }

    // Funció per reduir la salut de l'enemic
    takeDamage() {
        this.health -= 1;
        if (this.health <= 0) {
            // crida al mètode enemyDefeated de l'escena GameScene
            this.scene.enemyDefeated();
            // Si la salut de l'enemic és menor o igual a zero, destrueix-lo
            this.destroy();
        }
    }

    // Mètode per detectar si l'enemic ha estat colpejat per una bala
    hit(bullet) {
        // comprova si la bala ha arribat al seu objectiu
        if (Phaser.Math.Distance.Between(this.x, this.y, bullet.x, bullet.y) < 10) {
            // redueix la salut de l'enemic
            this.takeDamage();
            // deshabilita la bala
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }
   }

   export default Enemy