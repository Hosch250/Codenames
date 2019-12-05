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

connection.on('ChatMessage', function (playerName, message, team) {
    let formattedMessage = `<div><span class="bold">${playerName}:</span> <span>${message}</span></div>`;

    if (team.toLowerCase() === "red") {
        let chatContainer = $('#red-chat .chat-content');
        let isScrolledToBottom = chatContainer[0].scrollTop >= (chatContainer[0].scrollHeight - chatContainer[0].offsetHeight - 2);

        chatContainer.append(formattedMessage);

        if (isScrolledToBottom) {
            chatContainer.scrollTop(chatContainer.prop("scrollHeight"));
        }
    } else {
        let chatContainer = $('#blue-chat .chat-content');
        let isScrolledToBottom = chatContainer[0].scrollTop >= (chatContainer[0].scrollHeight - chatContainer[0].offsetHeight - 2);

        chatContainer.append(formattedMessage);

        if (isScrolledToBottom) {
            chatContainer.scrollTop(chatContainer.prop("scrollHeight"));
        }
    }
});

connection.start().then(function () {
    connection.invoke("AddPlayer").catch(function (err) {
        return console.error(err.toString());
    });
}).catch(function (err) {
    return console.error(err.toString());
});

function joinGame() {
    var gameId = location.pathname.split('/').pop();
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

function postToChat(evt) {
    evt.preventDefault();

    var team = $(evt.target).closest('.chat').attr('id').replace('-chat', '');

    var gameId = location.pathname.split('/').pop();
    connection.invoke("chatMessage", parseInt(gameId), "Player X", $(evt.target).find('input').val(), team)
        .catch(function (err) {
            return console.error(err.toString());
        });
};