const Category = require('../../models/Category');
const { modelValidation } = require('../../utils/data/data-validation');

const findCategoryById = async (id) => {
    const category = await Category.findByPk(id);
    modelValidation(category);
    return category;
};

const getAllCategories = async () => {
    const category = await Category.findAll();
    return category;
};

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
    createCategory,
    updateCategory,
    deleteCategory
}