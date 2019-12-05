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
        private readonly WordService _wordService;
        private readonly IHttpContextAccessor _contextAccessor;

        public GameHub(WordService wordService, IHttpContextAccessor contextAccessor)
        {
            _wordService = wordService;
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
        }

        public void AddPlayer()
        {
            _wordService.AddPlayer(Context.ConnectionId);
        }

        public async Task ChatMessage(int gameId, string user, string message, string team)
        {
            await Clients.Groups(gameId.ToString()).SendAsync("ChatMessage", user, message, team);
        }

        public void JoinGame(int gameId)
        {
            _wordService.JoinGame(gameId, Context.ConnectionId);
        }

        public void JoinGameAsSm(int gameId, int team)
        {
            _wordService.JoinGameAsSm(gameId, Context.ConnectionId, (Team)team);

            var words = _wordService.GetGame(gameId).Words
                .Select(s => new { s.word, state = s.state.ToString().ToLower() });
            Clients.Client(Context.ConnectionId).SendAsync("ShowAllWords", words);

            Clients.Group(gameId.ToString()).SendAsync("RemoveJoinAsSmButton", ((Team)team).ToString().ToLower());
        }

        public void LeaveGame(int gameId)
        {
            _wordService.LeaveGame(gameId, Context.ConnectionId);
        }
    }
}
