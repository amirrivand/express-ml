const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {Op} = require("sequelize");
const bodyParser = require("body-parser");

const pathToModel = path.join(__dirname, "model", "eMediaLibrary.js");

module.exports = async (app, dbModelsPath, middleware) => {
    const validTypes = [];
    const PATH_NAME = "/mediaLibrary";
    const FILES_PER_PAGE = 12;
    const DEFAULT_PAGE = 1;
    const uploadPath = path.join(process.cwd(), "uploads", "eml");
    const modelPath = path.join(dbModelsPath, "expressml.js");
    const models = require(path.join(dbModelsPath, "index.js"));
    const engine = multer({
        storage: multer.diskStorage({
            destination: uploadPath,
            filename: (req, file, cb) => {
                const filename = "eue_"+ file.originalname;
                cb(null, filename);
            },
        }),
    });

    if(!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
            recursive: true
        });
    }

    if(!fs.existsSync(modelPath)) {
        fs.copyFileSync(pathToModel, modelPath);
        await models.sequelize.sync({
            alter: false,
            force: false
        })
    }

    if(middleware) {
        app.use(PATH_NAME, middleware, (req,res,next) => next());
    }

    app.use(PATH_NAME, bodyParser.json());
    app.use(PATH_NAME, bodyParser.urlencoded({ extended: false}));

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
        if(req.files.length === 0) {
            return res.json(null);
        }
        const mappedFiles = req.files.map(file => ({
            filename: file.filename,
            mimetype: file.mimetype,
            path: file.path,
            destination: file.destination,
            size: file.size,
        }))
        const response = await models.ExpressML.bulkCreate(mappedFiles);
        if(response.length === 1) {
            return res.json(response[0]);
        }
        res.json(response);
        
    });

    app.delete(PATH_NAME + "/:id", async (req,res, next) => {
        try {
            const file = await models.findByPk(req.params.id);
            fs.unlinkSync(path.join(uploadPath, file.filename));
            await file.destroy();
            res.json({
                message: "فایل انتخاب شده حذف گردید",
                severity: "success"
            })
        } catch (err) {
            next(err);
        }
    })
}