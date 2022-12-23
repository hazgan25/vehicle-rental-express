const mysql = require("mysql2");
const db = require("../database/db");
const fs = require("fs");

const addNewVehicleModel = (body, files, id) => {
  return new Promise((resolve, reject) => {
    const { locations_id, types_id, name, description, price } = body;
    const numberPatern = /^[0-9]*$/;
    const checkLocation = `SELECT * FROM locations Where id = ?`;

    db.query(checkLocation, [locations_id], (err, result) => {
      if (err) {
        deleteImages(files);
        return reject(err);
      }

      if (name === "")
        return resolve({
          status: 400,
          result: { err: "Please Input Vehicle Name" },
        });
      if (description === "")
        return resolve({
          status: 400,
          result: { err: "Please Input description" },
        });
      if (price === "")
        return resolve({ status: 400, result: { err: "Please Input Price" } });
      if (types_id === "")
        return resolve({
          status: 400,
          result: { err: "Please Input Type Vehicle" },
        });
      if (!numberPatern.test(price))
        return resolve({ status: 400, result: { err: "Price Must Number" } });
      if (result.length === 0)
        return resolve({
          status: 400,
          result: { err: `You haven't added a location` },
        });

      const checkType = `SELECT * FROM types WHERE id = ?`;
      db.query(checkType, [types_id], (err, result) => {
        if (err) {
          deleteImages(files);
          return reject(err);
        }

        if (result.length === 0)
          return resolve({ status: 400, result: { err: `Wrong Types` } });

        body = {
          ...body,
          user_id: id,
        };

        if (files.length === 0)
          return resolve({
            status: 400,
            result: { err: "Please Add an Images" },
          });
        const sqlQuery = `INSERT INTO vehicles SET ?`;
        db.query(sqlQuery, body, (err, result) => {
          if (err) {
            deleteImages(files);
            return reject(err);
          }

          const idVehicle = result.insertId;
          let values = "VALUES";
          const imgArr = [];

          files.forEach((data, idx) => {
            if (idx !== files.length - 1) {
              values += ` ( ${id}, ?, ?), `;
            } else {
              values += ` ( ${id}, ?, ?) `;
            }
            imgArr.push(data.filename, idVehicle);
          });
          const imgQuery = `INSERT INTO vehicles_img (user_id, images, vehicle_id) ${values}`;

          db.query(imgQuery, imgArr, (err, result) => {
            if (err) {
              deleteImages(files);
              return reject(err);
            }

            result = { msg: `Success Add new Vehicle with name ${body.name}` };
            resolve({ status: 200, result });
          });
        });
      });
    });
  });
};

const listVehicleModels = (query) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT v.id, v.name AS "vehicle", l.name,
        t.name AS "types", v.stock,
        (SELECT CAST(AVG(rating) AS DECIMAL(10,1)) FROM historys where Vehicles_id = v.id) AS rating
        , v.price, u.name AS "owner",
        (SELECT images FROM vehicles_img WHERE vehicle_id = v.id LIMIT 1) AS image
        FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id 
        JOIN locations l ON v.locations_id = l.id
        `;

    const statment = [];

    // var seacrh
    let querySearch = "";
    let queryKeyword = "";
    // var filter
    let queryFilterType = "";
    let queryFilterLocation = "";
    // orderby
    let queryBy = "";
    let queryOrder = "";
    // limit & page
    let queryLimit = "";
    let queryPage = "";

    // fitur search
    let keyword = "";
    if (query.search) {
      keyword = `%${query.search}%`;
      sqlQuery += ` WHERE v.name LIKE '${keyword}' OR t.name LIKE '${keyword}' OR l.name LIKE '${keyword}' `;
      querySearch = "search";
      queryKeyword = `${query.search}`;
    }

    // fitur filter
    let filterType = "";
    let filterLocation = "";
    // solo
    if (query.type && !query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      sqlQuery += ` WHERE t.id = '${filterType}' `;
    }
    if (query.location && !query.search && !query.type) {
      filterLocation = `${query.location}`;
      queryFilterLocation = "location";
      sqlQuery += ` WHERE l.id = '${filterLocation}' `;
    }
    // duo
    if (query.type && query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      sqlQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && query.search && !query.type) {
      filterLocation = `${query.location}`;
      queryFilterLocation = "location";
      sqlQuery += ` AND l.id = '${filterLocation}' `;
    }
    if (query.type && query.location && !query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      sqlQuery += ` WHERE t.id = ${filterType} AND l.id = ${filterLocation} `;
    }
    // trio
    if (query.type && query.location && query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      sqlQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }

    // fitur order by
    const order = query.order;
    let orderBy = "";
    if (query.by && query.by.toLowerCase() == "vehicles") orderBy = "v.name";
    if (query.by && query.by.toLowerCase() == "price") orderBy = "v.price";
    if (query.by && query.by.toLowerCase() == "type") orderBy = "t.name";
    if (query.by && query.by.toLowerCase() == "locations") orderBy = "l.name";
    if (query.by && query.by.toLowerCase() == "rating") orderBy = "rating";
    if (query.by && query.by.toLowerCase() == "id") orderBy = "v.id";
    if (order && orderBy) {
      sqlQuery += " ORDER BY ? ? ";
      statment.push(mysql.raw(orderBy), mysql.raw(order));
      queryBy = "by";
      queryOrder = "order";
    }

    // fitur limit page/offset - pagination
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

    let countQuery = ` SELECT COUNT(*) AS "count" FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id
        JOIN locations l ON v.locations_id = l.id
        `;

    if (query.search) {
      keyword = `%${query.search}%`;
      countQuery += ` AND v.name LIKE "${keyword}" `;
    }
    // solo
    if (query.type && !query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      countQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && !query.search && !query.type) {
      filterLocation = `${query.location}`;
      countQuery += ` AND l.id = '${filterLocation}' `;
    }
    // duo
    if (query.type && query.search && !query.location) {
      filterType = `${query.type}`;
      countQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && query.search && !query.type) {
      filterLocation = `${query.location}`;
      countQuery += ` AND l.id = '${filterLocation}' `;
    }
    if (query.type && query.location && !query.search) {
      filterType = `${query.type}`;
      countQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }
    // trio
    if (query.type && query.location && query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      countQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }

    db.query(countQuery, (err, result) => {
      if (err) return reject({ status: 500, err });

      const count = result[0].count;
      const newCount = count - page;
      const totalPage = Math.ceil(count / limit);

      let linkResult = "";
      let links = `${process.env.URL_HOST}/vehicles?`;
      let link1 = `${querySearch}=${queryKeyword}`;
      let link2 = `${queryFilterType}=${filterType}`;
      let link3 = `${queryFilterLocation}=${filterLocation}`;
      let link4 = `${queryBy}=${query.by}&${queryOrder}=${order}`;

      const bySearch = query.search;
      const byFilterType = query.type;
      const byFilterLocation = query.location;
      const byOrder = order && orderBy;

      if (bySearch) linkResult = links + link1;
      if (byFilterType) linkResult = links + link2;
      if (byFilterLocation) linkResult = links + link3;
      if (byOrder) linkResult = links + link4;

      if (bySearch && byFilterType) linkResult = `${links}${link1}&${link2}`;
      if (bySearch && byFilterLocation)
        linkResult = `${links}${link1}&${link3}`;
      if (byFilterType && byFilterLocation)
        linkResult = `${links}${link2}${link3}`;

      if (bySearch && byOrder) linkResult = `${links}${link1}&${link4}`;
      if (byFilterType && byOrder) linkResult = `${links}${link2}&${link4}`;
      if (byFilterLocation && byOrder) linkResult = `${links}${link3}&${link4}`;

      if (bySearch && byFilterType && byOrder)
        linkResult = `${links}${link1}&${link2}${link4}`;
      if (bySearch && byFilterLocation && byOrder)
        linkResult = `${links}${link1}&${link3}&${link4}`;
      if (byFilterType && byFilterLocation && byOrder)
        linkResult = `${links}${link2}&${link3}&${link4}`;

      if (bySearch && byFilterType && byFilterLocation & byOrder)
        linkResult = `${links}${link1}&${link2}&${link3}&${link4}`;

      let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page + 1
      }`;
      let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page - 1
      }`;

      let meta = {
        next: page >= totalPage ? null : linkNext,
        prev: page == 1 || newCount < 0 ? null : linkPrev,
        limit: limit,
        page: page,
        totalPage: totalPage,
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

const listVehicleByRenterIdModel = (idRenter, query) => {
  return new Promise((resolve, reject) => {
    let sqlQuery = `SELECT v.id, v.name AS "vehicle", l.name AS "location",
        t.name AS "types", v.stock,
        (SELECT CAST(AVG(rating) AS DECIMAL(10,1)) FROM historys where Vehicles_id = v.id) AS rating
        , v.price
        FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id 
        JOIN locations l ON v.locations_id = l.id
        WHERE v.user_id = ${idRenter}`;

    const statment = [];

    // var seacrh
    let querySearch = "";
    let queryKeyword = "";
    // var filter
    let queryFilterType = "";
    let queryFilterLocation = "";
    // orderby
    let queryBy = "";
    let queryOrder = "";
    // limit & page
    let queryLimit = "";
    let queryPage = "";

    // fitur search
    let keyword = "";
    if (query.search) {
      keyword = `%${query.search}%`;
      sqlQuery += ` AND v.name LIKE "${keyword}" `;
      querySearch = "search";
      queryKeyword = `${query.search}`;
    }

    // fitur filter
    let filterType = "";
    let filterLocation = "";
    // solo
    if (query.type && !query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      sqlQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && !query.search && !query.type) {
      filterLocation = `${query.location}`;
      queryFilterLocation = "location";
      sqlQuery += ` AND l.id = '${filterLocation}' `;
    }
    // duo
    if (query.type && query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      sqlQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && query.search && !query.type) {
      filterLocation = `${query.location}`;
      queryFilterLocation = "location";
      sqlQuery += ` AND l.id = '${filterLocation}' `;
    }
    if (query.type && query.location && !query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      sqlQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }
    // trio
    if (query.type && query.location && query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      sqlQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }

    // fitur order by
    const order = query.order;
    let orderBy = "";
    if (query.by && query.by.toLowerCase() == "vehicles") orderBy = "v.name";
    if (query.by && query.by.toLowerCase() == "price") orderBy = "v.price";
    if (query.by && query.by.toLowerCase() == "type") orderBy = "t.name";
    if (query.by && query.by.toLowerCase() == "locations") orderBy = "l.name";
    if (query.by && query.by.toLowerCase() == "rating") orderBy = "rating";
    if (query.by && query.by.toLowerCase() == "id") orderBy = "v.id";
    if (order && orderBy) {
      sqlQuery += " ORDER BY ? ? ";
      statment.push(mysql.raw(orderBy), mysql.raw(order));
      queryBy = "by";
      queryOrder = "order";
    }

    // fitur limit page/offset - pagination
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

    let countQuery = `SELECT COUNT(*) AS "count" FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id
        JOIN locations l ON v.locations_id = l.id
        WHERE v.user_id = ${idRenter}
        `;

    if (query.search) {
      keyword = `%${query.search}%`;
      countQuery += ` AND v.name LIKE "${keyword}" `;
    }
    // solo
    if (query.type && !query.search && !query.location) {
      filterType = `${query.type}`;
      queryFilterType = "type";
      countQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && !query.search && !query.type) {
      filterLocation = `${query.location}`;
      countQuery += ` AND l.id = '${filterLocation}' `;
    }
    // duo
    if (query.type && query.search && !query.location) {
      filterType = `${query.type}`;
      countQuery += ` AND t.id = '${filterType}' `;
    }
    if (query.location && query.search && !query.type) {
      filterLocation = `${query.location}`;
      countQuery += ` AND l.id = '${filterLocation}' `;
    }
    if (query.type && query.location && !query.search) {
      filterType = `${query.type}`;
      countQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }
    // trio
    if (query.type && query.location && query.search) {
      filterType = `${query.type}`;
      filterLocation = `${query.location}`;
      countQuery += ` AND t.id = ${filterType} AND l.id = ${filterLocation} `;
    }

    db.query(countQuery, (err, result) => {
      if (err) return reject({ status: 500, err });

      const count = result[0].count;
      const newCount = count - page;
      const totalPage = Math.ceil(count / limit);

      let linkResult = "";
      let links = `${process.env.URL_HOST}/vehicles?`;
      let link1 = `${querySearch}=${queryKeyword}`;
      let link2 = `${queryFilterType}=${filterType}`;
      let link3 = `${queryFilterLocation}=${filterLocation}`;
      let link4 = `${queryBy}=${query.by}&${queryOrder}=${order}`;

      const bySearch = query.search;
      const byFilterType = query.type;
      const byFilterLocation = query.location;
      const byOrder = order && orderBy;

      if (bySearch && byFilterType && byFilterLocation & byOrder)
        linkResult = `${links}${link1}&${link2}&${link3}&${link4}`;

      let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page + 1
      }`;
      let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${
        page - 1
      }`;

      let meta = {
        next: page >= totalPage ? null : linkNext,
        prev: page == 1 || newCount < 0 ? null : linkPrev,
        limit: limit,
        page: page,
        totalPage: totalPage,
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

const vehicleDetailModel = (id) => {
  return new Promise((resolve, reject) => {
    const imgQuery = `SELECT images from vehicles_img WHERE vehicle_id = ?`;
    db.query(imgQuery, [id], (err, result) => {
      if (err) return reject({ status: 500, err });

      const images = [];
      result.forEach((data) => {
        images.push(data);
      });
      const sqlQuery = `SELECT v.id, v.name AS "vehicle", v.description, l.name AS "location", locations_id,
            (SELECT CAST(AVG(rating) AS DECIMAL(10,1)) FROM historys where Vehicles_id = v.id) AS rating,
            stock, types_id, t.name AS "types", v.price, u.name AS "owner_name",  u.id AS "owner_id"
            FROM vehicles v
            JOIN types t ON v.types_id = t.id
            JOIN users u ON v.user_id = u.id
            JOIN locations l ON v.locations_id = l.id
            WHERE v.id = ?`;

      db.query(sqlQuery, [id], (err, result) => {
        if (err) return reject({ status: 500, err });

        result = { ...result[0], ...{ images } };
        resolve({ status: 200, result });
      });
    });
  });
};

// update vehicles Patch
const updateVehicles = (body, id, files, params) => {
  return new Promise((resolve, reject) => {
    const { locations_id, types_id, price } = body;
    const numberPatern = /^[0-9]*$/;

    const checkIdRenter = `SELECT * FROM vehicles WHERE id = ? AND user_id = ${id}`;
    db.query(checkIdRenter, [params.id], (err, result) => {
      if (err) {
        deleteImages(files);
        return reject(err);
      }

      if (result.length === 0)
        return resolve({
          status: 400,
          result: { err: `You are not the owner of this vehicle` },
        });
      if (price === "")
        return resolve({ status: 400, result: { err: "Please Input Price" } });
      if (!numberPatern.test(price))
        return resolve({ status: 400, result: { err: "Wrong format price" } });

      const checkLocation = `SELECT * FROM locations WHERE id = ?`;

      db.query(checkLocation, [locations_id], (err, result) => {
        if (err) {
          deleteImages(files);
          return reject(err);
        }
        if (result.length === 0)
          return resolve({
            status: 400,
            result: { err: `You haven't created a location id yet` },
          });

        const checkType = `SELECT * FROM types WHERE id = ?`;
        db.query(checkType, [types_id], (err, result) => {
          if (err) {
            deleteImages(files);
            return reject(err);
          }
          if (result.length === 0)
            return resolve({ status: 400, result: { err: `Wrong Types` } });

          const totalFiles = files.length;
          const timeStamp = new Date();

          body = {
            ...body,
            update_at: timeStamp,
          };

          const checkImage = "SELECT * FROM vehicles_img where vehicle_id = ?";
          db.query(checkImage, [params.id], (err, result) => {
            if (err) {
              if (files.length !== 0) {
                deleteImages(files);
              }
              return reject(err);
            }

            const imgArr = result;

            if (result.length > 0) {
              imgArr.forEach((data) => {
                fs.unlink(`public/img/vehicles/${data.images}`, (err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              });
            }

            const sqlQuery = `UPDATE vehicles SET ? WHERE id = ? AND user_id = ${id}`;
            db.query(sqlQuery, [body, params.id], (err, result) => {
              if (err) {
                if (files.length !== 0) {
                  deleteImages(files);
                }
                return reject(err);
              }

              result = { msg: "Update Success", data: body };
              if (files.length === 0) {
                return resolve({ status: 200, result });
              }

              const deleteFiles = `DELETE FROM vehicles_img WHERE vehicle_id = ? LIMIT ?`;
              db.query(deleteFiles, [params.id, totalFiles], (err) => {
                if (err) {
                  if (files.length !== 0) {
                    deleteImages(files);
                  }
                  return reject(err);
                }
              });

              let values = "VALUES";
              const imgArr = [];
              const picImg = [];

              files.forEach((data, idx) => {
                if (idx !== files.length - 1) {
                  values += ` (?, ?), `;
                } else {
                  values += ` (?, ?) `;
                }
                imgArr.push(data.filename, params.id);
                picImg.push(data.filename);
              });

              const imgQuery = `INSERT INTO vehicles_img (images, vehicle_id) ${values}`;
              db.query(imgQuery, imgArr, (err, result) => {
                if (err) {
                  if (files.length !== 0) {
                    deleteImages(files);
                  }
                }
                result = {
                  msg: "Update is Success With Image",
                  data: body,
                  picImg,
                };
                resolve({ status: 200, result });
              });
            });
          });
        });
      });
    });
  });
};

const delVehicleById = (idVehicle, id) => {
  return new Promise((resolve, reject) => {
    const checkId = `SELECT * FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`;
    db.query(checkId, (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length === 0)
        return reject({
          status: 401,
          err: "You are not the owner of this vehicle",
        });

      const deleteImgQuery = `DELETE FROM vehicles_img WHERE vehicle_id = ${idVehicle}`;
      db.query(deleteImgQuery, (err) => {
        if (err) return reject({ status: 500, err });

        const deleteHistoryQuery = `DELETE FROM historys WHERE vehicles_id = ${idVehicle}`;
        db.query(deleteHistoryQuery, (err) => {
          if (err) return reject({ status: 500, err });

          const sqlQuery = `DELETE FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`;
          db.query(sqlQuery, (err, result) => {
            if (err) return reject({ status: 500, err });

            result = { msg: "success delete vehicle" };
            resolve({ status: 200, result });
          });
        });
      });
    });
  });
};

const deleteImages = (files) => {
  files.forEach((element) => {
    fs.unlink(`public/img/vehicles/${element}`, (err) => {
      if (err) {
        console.log(err);
      }
    });
  });
};

module.exports = {
  addNewVehicleModel,
  listVehicleModels,
  listVehicleByRenterIdModel,
  vehicleDetailModel,
  updateVehicles,
  delVehicleById,
};
