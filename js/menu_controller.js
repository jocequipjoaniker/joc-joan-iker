function start_game(){
	name = prompt("User name");

	sessionStorage.setItem("username", name);

	loadpage("./html/game.html");
}

function exit (){
	if (name != ""){
		alert("Leaving " + name + "'s game");
	}
	name = "";
	loadpage("../index.html");
}

document.addEventListener('DOMContentLoaded', function() {
	let tank = document.querySelector('svg');
	let canon = document.querySelector('#canon');
	let bullet = document.querySelector('#bullet');

	tank.addEventListener('mouseover', function() {
		canon.classList.add('shoot');
		bullet.classList.add('exit');
	});

	tank.addEventListener('mouseout', function() {
		canon.classList.remove('shoot');
		bullet.classList.remove('exit');
	});
});



