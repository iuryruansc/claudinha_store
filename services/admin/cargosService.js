const Cargo = require('../../models/Cargo');
const { modelValidation } = require('../../utils/data/data-validation');

const findCargoById = async (id) => {
    const cargo = await Cargo.findByPk(id);
    modelValidation(cargo);
    return cargo;
};

const getAllCargos = async () => {
    const cargo = await Cargo.findAll();
    return cargo;
};

const createCargo = async (marcaData) => {
    return await Cargo.create(marcaData);
};

const updateCargo = async (id, updateData) => {
    return await Cargo.update(updateData, {
        where: {
            id_cargo: id
        }
    });
};

const deleteCargo = async (id) => {
    return await Cargo.destroy({
        where: {
            id_cargo: id
        }
    });
};

module.exports = {
    findCargoById,
    getAllCargos,
    createCargo,
    updateCargo,
    deleteCargo
}