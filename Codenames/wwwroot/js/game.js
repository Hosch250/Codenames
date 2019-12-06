"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/gameHub?currentPage=" + location.pathname)
    .build();

connection.on("ShowWord", function (word, state) {
    $(`.grid-item.word-${word}`).addClass(state);
});

connection.on("ShowAllWords", function (words) {
    for (var word of words) {
        $(`.grid-item.word-${word.word}`).addClass(word.state);
    }
});

connection.on("RemoveButton", function (identifier) {
    $(identifier).addClass("hide");
});

connection.on("AddButton", function (identifier) {
    $(identifier).removeClass("hide");
});

connection.on("GiveClue", function (team, clue, amount) {
    $('.sm-team').html(team);
    $('.sm-hint').html(clue);
    $('.sm-count').html(amount);
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
    connection.invoke("AddPlayer")
        .then(function (value) {
            document.cookie = "userid=" + value + ";path=/";
        }).catch (function (err) {
            return console.error(err.toString());
        });
}).catch(function (err) {
    return console.error(err.toString());
});

function joinGame() {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("JoinGame", parseInt(gameId))
        .then(function (value) {
            $('.current-team-hint').remove();
            $('.button-row').prepend(`<span class="current-team-hint" style="color: ${value.toLowerCase()}">You are on Team ${value}</span><br/>`);
        }).catch(function (err) {
            return console.error(err.toString());
        });
}

function joinGameAsSm(team) {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("JoinGameAsSm", parseInt(gameId), team)
        .then(function () {
            $('.sm-inputs').removeClass('hide');
        }).catch(function (err) {
            return console.error(err.toString());
        });
}

function leaveGame() {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("leaveGame", parseInt(gameId))
        .then(function () {
            $('.sm-inputs').addClass('hide');
        }).catch(function (err) {
            return console.error(err.toString());
        });
}

function postToChat(evt) {
    evt.preventDefault();

    var teamText = $(evt.target).closest('.chat').attr('id').replace('-chat', '');
    var team = teamText === "red" ? 0 : 1;

    var gameId = location.pathname.split('/').pop();
    connection.invoke("chatMessage", parseInt(gameId), parseInt(getCookie("userid")) || -1, $(evt.target).find('input').val(), team)
        .catch(function (err) {
            return console.error(err.toString());
        });
};

function playClue(evt) {
    evt.preventDefault();

    var gameId = location.pathname.split('/').pop();
    connection.invoke("giveClue", parseInt(gameId), parseInt(getCookie("userid")) || -1, $(evt.target).find('input').val(), $(evt.target).find('select').val())
        .catch(function (err) {
            return console.error(err.toString());
        });
};

function markAsClicked(word) {
    var gameId = location.pathname.split('/').pop();
    connection.invoke("playWord", parseInt(gameId), parseInt(getCookie("userid")) || -1, word)
        .catch(function (err) {
            return console.error(err.toString());
        });
}

function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var index in cookies) {
        var cookie = cookies[index];
        if (cookie.indexOf('=') === -1) {
            continue;
        }
        var keyValue = cookie.split('=');
        if (keyValue[0].trim() === name) {
            return keyValue[1].trim();
        }
    }
    return '';
}