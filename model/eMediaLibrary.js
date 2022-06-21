"use strict";
const { Model } = require("sequelize");
const sizeOf = require("image-size");

module.exports = (sequelize, DataTypes) => {
	class ExpressML extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			ExpressML.afterValidate("get-image-size", (ins, options) => {
				if(String(ins.mimetype).includes("image/")) {
					const dimensions = sizeOf(ins.path);
					ins.width = dimensions.width;
					ins.height = dimensions.height;

					return ins;
				}
			})
		}
	}
	ExpressML.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			mimetype: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			path: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			destination: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			size: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			width: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			height: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "ExpressML",
			tableName: "express-media-library",
			timestamps: true,
		}
	);
	return ExpressML;
};
