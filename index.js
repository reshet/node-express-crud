const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');

const dbConnect = require('./dbConnect');
const { handleError, BadRequestError } = require('./errors');

const express =  require('express');
const DataAccess = require('./data.js');

const app = express();
const port = process.env.port || 3000;
const passportSecretKey = process.env.PASSPORT_SECRET_KEY;
const initUsers = process.env.INIT_USERS || false;
const emailValidationRegex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

app.use(express.json());
app.use(passport.initialize());


dbConnect();
const dataAccess = new DataAccess();
initUsers && dataAccess.initUsers();

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: passportSecretKey       
}, (jwtPayload, done) => {
    dataAccess.findUserById(jwtPayload.sub)
    .then(user => done(null, user))
    .catch(err => {
        console.error("JWT auth error", err);
    });
}));

app.get("/", (req, res) => {
    res.send("Hi world!");
});

app.get("/users",  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const usersFound = await dataAccess.findAllUsers(req.params.page, req.params.perPage)
    res.send(usersFound);
});

app.get("/users/:userid", async (req, res) => {
    const user = await dataAccess.findUserById(req.params.userid);
    res.send(user);
});

app.post("/users/login", async (req, res, next) => {
    console.log(req.body);
    try {
    const { authResult, user } = await dataAccess.loginUser(req.body.email, req.body.password);
    if (authResult) {
        const payload = { sub: user.id, email: user.email };
        const token = jwt.sign(payload, passportSecretKey);
        res.json({ success: true, token: token});
    } else {
        res.json({ success: false} );
    }
    } catch(error) {
        next(error);
    }
});

app.post("/users", passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password){
            throw new BadRequestError("Email or password missing");
        }

        if (!emailValidationRegex.test(email)) {
            throw new BadRequestError("Email is not in a valid format");
        }

        if (password.length < 3) {
            throw new BadRequestError("Password should be at least 3 characters long")
        }

        dataAccess.createUser(email, password).then(newUser => {
            res.send(newUser);
        });
    } catch(error) { 
        next(error); 
    }
});

app.put("/users/:userid/password-change", async (req, res, next) => {
    try {
        dataAccess.updateUserPassword(req.params.userid, req.body.password, req.body.newPassword)
            .then(result => {
                res.send(result);
            })
            .catch(error => next(error));

    } catch(error) {
        next(error)
    }
});

app.use((error, req, res, next) => {
    // custom error handling logic
    handleError(error, res);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});