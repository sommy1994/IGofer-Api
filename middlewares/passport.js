const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const config = require('../config/config');
const user_model = require('../models/user');

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.login_key
}, async (payload, done) => {
    try {
        const user = await user_model.findById(payload.sub, 'first_name last_name email phone_number');
        if (!user) 
            return done(null, false)
        
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}))