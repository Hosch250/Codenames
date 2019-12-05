using Codenames.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
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

            if (group[0] == "game" && int.TryParse(group[1], out var gameId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, group[1]);
            }
        }

        public async Task ChatMessage(int gameId, string user, string message)
        {
            await Clients.Groups(gameId.ToString()).SendAsync("ChatMessage", user, message);
        }

        public async Task JoinGame(int gameId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId.ToString());
            _wordService.JoinGame(gameId, Context.ConnectionId);
        }
    }
}
