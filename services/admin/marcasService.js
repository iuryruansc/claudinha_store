const Marca = require('../../models/marca');
const { modelValidation } = require('../../utils/data/data-validation');

const findMarcaById = async (id) => {
    const marca = await Marca.findByPk(id);
    modelValidation(marca);
    return marca;
};

const getAllMarcas = async () => {
    const marca = await Marca.findAll();
    return marca;
};

const createMarca = async (marcaData) => {
    return await Marca.create(marcaData);
};

const updateMarca = async (id, updateData) => {
    return await Marca.update(updateData, {
        where: {
            id_marca: id
        }
    });
};

const deleteMarca = async (id) => {
    return await Marca.destroy({
        where: {
            id_marca: id
        }
    });
};

module.exports = {
    findMarcaById,
    getAllMarcas,
    createMarca,
    updateMarca,
    deleteMarca
}