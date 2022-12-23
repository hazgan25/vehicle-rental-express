const db = require("../database/db");

const addNewLocationModel = (body, id) => {
  return new Promise((resolve, reject) => {
    const { name } = body;
    const checkLocation = `SELECT * from locations WHERE name = ?`;
    db.query(checkLocation, [name], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length > 0)
        return resolve({ status: 401, result: "Location is Already" });
      if (name === "")
        return resolve({ status: 403, result: "You Must Input Locations" });

      const sqlQuery = `INSERT INTO locations SET ?`;
      body = {
        ...body,
        user_id: id,
      };
      db.query(sqlQuery, body, (err, result) => {
        if (err) return reject({ status: 500, err });

        result = { msg: `successfully added new location with name ${name}` };
        resolve({ status: 200, result });
      });
    });
  });
};

const listLocationAllModel = () => {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT * FROM locations";
    db.query(sqlQuery, (err, result) => {
      if (err) return reject({ status: 500, err });
      resolve({ status: 200, result });
    });
  });
};

const locationByIdModel = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM locations WHERE id = ? `;
    db.query(sqlQuery, id, (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length === 0)
        return resolve({ status: 400, result: "location not found" });

      resolve({ status: 200, result });
    });
  });
};

const locationByNameModel = (name) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM locations WHERE name = ? `;
    db.query(sqlQuery, name, (err, result) => {
      if (err) return reject({ status: 500, err });
      console.log(name);
      console.log(err);
      if (result.length === 0)
        return resolve({ status: 400, result: "location not found" });

      resolve({ status: 200, result });
    });
  });
};

const listLocationByRenterModel = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT * FROM locations WHERE user_id = ?`;
    db.query(sqlQuery, id, (err, result) => {
      if (err) return reject({ status: 500, err });
      resolve({ status: 200, result });
    });
  });
};

const editNameLocationModel = (body, id) => {
  return new Promise((resolve, reject) => {
    const checkIdLocation = `SELECT * FROM locations WHERE id = ${body.id} AND user_id = ${id}`;
    db.query(checkIdLocation, (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length === 0)
        return resolve({
          status: 401,
          result: { err: "You don't have a location here yet" },
        });

      const { name } = result[0];

      const sqlQuery = `UPDATE locations SET ? WHERE id = ${body.id} AND user_id = ${id}`;
      db.query(sqlQuery, body, (err, result) => {
        if (err) return reject({ status: 500, err });

        result = {
          msg: `location update was successful with previous ${name} to ${body.name}`,
        };
        resolve({ status: 200, result });
      });
    });
  });
};

module.exports = {
  addNewLocationModel,
  listLocationAllModel,
  locationByIdModel,
  locationByNameModel,
  listLocationByRenterModel,
  editNameLocationModel,
};
