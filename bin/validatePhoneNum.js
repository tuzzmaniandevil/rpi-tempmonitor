const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

function validate(req, res, fields) {
    var missingFields = [];

    if (fields === null || typeof fields === 'undefined') {
        return true;
    }

    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        let regionField = field + '-region';

        let val = req.body[field];
        let region = req.body[regionField];

        if (typeof val === 'string' && val.length > 0) {
            let number = phoneUtil.parseAndKeepRawInput(val, region);

            if (phoneUtil.isValidNumberForRegion(number, region)) {
                req.body[field] = phoneUtil.format(number, PNF.E164);
            } else {
                missingFields.push(field);
            }
        }
    }

    if (missingFields.length > 0) {
        res.json({
            status: false,
            message: 'Invalid phone number' + (missingFields.length > 1 ? 's' : ''),
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

module.exports.validate = validate;
module.exports.supportedCountries = supportedCountries;