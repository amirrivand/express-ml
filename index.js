const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pathToModel = path.join(__dirname, "model", "eMediaLibrary.js");

module.exports = async (app, appBasePath, dbModelsPath, sequelize, middleware) => {
    const validTypes = [];
    const PATH_NAME = "/mediaLibrary";
    const FILES_PER_PAGE = 12;
    const DEFAULT_PAGE = 1;
    const uploadPath = path.resolve(appBasePath, "uploads", "eml");
    const models = require(path.join(dbModelsPath, "index.js"));
    const engine = multer({
        storage: multer.diskStorage({
            destination: uploadPath,
            filename: (req, file, cb) => {
                const filename = "eue_" + req.id + "_" + file.filename;
                cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (validTypes.indexOf(file.mimetype) === -1) {
                return cb("Type not supported", false);
            }
            cb(null, true);
        },
    });

    if(!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
            recursive: true
        });
    }

    if(!fs.existsSync(path.join(dbModelsPath, "expressml.js"))) {
        fs.copyFileSync(pathToModel, path.join(dbModelsPath, "expressml.js"));
        await sequelize.sync({
            alter: false,
            force: false
        })
    }

    if(middleware) {
        app.use(PATH_NAME, middleware, (req,res,next) => next());
    }

    app.get(PATH_NAME, async (req, res, next) => {
        const limit = +req.query.limit || FILES_PER_PAGE;
        try {
            const total_files = await models.ExpressML.count();
            const files = await models.ExpressML.findAll({
                limit,
                offset: +req.query.page * limit || 0,
            });
            res.json({
                meta: {
                    page: +req.query.page || DEFAULT_PAGE,
                    total_files,
                    limit,
                    total_pages: Math.ceil(+total_files / limit)
                },
                files
            });
        } catch (err) {
            next(err);
        }
    });

    app.post(PATH_NAME, engine.any(), async (req, res, next) => {
        const files = [];
        if(req.files?.length > 0) {
            await require.files.forEach(async (file) => {
                await models.ExpressML.create({
                    filename: file.filename,
                    mimetype: file.mimetype,
                    path: file.path,
                    destination: file.destination,
                    size: file.size,
                }).then((response) => {
                    files.push(response);
                }).catch(next);
            })
        }
        return res.json(files);
    })
}