import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';

const app = express();


const database = {
    users: [
        {
            id: '100',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date(),
        },         
        {
            id: '101',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'biscuits',
            entries: 0,
            joined: new Date(),
        }
    ]
}

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    
    // // Load hash from your password DB.
    // bcrypt.compare("apples", "$2a$10$ejzZqE6r6V7/.aAxko5DgO1rVOGa4hE04JTMPtCB8DcgZdN36/AZO", function(err, res) {
    //     // res == true
    //     console.log('first guess', res)
    // });
    // bcrypt.compare("veggies", "$2a$10$ejzZqE6r6V7/.aAxko5DgO1rVOGa4hE04JTMPtCB8DcgZdN36/AZO", function(err, res) {
    //     // res = false
    //     console.log('second guess', res)
    // });
    

    if(req.body.email === database.users[0].email && 
        req.body.password === database.users[0].password) 
    {
        res.json('success');    
    } else {
        res.status(400).json('error logging in');
    }
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body;
    bcrypt.hash(password, null, null, function(err, hash) {
        // Store hash in your password DB.
        console.log(hash);
    });
    database.users.push({
        id: '102',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date(),
    })
    res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            return res.json(user);
        }
    })
    if(!found) {
        res.status(400).json('not found');
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    })
    if(!found) {
        res.status(400).json('not found');
    }
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
