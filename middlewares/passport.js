const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const config = require('../config/config');
const user_model = require('../models/user');

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
        token = req.cookies['token'];
    
    return token;
}

passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: config.login_key
}, async (payload, done) => {
    try {
        const user = await user_model.findById(payload.sub);
        if (!user) 
            return done(null, false)
        
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}))