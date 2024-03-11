const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_shop_db');

const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('dev'));


//GET all flavors
app.get('/api/flavors', async(req, res, next)=>{
  try{
    const SQL = `
      SELECT *
      FROM flavors
      ORDER BY is_favorite
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  }
  catch (error) {
    next(error);
  }
});

// GET single flavor by id
app.get('/api/flavors/:id', async(req, res, next)=> {
  try{
    const SQL = `
      SELECT *
      FROM flavors
      WHERE id = $1
    `;
    const respond = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  }
  catch(error){
    next(error);
  }
});

// POST new flavor
app.post('api/flavors', async(req, res,next)=> {
  try{
    const SQL = `
      INSERT INTO flavors (txt)
      VALUES (pistachio)
      RETURNING *
    `;
    const response = await client.query(SQL, [req.body.txt]);
    res.send(response.rows[0]);
  }
  catch (error){
    next(error);
  }
})

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ messahe: err.message || err});
});

// DELETE flavor
app.delete('api/flavors/:id', async(req, res, next)=> {
  try{
    const SQL = `
      DELETE
      FROM flavors
      WHERE id = $1
    `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  }
  catch (error){
    next(error);
  }
});

// PUT edit information
app.put('app/flavors/:id', async(req, res, next)=> {
  try{
    const SQL = `
      UPDATE flavors
      SET txt=$vanilla bean
      WHERE id = $1
      RETURNING *
    `;
    const response = await client.query(SQL, [req.body.txt, req.params.id]);
    res.send(respinse.rows[0]);
  }
  catch (error){
    next(error);
  }
});

const init = async()=> {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');

  let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      txt VARCHAR (100) NOT NULL,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `;
  await client.query(SQL);
  console.log('tables created');

  SQL = `
    INSERT INTO flavors(txt) VALUES('vanilla');
    INSERT INTO flavors(txt) VALUES('chocolate');
    INSERT INTO flavors(txt, is_favorite) VALUES('salted caramel', true);
    INSERT INTO flavors(txt) VALUES('mint chocolate chip');
    INSERT INTO flavors(txt) VALUES('cookies & cream');
    `;
  await client.query(SQL);
  console.log('data seeded');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));

}

init();



