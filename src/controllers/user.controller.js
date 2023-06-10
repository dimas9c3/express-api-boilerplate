import * as Yup from "yup";
import Address from "../models/Address";
import User from "../models/User";
import { Errors } from "../utils/errors";
import { Op } from "sequelize";

let userController = {
  add: async (req, res) => {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
      });

      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(400).json({ status: false, message: Errors.VALIDATION_FAILS, data: error });
      }

      const { email } = req.body;

      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists)
        return res.status(400).json({ status: false, message: Errors.USER_ALREADY_EXISTS });

      const user = await User.create(req.body);

      return res.status(200).json({ status: true, data: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  addAddress: async (req, res) => {
    try {
      const { body, userId } = req;

      const schema = Yup.object().shape({
        city: Yup.string().required(),
        state: Yup.string().required(),
        neighborhood: Yup.string().required(),
        country: Yup.string().required(),
      });

      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(400).json({ status: false, message: Errors.VALIDATION_FAILS, data: error });
      }

      const user = await User.findByPk(userId);

      let address = await Address.findOne({
        where: { ...body.address },
      });

      if (!address) {
        address = await Address.create(body.address);
      }

      await user.addAddress(address);

      return res.status(200).json({ status: true, data: user });
    } catch (error) {
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  get: async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          // id: { [Op.not]: req.userId },
          email: {
            [Op.not]: 'admin@admin.com'
          }
        },
      });

      return res.status(200).json({ status: true, data: users });
    } catch (error) {
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  find: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user)
        return res.status(400).send({ status: false, message: Errors.NONEXISTENT_USER });

      return res.status(200).json({ status: true, data: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  update: async (req, res) => {
    try {
      const schema = Yup.object().shape({
        id: Yup.string().required(),
        name: Yup.string(),
        email: Yup.string().email(),
        oldPassword: Yup.string().min(6),
        password: Yup.string()
          .min(6)
          .when("oldPassword", (oldPassword, field) => {
            if (oldPassword) {
              return field.required();
            } else {
              return field;
            }
          }),
        confirmPassword: Yup.string().when("password", (password, field) => {
          if (password) {
            return field.required().oneOf([Yup.ref("password")]);
          } else {
            return field;
          }
        }),
      });

      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(400).json({ status: false, message: Errors.VALIDATION_FAILS, data: error });
      }

      const { id, email, oldPassword } = req.body;

      const user = await User.findByPk(id);

      if (email) {
        const userExists = await User.findOne({
          where: { email },
        });

        if (userExists)
          return res.status(400).json({ status: false, message: Errors.USER_ALREADY_EXISTS });
      }

      if (oldPassword && !(await user.checkPassword(oldPassword)))
        return res.status(401).json({ error: Errors.WRONG_PASSWORD });

      const newUser = await user.update(req.body);

      return res.status(200).json({ status: true, data: newUser });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user || user.email == 'admin@admin.com')
        return res.status(400).send({ status: false, message: Errors.NONEXISTENT_USER });

      user.destroy();

      return res.status(200).json({ status: true, message: "Deleted" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },
};

export default userController;
