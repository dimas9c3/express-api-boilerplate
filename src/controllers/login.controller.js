import User from "../models/User";
import JwtService from "../services/jwt.service";
import * as Yup from "yup";
import { Errors } from "../utils/errors";

let loginController = {
  login: async (req, res) => {
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      });

      try {
        await schema.validate(req.body);
      } catch (error) {
        return res.status(400).json({ status: false, message: Errors.VALIDATION_FAILS, data: error });
      }

      let { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user)
        return res.status(400).send({ status: false, message: Errors.NONEXISTENT_USER });

      if (!(await user.checkPassword(password)))
        return res.status(401).send({ status: false, message: Errors.WRONG_PASSWORD });

      const token = JwtService.jwtSign(user.id);

      return res.status(200).json({ status: true, data: { user, token } });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },

  logout: async (req, res) => {
    try {
      JwtService.jwtBlacklistToken(JwtService.jwtGetToken(req));

      res.status(200).json({ msg: "Authorized" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: Errors.SERVER_ERROR });
    }
  },
};

export default loginController;
