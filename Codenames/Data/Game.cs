using System.Collections.Generic;

namespace Codenames.Data
{
    public class Game
    {
        public int Id { get; set; }
        public Team CurrentTeam { get; set; }
        public List<(string word, State state, bool isGuessed)> Words { get; set; }
        public int GuessesRemaining { get; set; }
        public bool PendingSpymaster { get; set; }
        public List<int> Players { get; set; }
        public bool IsOver { get; set; }
    }
}
