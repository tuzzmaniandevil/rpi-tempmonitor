function checkRequired(req, res, fields) {
    var missingFields = [];

    if(fields === null || typeof fields === 'undefined'){
        return true;
    }

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        var val = req.body[field];

        if (!(typeof val === 'string' && val.length > 0)) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        res.json({
            status: false,
            message: 'Missing required fields',
            fields: missingFields
        });

        return false;
    } else {
        return true;
    }
}

module.exports = checkRequired;