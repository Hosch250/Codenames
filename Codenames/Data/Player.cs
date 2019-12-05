using System.Collections.Generic;

namespace Codenames.Data
{
    public class Player
    {
        public int Id { get; set; }
        public string ConnectionId { get; set; }
        public List<int> GameIds { get; set; }
    }
}
