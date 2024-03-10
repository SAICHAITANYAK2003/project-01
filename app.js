const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`)
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}

initialize()
//get list of players
const convertDbobjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbobjectToResponseObject(eachPlayer)),
  )
})

//get a player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`
  const player = await db.get(getPlayersQuery)
  response.send(convertDbobjectToResponseObject(player))
})

// create a new player
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayersQuery = `
  INSERT INTO 
    cricket_team(player_name,jersey_number,role)
    VALUES(
      '${playerName}',
      '${jerseyNumber}',
      '${role}',

    );`

  const dbResponse = await db.run(addPlayersQuery)
   //console.log(dbResponse)
  response.send('Player Added to Team')
})

// update a player

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE cricket_team 
  SET 
  player_name='${playerName}',
  jersey_number='${jerseyNumber}',
  role='${role}'
  WHERE player_id=${playerId}`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete a player
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team
       WHERE 
       player_id=${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
