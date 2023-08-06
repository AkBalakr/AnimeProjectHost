// Something to be aware of is that DB functions are run async, meaning that the code won't wait for one to finish before moving onto the another
// Might be worth looking into callbacks and promises if this becomes an issue. I've been commenting out code and only running one DB command
// at a time because doing so otherwise results in errors

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err)=> {
	if (err) return console.err(err.message);
})

//Creates a table with the schema (id, title, genre, ranking). id is automatically generated when an entry is inserted into the DB
createTable = `CREATE TABLE anime (id INTEGER PRIMARY KEY, title, genre, ranking)`;
//Template for inserting animes. Question marks will be replaced with values during db.run()
insertAnime = `INSERT INTO anime (title,genre, ranking) VALUES (?,?,?)`
//Selects all entries from the anime table
selectAnime = `SELECT * FROM anime`;

// db.run("DROP TABLE anime");

//Create a database
db.run(createTable);

//Insert an anime into the database
db.run(insertAnime, ["One Punch Man", "Action", 9],
(err) => {
	if (err) return console.error(err.message);
});

//Retrieve all entries from anime table and print them to console
db.all(selectAnime, [], (err, rows) => {
	if (err) return console.error(err.message);
	rows.forEach(row => {
		console.log(row);
	})
})


