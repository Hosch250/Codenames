"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/gameHub?currentPage=" + location.pathname)
    .build();

connection.on("ShowWord", function (word, status) {
    document.getElementsByClassName(`grid-item ${word}`)[0].classList.add(status);
});

connection.on("ShowAllWords", function (words) {
    for (var word of words) {
        document.getElementsByClassName(`grid-item ${word.word}`)[0].classList.add(word.state);
    }
});

connection.start().then(function () {
}).catch(function (err) {
    return console.error(err.toString());
});

connection.invoke("AddPlayer").catch(function (err) {
    return console.error(err.toString());
});

function joinGame() {
    var gameId = location.pathname.split('/').pop();
    console.log(gameId);
    connection.invoke("JoinGame", parseInt(gameId)).catch(function (err) {
        return console.error(err.toString());
    });
}

function joinGameAsSm(team) {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("JoinGameAsSm", parseInt(gameId), team).catch(function (err) {
        return console.error(err.toString());
    });
}

function leaveGame() {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("leaveGame", parseInt(gameId)).catch(function (err) {
        return console.error(err.toString());
    });
}