module.exports = ((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'SequelizeValidationError') {
        const validationErrors = err.errors.map(e => e.message);
        return res.status(400).json({
            error: {
                message: 'Erro de validação nos dados fornecidos.',
                details: validationErrors,
                code: 400,
            },
        });
    }

    const status = err.status || 500;
    const message = err.message || 'Um erro inesperado aconteceu.';
    res.status(status).json({
        error: {
            message: message,
            code: status,
        },
    });
});
