const User = require('./userModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { NotFoundError, AuthenticationError, CustomAPIError } = require('./errors.js');

class DataAccess {

    constructor() {
        this.saltRounds = 8;
    }

    deleteUsers() {
        User.deleteUsers
    }

    async findAllUsers(page = 0, perPage = 10) {
        return await User.find({}).then(users => {
            console.log(`Found ${users.length} users`);
            return users;
        }).catch(err => console.error('Error fetching users:', err))    
    }

    async findUserById(id) {
        console.log(`Searching up user with id ${id}`);
        try {
            const objectId = new mongoose.Types.ObjectId(id);
            return await User.find({ _id: objectId }).select({ password: 1, email: 1})
            .then(users => {
                console.log(`Found ${users.length} users`);
                if (users.length == 0) {
                    throw new NotFoundError('User not found.');
                }
                return users[0];
            }).catch(err => {
                console.error('Error fetching users:', err);
                if (err instanceof NotFoundError) {
                    throw err;
                }
            });   
        } catch(err) {
            console.error('User id is invalid: ', err);
            throw new BadRequestError("Invalid user id provided");
        };
    }

    async loginUser(email, pswd) {
        console.log(`Searching user by email: ${email}`);
        return await User.find({ email: email })
            .select({ email: 1, password: 1})
            .then(users => {
                console.log(`Found ${users.length} users`);
                if (users.length == 0) {
                    throw new NotFoundError('User not found.');
                }
                return users[0];
            })
            .then(user => {
                const authValid = this._validatePassword(user, pswd);
                return { authResult: authValid, user };
            })
            .then(({ authResult, user }) => {
                if (!authResult) {
                    throw new AuthenticationError('Provided password is invalid');
                }

                return { authResult, user };
            })
            .catch(err => {
                console.error('Error auth user:', err);
                throw new AuthenticationError(err.message);
            });    
    }

    updateUserPassword(userId, pswd, newPswd) {
        console.log(`Searching user by id: ${userId}`);
        return this.findUserById(userId)
            .then(async user => {
                const authValid = await this._validatePassword(user, pswd);
                return  { authResult: authValid, user: user };
            })
            .then(({ authResult, user }) => {
                if (!authResult) {
                    throw new AuthenticationError('Provided current password is invalid');
                }

                return this._setNewPassword(user, newPswd);
            })
            .then(user => user.save())
            .then(user => console.log(`Password updated for user: ${user.email}`))
            .then(_ => true)
            .catch(err => {
                console.error('Error updating user password:', err);
                throw err;
            })    
    }

    async createUser(email, password) {

        return bcrypt.hash(password, this.saltRounds)
            .then((hash) => { 
                return new User({
                    email: email,
                    password: hash
                });
            })
            .then((user) => user.save())
            .then((user) => {
                console.log(`User created: ${user.email}`);
                return user;
            }).catch(err => {
                console.error(`Error creating user: `, err)
                throw new Cu
            });
    }

    initUsers() {
        User.collection.createIndex({ email: 1 });
        [
            new User({
                email: 'chip@nintendo.com',
                password: '123'
            }),
            new User({
                email: 'dale@nintendo.com',
                password: '234'
            })
        ].map(user => {
            return bcrypt.hash(user.password, this.saltRounds)
                .then((hash) => { 
                    user.password = hash
                    return user;
                 });
        })
        .map(userPromise => userPromise.then(user => user.save()
            .then(() => { 
                console.log(`User ${user.email} saved`);
            })
            .catch(err => console.error(`Error saving user`, err)))
        );
    }

    
    _validatePassword(user, pswd) {
        return bcrypt.compare(pswd, user.password).then(authValid => {
            console.log(`Passed auth for user ${user.email}: ${authValid}`);
            return authValid;
        }).catch(err => console.error(`Error validating pswd for user ${user.email}:`, err));  
    }

    async _setNewPassword(user, newPswd) {
        console.log(`Updating password for user ${user.email}`);
        console.log(`Salt: ${this.saltRounds}`);
        return await bcrypt.hash(newPswd, this.saltRounds).then(hash => {
            user.password = hash;
            return user;
        }).catch(err => console.error(`Failed to generate pswd hash: `, err));  
    }
}

module.exports = DataAccess;