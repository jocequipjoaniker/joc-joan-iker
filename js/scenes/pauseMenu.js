class PauseMenu extends Phaser.Scene {
    constructor(scene) {
        super({ key: 'PauseMenu' });
    }

    // A l'escena PauseMenu
    create() {
        // Crea un nou objecte Key per a la tecla 'P'
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        // Crea un botó o un altre objecte interactiu
        let resumeButton = this.add.text(300, 300, 'RESUME', {fontSize:50, fill: '#0f0' })
        .setInteractive()
        .on('pointerdown', () => this.resumeGame());
    }

    update(){
        // Comprova si s'ha premut la tecla 'P'
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.resumeGame();
        }
    }

    resumeGame() {
        // Reprèn l'escena GameScene
        this.scene.resume('GameScene');
        // Atura l'escena PauseMenu
        this.scene.stop('PauseMenu');
    }
}

export default PauseMenu