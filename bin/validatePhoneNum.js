const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

function checkRequired(req, res, fields) {
    var missingFields = [];

    if (fields === null || typeof fields === 'undefined') {
        return true;
    }

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        var val = req.body[field];

        if (phoneUtil.isValidNumber(val)) {
            req.body[field] = phoneUtil.format(val, PNF.E164);
        } else {
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

function supportedCountries() {
    var result = [];

    var supportedRegions = phoneUtil.getSupportedRegions();
    for (let i = 0; i < supportedRegions.length; i++) {
        const regionCode = supportedRegions[i];
        const ndd = phoneUtil.getNddPrefixForRegion(regionCode)
        const countryCode = phoneUtil.getCountryCodeForRegion(regionCode);
        result.push({
            regionCode: regionCode,
            ndd: ndd,
            countryCode: countryCode
        });
    }

    return result;
}

module.exports.validate = checkRequired;
module.exports.supportedCountries = supportedCountries;