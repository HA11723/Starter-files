import express from 'express';
import { client, connection } from './database.js';
const app = express();

app.set('view engine', 'ejs');

let server;
connection.then(()=>{
  console.log("Successful connection to database!");
  server = app.listen(3000, ()=>console.log('Server listening.'));
})
.catch(e=>console.error(e));

const database = client.db('assignment-5');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))

app.get('/', (req,res)=>{
    res.render('index', { message: "" });
});

app.post('/tv-shows', async (req, res) => {
  const { title, year, rating, firstActor, secondActor } = req.body;

  const newShow = {
    title,
    year: parseInt(year),
    rating: parseFloat(rating),
    actors: [firstActor, secondActor],
  };

  try {
    await database.collection('tv-shows').insertOne(newShow);
    res.render('index', { message: `Successfully added show ${title}` });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
});


app.get('/tv-shows', async (req, res) => {
  const { title, rangeStart, rangeEnd, actor } = req.query;
  let query = {};

  if (title) {
    query.title = { $regex: new RegExp(`^${title}$`, 'i') };
  }

  if (rangeStart || rangeEnd) {
    query.year = {};
    if (rangeStart) query.year.$gte = parseInt(rangeStart);
    if (rangeEnd) query.year.$lte = parseInt(rangeEnd);
  }

  if (actor) {
    query.actors = { $regex: new RegExp(actor, 'i') };
  }

  try {
    const results = await database.collection('tv-shows')
      .find(query)
      .sort({ rating: -1 })
      .toArray();

    res.render('search-results', { searchResults: results });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
});

