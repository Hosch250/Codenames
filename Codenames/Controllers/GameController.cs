using Codenames.Data;
using Microsoft.AspNetCore.Mvc;

namespace Codenames.Controllers
{
    public class GameController : Controller
    {
        [Route("[Action]")]
        public IActionResult CreateGame()
        {
            var game = WordService.CreateGame();

            return Redirect($"/game/{game.Id}");
        }
    }
}