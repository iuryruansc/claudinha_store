const Pdv = require('../models/pdv');
const { modelValidation } = require('../utils/data-validation');

const findPdvById = async (id) => {
    const pdv = await Pdv.findByPk(id);
    modelValidation(pdv);
    return pdv;
};

const getAllPdvs = async () => {
    const pdv = await Pdv.findAll();
    return pdv;
};

const createPdv = async (clienteData) => {
    return await Pdv.create(clienteData);
};

const updatePdv = async (id, updateData) => {
    return await Pdv.update(updateData, {
        where: {
            id_pdv: id
        }
    });
};

const deletePdv = async (id) => {
    return await Pdv.destroy({
        where: {
            id_pdv: id
        }
    });
};

module.exports = {
    findPdvById,
    getAllPdvs,
    createPdv,
    updatePdv,
    deletePdv
}
