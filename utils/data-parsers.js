const parseIntValue = (...values) => {
    return values.map(value => parseInt(value, 10));
};

const parseFloatValue = (...values) => {
    return values.map(value => parseFloat(value));
};

const parseDateValue = (value) => {
    const parsed = new Date(value);
    return parsed;
}

module.exports = {
    parseIntValue,
    parseFloatValue,
    parseDateValue
}