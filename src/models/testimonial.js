const db = require("../database/db");

const listTestimonialModel = (query) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT distinct u.name, u.image, h.testimony, h.rating
        FROM historys h JOIN users u ON h.users_id = u.id WHERE status_id = 1`;

    let statment = [];
    let queryLimit = "";
    let queryPage = "";

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    if (query.limit && !query.page) {
      queryLimit = "limit";
      sqlQuery += " LIMIT ? ";
      statment.push(limit);
    }
    if (query.limit && query.page) {
      queryLimit = "limit";
      queryPage = "page";

      sqlQuery += " LIMIT ? OFFSET ? ";
      const offset = (page - 1) * limit;
      statment.push(limit, offset);
    }

    let countQuery = `SELECT count(distinct users_id) AS "count" FROM historys WHERE status_id = 1`;
    db.query(countQuery, (err, result) => {
      if (err) return reject({ status: 500, err });

      let count = result[0].count;
      const newCount = count - page;
      const totalPage = Math.ceil(count / limit);

      let links = `${process.env.URL_HOST}/testimonial?`;

      let linkNext = `${links}${queryLimit}=${limit}&${queryPage}=${page + 1}`;
      let linkPrev = `${links}${queryLimit}=${limit}&${queryPage}=${page - 1}`;

      let meta = {
        next: page >= totalPage ? null : linkNext,
        prev: page === 1 || newCount < 0 ? null : linkPrev,
        limit: limit,
        page: page,
        totalPage: Math.ceil(count / limit),
        pageRemaining:
          page == 1 && newCount < 0
            ? null
            : count < limit
            ? null
            : newCount <= 0
            ? null
            : Math.ceil(newCount / limit),
        totalData: newCount < 0 ? null : count,
        totalRemainingData:
          page == 1 && newCount < 0
            ? null
            : count < limit
            ? null
            : newCount <= 0
            ? null
            : newCount,
      };
      if (!query.page || !query.limit) {
        meta = {
          next: null,
          prev: null,
          limit: null,
          page: null,
          totalData: newCount < 0 ? null : count,
        };
      }

      db.query(sqlQuery, statment, (err, result) => {
        if (err) return reject({ status: 500, err });

        resolve({ status: 200, result: { result, meta } });
      });
    });
  });
};

module.exports = {
  listTestimonialModel,
};
