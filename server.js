import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '5083',
      database : 'face-brain'
    }
  });

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Success');
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if( !email || !password ) {
        return res.status(400).json('Incorrect form submission')
    }
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if(isValid) {
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Unable to get user'))
        } else {
            res.status(400).json('Wrong credentials')  
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body;
    if(!email || !name || !password) {
        return res.status(400).json('Incorrect form submission');
    } 
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json("Unable to register"))
    })
   
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    //let found = false;
    db.select('*').from('users').where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
            }
    })
    .catch(err => res.status(400).json('Error getting user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries)
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3001, () => {
    console.log('app is running on port 3001');
})

/*
/ --> res = this is working
/signin --> POST = success/fails
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/
