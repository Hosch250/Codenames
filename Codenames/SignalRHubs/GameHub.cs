using Codenames.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Codenames.SignalRHubs
{
    public class GameHub : Hub
    {
        private readonly WordService _gameService;
        private readonly IHttpContextAccessor _contextAccessor;

        public GameHub(WordService wordService, IHttpContextAccessor contextAccessor)
        {
            _gameService = wordService;
            _contextAccessor = contextAccessor;
        }

        public async override Task OnConnectedAsync()
        {
            var parameter = _contextAccessor.HttpContext.Request.Query["currentPage"].ToString();
            var group = parameter.Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (group[0] == "game" && int.TryParse(group[1], out _))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, group[1]);
            }

            if (_contextAccessor.HttpContext.Request.Cookies.ContainsKey("userid"))
            {
                _gameService.UpdatePlayer(int.Parse(_contextAccessor.HttpContext.Request.Cookies["userid"]), Context.ConnectionId);
            }
        }

        public Task<int> AddPlayer()
        {
            if (_contextAccessor.HttpContext.Request.Cookies.ContainsKey("userid"))
            {
                return Task.FromResult(int.Parse(_contextAccessor.HttpContext.Request.Cookies["userid"]));
            }

            return Task.FromResult(_gameService.AddPlayer(Context.ConnectionId));
        }

        public async Task ChatMessage(int gameId, string user, string message, string team)
        {
            await Clients.Groups(gameId.ToString()).SendAsync("ChatMessage", user, message, team);
        }

        public void JoinGame(int gameId)
        {
            _gameService.JoinGame(gameId, Context.ConnectionId);
            Clients.Caller.SendAsync("RemoveButton", $".join");
            Clients.Caller.SendAsync("AddButton", $".leave");
        }

        public void JoinGameAsSm(int gameId, int team)
        {
            _gameService.JoinGameAsSm(gameId, Context.ConnectionId, (Team)team);

            var words = _gameService.GetGame(gameId).Words
                .Select(s => new { s.word, state = s.state.ToString().ToLower() });
            Clients.Client(Context.ConnectionId).SendAsync("ShowAllWords", words);

            Clients.Caller.SendAsync("AddButton", $".leave");
            Clients.Caller.SendAsync("RemoveButton", $".join");
            Clients.Group(gameId.ToString()).SendAsync("RemoveButton", $".sm-join.{((Team)team).ToString().ToLower()}");
        }

        public void LeaveGame(int gameId)
        {
            _gameService.LeaveGame(gameId, Context.ConnectionId);
            Clients.Caller.SendAsync("RemoveButton", $".leave");
            Clients.Caller.SendAsync("AddButton", $".join");

            var game = _gameService.GetGame(gameId);
            if (!game.Players.Any(s => s.isSpyMaster && s.team == Team.Red))
            {
                Clients.Group(gameId.ToString()).SendAsync("AddButton", $".sm-join.red");
            }
            if (!game.Players.Any(s => s.isSpyMaster && s.team == Team.Blue))
            {
                Clients.Group(gameId.ToString()).SendAsync("AddButton", $".sm-join.blue");
            }
        }
    }
}
