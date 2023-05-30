This is my backend test overview for Void:

Postman collection:
[Postman Collection](https://blue-resonance-754135.postman.co/workspace/Team-Workspace~1d1621fe-fc22-4b1d-83e0-d466924669fc/collection/27000041-c4cef10d-c1c3-498f-9570-4eab0db548f3?action=share&creator=27000041)

Instructions to run the project:

1. Clone the repository.
2. Set your own RIOT_API_KEY as an environment variable.
3. Run the yarn command.
4. Start the Docker Compose container.
5. Run `yarn start:dev`.

The project is an API with four endpoints that are connected to the Riot API. By using the Docker container, you can create a database instance that is automatically populated with tables created by TypeORM entities specified in the code.

For the leaderboard endpoint, the "summoner_rank_record" table in the database stores relevant user information. If a user instance already exists, the information is updated. Table structure:

`export class SummonerRankRecord {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  puuid: string;
  @Column()
  platform: Platform;
  @Column()
  username: string;
  @Column()
  queueType: string;
  @Column('decimal', { precision: 5, scale: 2 })
  winrate: number;
  @Column()
  leaguePoints: number;
}`


The API implements a simple caching technique where query results are stored in memory for 5 seconds. If the server receives the same request within that timeframe, the API returns the stored information.

The API also considers the queue type. The "player-summary" and "recent-matches" endpoints can be filtered using a query parameter that specifies the desired queue type. Available queue types are:

- RANKED_SOLO_5x5: 420
- RANKED_FLEX_SR: 440
- NORMAL_BLIND_PICK: 430
- NORMAL_DRAFT_PICK: 400
- ARAM: 450
- ALL: 0

Lastly, the leaderboard endpoint compares player stats based on the "RANKED_SOLO_5X5" queue. However, the information for all queue types is stored in the database, allowing for easy modification in the future.

