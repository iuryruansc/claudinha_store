const dayjs = require('dayjs');
require('dayjs/locale/pt-br');
dayjs.locale('pt-br');

const formatDate = (date, format = 'DD [de] MMMM [de] YYYY [às] HH:mm') => {
    if(date == null) return;
    return dayjs(date).format(format);
};

module.exports = formatDate;
