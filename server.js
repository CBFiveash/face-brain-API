import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : '',
      password : '',
      database : 'face-brain'
    }
  });

// db.select('*').from('users')
// .then(data => {
//     console.log(data);
// });

const app = express();

// const database = {
//     users: [
//         {
//             id: '100',
//             name: 'John',
//             email: 'john@gmail.com',
//             password: 'cookies',
//             entries: 0,
//             joined: new Date(),
//         },         
//         {
//             id: '101',
//             name: 'Sally',
//             email: 'sally@gmail.com',
//             password: 'bananas',
//             entries: 0,
//             joined: new Date(),
//         }
//     ]
// }
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Success');
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid) {
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('Unable to get user'))
        } else {
            res.status(400).json('Wrong credentials')  
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
    // if(req.body.email === database.users[0].email && 
    //     req.body.password === database.users[0].password) {
    //         res.json(database.users[0]);    
    // } else {
    //     res.status(400).json('error logging in');
    // }
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body;
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
                    // res.json(database.users[database.users.length-1]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).json("Unable to register"))
    })
    // bcrypt.hash(password, null, null, function(err, hash) {
    //     // Store hash in your password DB.
    //     console.log(hash);
    // });
    // database.users.push({
    //     id: '102',
    //     name: name,
    //     email: email,
    //     entries: 0,
    //     joined: new Date(),
    // })
    


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
    // database.users.forEach(user => {
    //     if(user.id === id) {
    //         found = true;
    //         return res.json(user);
    //     }
    // })
    // if(!found) {
    //     res.status(400).json('not found');
    // }
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
    // let found = false;
    // database.users.forEach(user => {
    //     if(user.id === id) {
    //         found = true;
    //         user.entries++;
    //         return res.json(user.entries);
    //     }
    // })
    // if(!found) {
    //     res.status(400).json('not found');
    // }
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
