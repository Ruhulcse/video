const hash = require("../helpers/password_hash");
const userModel = require("../models/User");
const visitorModel = require("../models/Visitor");
const QuestionModel = require("../models/Question");
const { ErrorHandler } = require("../utils/error");
const { jwt } = require("my-helpmates");
require("dotenv").config();

const secret_key = process.env.SECRET_KEY;

module.exports.createUser = async (req, res, next) => {
  const { body, user } = req;
  if (body.password) {
    const hashPass = await hash.new(body.password);
    body.password = hashPass;
  }

  try {
    const isExist = await userModel.findOne({ email: body.email });
    if (isExist) {
      throw new ErrorHandler("User is already existed.", 409);
    }
    const newUser = await userModel.create(body);
    console.log("new users ", newUser);
    let token = "";
    const payload = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      total_word: user.total_word,
      role: user.role,
      status: user.status,
      exp: Math.floor(Date.now() / 100) + 60 * 60,
    };
    token = await jwt.encode(secret_key, payload);

    res.send({
      status: true,
      data: { token, user: newUser },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    // Use the find method with an empty object to retrieve all users
    const users = await userModel.find({});

    // Send the retrieved users in the response
    res.send({
      status: true,
      data: users,
    });
  } catch (err) {
    // Log the error and pass it to the next error handler middleware
    console.log(err.message);
    next(err);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const { params } = req;
    const user = await userModel
      .findOne({ _id: params.id })
      .select({ password: 0 });

    if (!user) {
      throw new ErrorHandler("User not found.", 404);
    }

    res.send({
      status: true,
      data: user,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.updateUserById = async (req, res, next) => {
  const { body, params } = req;
  if (body.created_by) delete body.created_by;
  try {
    const user = await userModel.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
    });
    if (!user) {
      throw new ErrorHandler("User not found.", 404);
    }
    res.send({
      status: true,
      data: user,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.deleteUserById = async (req, res, next) => {
  try {
    const { params } = req;
    await userModel.findOneAndDelete({ _id: params.id });

    res.send({
      status: true,
      message: "User deleted successfully.",
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { body } = req;
  try {
    const user = await userModel.findOne({
      email: body.email,
      status: { $ne: false },
    });
    // console.log(user);
    if (!user) {
      throw new ErrorHandler("User unauthorized!.", 401);
    }
    const verifyPass = await hash.verify(req.body.password, user.password);
    if (!verifyPass) {
      throw new ErrorHandler("User info invalid!.", 400);
    }
    let token = "";
    if (user) {
      const payload = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        total_word: user.total_word,
        role: user.role,
        status: user.status,
        exp: Math.floor(Date.now() / 100) + 60 * 60,
      };
      token = await jwt.encode(secret_key, payload);
    }
    res.send({
      status: true,
      data: { token, name: user.name, role: user.role },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.visitor = async (req, res, next) => {
  try {
    const { body } = req;
    const isIPexist = await visitorModel.findOne({
      ip_address: body.ip_address,
    });
    // console.log("api called and ", isIPexist);
    if (isIPexist) {
      // Increment total_visit by 1 for existing IP
      const updatedVisitor = await visitorModel.findOneAndUpdate(
        { ip_address: body.ip_address },
        { $inc: { total_visit: 1 } }, // $inc operator to increment total_visit
        { new: true } // Return the updated document
      );
      // console.log("Updated visitor:", updatedVisitor);
    } else {
      console.log("not exist ");
      const newUser = await visitorModel.create(body);
      console.log("new users ", newUser);
    }

    res.send({
      status: true,
      data: {},
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.stats = async (req, res, next) => {
  try {
    // Total visitor count
    const totalVisitor = await visitorModel.countDocuments();

    // Total views
    const totalViewsResult = await visitorModel.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$total_visit" },
        },
      },
    ]);

    const totalViews =
      totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    const response = {
      totalVisitor,
      totalViews,
    };

    res.status(200).json({
      status: true,
      data: response,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

module.exports.createQuestion = async (req, res, next) => {
  const { body } = req;

  try {
    const newQuestion = await QuestionModel.create(body);

    res.send({
      status: true,
      data: { Question: newQuestion },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getQuestions = async (req, res, next) => {
  try {
    const allQuestion = await QuestionModel.find({});
    res.send({
      status: true,
      data: { Question: allQuestion },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};
