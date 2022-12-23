const mysql = require("mysql2");
const db = require("../database/db");
const bcrypt = require("bcrypt");

const detailAllUserData = (query) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT u.id, u.name, u.email, u.image,
        u.phone, u.active_year, g.name AS 'gender', u.address,
        DATE_FORMAT(u.dob,'%d/%m/%Y') AS 'dob', r.name AS 'role'
        FROM users u
        JOIN genders g ON u.gender_id = g.id
        JOIN roles r ON u.roles_id = r.id `;

    const statment = [];

    let querySearch = "";
    let queryKeyword = "";
    let queryFilter = "";
    let queryLimit = "";
    let queryPage = "";
    let queryBy = "";
    let queryOrder = "";

    let keyword = "";
    if (query.search) {
      keyword = `%${query.search}%`;
      sqlQuery += ` WHERE u.name LIKE '${keyword}' OR u.email LIKE '${keyword}' `;
      querySearch = "search";
      queryKeyword = `${query.search}`;
    }

    let filter = "";
    if (query.gender && !query.search) {
      filter = `${query.gender}`;
      sqlQuery += ` WHERE g.id = '${filter}' `;
      queryFilter = "gender";
    }
    if (query.gender && query.search) {
      filter = `${query.gender}`;
      sqlQuery += ` AND g.id = '${filter}' `;
      queryFilter = "gender";
    }
    if (query.role && !query.search) {
      filter = `${query.role}`;
      sqlQuery += ` WHERE r.id = '${filter}' `;
      queryFilter = "role";
    }
    if (query.role && query.search) {
      filter = `${query.role}`;
      sqlQuery += ` AND r.id = '${filter}' `;
      queryFilter = "role";
    }

    const order = query.order;
    let orderBy = "";
    if (query.by && query.by.toLowerCase() == "name") orderBy = "u.name";
    if (query.by && query.by.toLowerCase() == "email") orderBy = "u.email";
    if (query.by && query.by.toLowerCase() == "id") orderBy = "u.id";
    if (order && orderBy) {
      sqlQuery += "ORDER BY ? ? ";
      statment.push(mysql.raw(orderBy), mysql.raw(order));
      queryBy = "by";
      queryOrder = "order";
    }

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

    let countQuery = `SELECT COUNT(*) AS 'count' FROM users `;

    if (query.search) {
      keyword = `%${query.search}%`;
      countQuery += ` WHERE name LIKE '${keyword}' OR email LIKE '${keyword}'  `;
    }

    if (query.gender && !query.search) {
      filter = `${query.gender}`;
      countQuery += ` WHERE gender_id = '${filter}' `;
    }
    if (query.gender && query.search) {
      filter = `${query.gender}`;
      countQuery += ` AND gender_id = '${filter}' `;
    }
    if (query.role && !query.search) {
      filter = `${query.role}`;
      countQuery += ` WHERE roles_id = '${filter}' `;
    }
    if (query.role && query.search) {
      filter = `${query.role}`;
      countQuery += ` AND roles_id = '${filter}' `;
    }

    db.query(countQuery, (err, result) => {
      if (err) return reject({ status: 500, err });

      const count = result[0].count;
      const newCount = count - page;

      let linkResult = ``;
      let links = `${process.env.URL_HOST}/admin/users?`;
      let link1 = `${querySearch}=${queryKeyword}`;
      let link2 = `${queryFilter}=${filter}`;
      let link3 = `${queryBy}=${query.by}&${queryOrder}=${order}`;

      const bySearch = query.search;
      const byFilter = query.gender || query.role;
      const byOrderBy = order && orderBy;

      if (bySearch) linkResult = links + link1;
      if (byFilter) linkResult = links + link2;
      if (byOrderBy) linkResult = links + link3;

      if (bySearch && byFilter) linkResult = `${links}${link1}&${link2}`;
      if (bySearch && byOrderBy) linkResult = `${links}${link1}&${link3}`;
      if (byFilter && byOrderBy) linkResult = `${links}${link2}&${link3}`;

      if (bySearch && byFilter && byOrderBy)
        linkResult = `${links}${link1}&${link2}&${link3}`;

      let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page + 1
      }`;
      let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page - 1
      }`;

      let meta = {
        next: newCount <= 0 ? null : linkNext,
        prev: page == 1 || newCount < 0 ? null : linkPrev,
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

        resolve({ status: 200, result: { data: result, meta } });
      });
    });
  });
};

const create = (body) => {
  return new Promise((resolve, reject) => {
    const { name, email, password } = body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const checkEmail = `SELECT * FROM users WHERE email = ?`;

    db.query(checkEmail, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (name === "" || email === "" || password === "")
        return reject({
          status: 401,
          err: "Need input name, email, And password",
        });
      if (!emailPattern.test(email))
        return reject({ status: 401, err: "Format Email Invalid" });
      if (result.length > 0)
        return reject({ status: 401, err: "Email is Already" });

      const sqlQuery = `INSERT INTO users SET ?`;
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const bodyWithHashedPassword = {
            ...body,
            password: hashedPassword,
            active_year: new Date().getFullYear(),
            gender_id: 3,
          };

          db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
            if (err) return reject({ status: 500, err });
            result = { msg: "Registration Is Successful" };
            resolve({ status: 200, result });
          });
        })
        .catch((err) => {
          reject({ status: 500, err });
        });
    });
  });
};

const editPasswordUser = (body, userInfo) => {
  return new Promise((resolve, reject) => {
    const { id, password } = body;

    const checkUser = `SELECT * from users WHERE id = ?`;

    db.query(checkUser, [id], (err, result) => {
      if (err) return reject({ status: 500, err });
      const { roles_id } = result[0];

      if (roles_id == 1 && userInfo.id !== result[0].id)
        return reject({
          status: 401,
          err: `can't change password between admins`,
        });

      const sqlQuery = "UPDATE users SET ? WHERE id = ?";
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const bodyWithHashedPassword = {
            password: hashedPassword,
          };

          db.query(sqlQuery, [bodyWithHashedPassword, id], (err, result) => {
            if (err) return reject({ status: 500, err });

            if (
              bodyWithHashedPassword.password == "" ||
              bodyWithHashedPassword.id == ""
            )
              return reject({ status: 401, err: "Must be filled" });

            result = { msg: "Change Password is Success" };
            resolve({ status: 200, result });
          });
        })
        .catch((err) => {
          reject({ status: 500, err });
        });
    });
  });
};

const deleteUserAccount = (body, userInfo) => {
  return new Promise((resolve, reject) => {
    const { id } = body;
    const checkUser = `SELECT * FROM users WHERE id = ?`;

    db.query(checkUser, [id], (err, result) => {
      if (err) return reject({ status: 500, err });
      const { roles_id } = result[0];
      if (roles_id == 1 && userInfo.id !== result[0].id)
        return reject({
          status: 401,
          err: `can't delete account between admins`,
        });

      const sqlQuery = `DELETE FROM users WHERE id = ?`;
      db.query(sqlQuery, [id], (err, result) => {
        if (err) return reject({ status: 500, err });

        result = { msg: "You have successfully deleted users account" };
        resolve({ status: 200, result });
      });
    });
  });
};

module.exports = {
  detailAllUserData,
  create,
  editPasswordUser,
  deleteUserAccount,
};
