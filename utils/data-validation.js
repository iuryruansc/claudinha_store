const modelValidation = (model) => {
    if (!model || typeof model !== 'object' || Array.isArray(model)) {
        throw buildError('Dados não encontrados.', 404);
    }
};

const stringValidation = (...strings) => {
    for (const str of strings) {
        if (!str || typeof str !== 'string' || str.trim().length === 0 || str.normalize().length === 0) {
            throw buildError('Dados inválidos, confira os dados informados.', 400);;
        }
    }
};

const numberValidation = (...numbers) => {
    for (const num of numbers) {
        if (typeof num !== 'number' || !Number.isFinite(num) || num <= 0) {
            throw buildError('Dados inválidos. Por favor, insira um número válido.', 400);
        }
    }
};

const enumValidation = (property, ...strings) => {
    if (!strings.includes(property)) {
        throw buildError('Dados inválidos. Por favor, confira os dados informados.', 400);
    }
}

const dateValidation = (...values) => {
    for (const value of values) {
        if( value == null) continue;
        if (!(value instanceof Date) || isNaN(value.getTime())) {
            throw buildError('Data inválida.', 400);
        }
    }
};

const checkAssociations = async (model, foreignKey, foreignKeyValue, errorMessage) => {
    const associatedData = await model.findAll({
        where: {
            [foreignKey]: foreignKeyValue
        }
    });

    if (associatedData.length > 0) {
        throw buildError(errorMessage, 409);
    }
};

const buildError = (message, stat) => {
    const err = new Error(message);
    err.status = stat;
    return err;
};

module.exports = {
    modelValidation,
    stringValidation,
    numberValidation,
    enumValidation,
    dateValidation,
    checkAssociations
};
