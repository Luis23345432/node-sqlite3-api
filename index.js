const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 8001;

const db = new sqlite3.Database('./movies.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the movies database.');
});

app.use(express.json());

// Endpoints CRUD
app.get('/movies', (req, res) => {
    db.all('SELECT * FROM movies', (err, rows) => {
        if (err) {
            res.status(500).send('Internal server error');
        } else {
            res.send(rows);
        }
    });
});

app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send('Internal server error');
        } else if (!row) {
            res.status(404).send('Movie not found');
        } else {
            res.send(row);
        }
    });
});

app.post('/movies', (req, res) => {
    const { title, director, year } = req.body;
    if (!title || !director || !year) {
        res.status(400).send('Title, director, and year are required');
    } else {
        const sql = 'INSERT INTO movies(title, director, year) VALUES (?, ?, ?)';
        db.run(sql, [title, director, year], function(err) {
            if (err) {
                res.status(500).send('Internal server error');
            } else {
                res.status(201).send({ id: this.lastID, title, director, year });
            }
        });
    }
});

app.put('/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, director, year } = req.body;
    const sql = 'UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?';
    db.run(sql, [title, director, year, id], function(err) {
        if (err) {
            res.status(500).send('Internal server error');
        } else if (this.changes === 0) {
            res.status(404).send('Movie not found');
        } else {
            res.status(200).send({ id, title, director, year });
        }
    });
});

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM movies WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).send('Internal server error');
        } else if (this.changes === 0) {
            res.status(404).send('Movie not found');
        } else {
            res.status(204).send();
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
});
