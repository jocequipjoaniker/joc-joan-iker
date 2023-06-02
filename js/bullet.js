class Bullet extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene, 0, 0, 'bullet');

        // estableix la velocitat de la bala
        this.speed = Phaser.Math.GetSpeed(600, 1);
    }

    // crida aquesta funció per disparar la bala cap al seu objectiu
    fire(x, y, targetX, targetY) {
        // estableix la posició de la bala
        this.setPosition(x, y);

        // estableix l'objectiu de la bala
        this.targetX = targetX;
        this.targetY = targetY;

        // estableix el temps de vida de la bala
        this.lifetime = 1000;

        // habilita la bala
        this.setActive(true);
        this.setVisible(true);
    }

    update(time, delta) {
        // mou la bala cap al seu objectiu
        this.x += this.speed * delta * (this.targetX - this.x) / Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
        this.y += this.speed * delta * (this.targetY - this.y) / Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

        // redueix el temps de vida de la bala
        this.lifetime -= delta;

        if (this.lifetime <= 0) {
            // deshabilita la bala
            this.setActive(false);
            this.setVisible(false);
        }

        // recorre tots els enemics actius
        for (let i = 0; i < this.scene.enemies.getChildren().length; i++) {
            let enemy = this.scene.enemies.getChildren()[i];
            if (enemy.active) {
                // crida al mètode hit de l'enemic
                enemy.hit(this);
            }
        }
    }
}

 export default Bullet