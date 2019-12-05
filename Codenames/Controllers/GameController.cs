using Codenames.Data;
using Microsoft.AspNetCore.Mvc;

namespace Codenames.Controllers
{
    public class GameController : Controller
    {
        private readonly WordService _wordService;

        public GameController(WordService wordService)
        {
            _wordService = wordService;
        }

        [Route("[Action]")]
        public IActionResult CreateGame()
        {
            var game = _wordService.CreateGame();

            return Redirect($"/game/{game.Id}");
        }
    }
}