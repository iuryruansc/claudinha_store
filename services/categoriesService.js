const Category = require('../models/category');
const Produto = require('../models/produto');
const { modelValidation } = require('../utils/data-validation');

const findCategoryById = async (id) => {
    const category = await Category.findByPk(id);
    modelValidation(category);
    return category;
};

const getAllCategories = async () => {
    const category = await Category.findAll();
    return category;
};

const getViewDependencies = async () => {
    const produtos = await Produto.findAll();
    return produtos;
}

const createCategory = async (categoryData) => {
    return await Category.create(categoryData);
};

const updateCategory = async (id, updateData) => {
    return await Category.update(updateData, {
        where: {
            id_categoria: id
        }
    });
};

const deleteCategory = async (id) => {
    return await Category.destroy({
        where: {
            id_categoria: id
        }
    });
};

module.exports = {
    findCategoryById,
    getAllCategories,
    getViewDependencies,
    createCategory,
    updateCategory,
    deleteCategory
}
