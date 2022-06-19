"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class ExpressML extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	ExpressML.init(
		{
			filename: {
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
