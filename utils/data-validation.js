const idValidation = (...ids) => {
    for (const id of ids) {
        if (!id || isNaN(id)) {
            const err = new Error('Erro durante alteração. ID inválido');
            err.status = 400;
            throw err;
        }
    }
};

const modelValidation = (model) => {
    if (!model) {
        const err = new Error('Dados não encontrados');
        err.status = 404;
        throw err;
    }
};

const stringValidation = (...strings) => {
    for (const str of strings) {
        if (!str || typeof str !== 'string' || str.trim().length === 0) {
            const err = new Error('Dados inválidos, confira os dados informados.');
            err.status = 400;
            throw err;
        }
    }
};

const numberValidation = (...numbers) => {
    for (const num of numbers) {
        if (typeof num !== 'number' || isNaN(num) || num === null) {
            const err = new Error('Dados inválidos. Por favor, insira um número válido.');
            err.status = 400;
            throw err;
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
        const err = new Error(errorMessage);
        err.status = 409;
        throw err;
    }
};

module.exports = {
    idValidation,
    modelValidation,
    stringValidation,
    numberValidation,
    checkAssociations
};
