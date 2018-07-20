function checkAuthenticated() {
    var roles = [];

    if (arguments !== null && typeof arguments === 'object' && arguments.length > 0) {
        for (let i = 0; i < arguments.length; i++) {
            const a = arguments[i];
            if(typeof a === 'string'){
                roles.push(a.trim().toUpperCase());
            }
        }
    }

    return function (req, res, next) {
        if (req.isAuthenticated()) {
            if (roles.length > 0) {
                var user = req.user;
                var userRoles = user.roles || [];

                for (let i = 0; i < roles.length; i++) {
                    const role = roles[i];

                    if (userRoles.indexOf(role) >= 0) {
                        next();
                        break;
                    }
                }
            } else {
                next();
            }
        } else {

            return res.redirect('/login');
        }
    };
}

module.exports = checkAuthenticated;