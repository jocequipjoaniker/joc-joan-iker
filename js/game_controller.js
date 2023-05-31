"use strict";

var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 560,
	parent: 'game_area',
	physics:{
		default: 'arcade',
		arcade: {
			gavity: {y:0},
			debug: false
		}
	},
    scene: [GameScene]
};

var game = new Phaser.Game(config);
