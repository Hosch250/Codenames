"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/gameHub?currentPage=" + location.pathname)
    .build();

connection.on("ShowWord", function (word, status) {
    console.log(`.grid-item.${word}`);
    console.log(document.getElementsByClassName(`grid-item ${word}`)[0]);
    console.log(document.getElementsByClassName(`grid-item ${word}`)[0].classList);
    console.log(status);
    document.getElementsByClassName(`grid-item ${word}`)[0].classList.add(status);
});

connection.start().then(function () {
}).catch(function (err) {
    console.log(err);
    return console.error(err.toString());
});

//document.getElementById("sendButton").addEventListener("click", function (event) {
//    var user = document.getElementById("userInput").value;
//    var message = document.getElementById("messageInput").value;
//    connection.invoke("SendMessage", user, message).catch(function (err) {
//        return console.error(err.toString());
//    });
//    event.preventDefault();
//});