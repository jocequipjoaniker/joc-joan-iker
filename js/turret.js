class Turret extends Phaser.GameObjects.Image {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprites', 'turret');

        // afegeix la torreta a l'escena
        scene.add.existing(this);

        // estableix la cadència de foc de la torreta
        this.fireRate = 1000;
        this.nextFire = 0;
    }

    findNearestEnemy() {
        let nearestEnemy = null;
        let nearestDistance = Infinity;

        // recorre tots els enemics actius per trobar-ne un que estigui dins del rang de la torreta (200 píxels)
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
        // obté el temps actual
        let time = this.scene.time.now;
        // comprova si la torreta pot disparar
        if (time > this.nextFire) {
            // troba l'enemic més proper
            let enemy = this.findNearestEnemy();
            if (enemy) {
                // crea una bala
                let bullet = this.scene.bullets.get();
                if (bullet) {
                    bullet.fire(this.x, this.y, enemy.x, enemy.y);
                }
            // estableix el temps per al següent tret
            this.nextFire = time + this.fireRate;
            }
        }
    }
}

   export default Turret