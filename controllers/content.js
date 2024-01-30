const contentModel = require("../models/Content");
const contentDetailsModel = require("../models/ContentDetails");
const { ErrorHandler } = require("../utils/error");
const { generateCode } = require("../helpers/code_generator");
const XLSX = require("xlsx");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports.uploadContent = async (req, res, next) => {
  const { user, file } = req;
  try {
    const dt = XLSX.readFile("public/uploads/" + file.filename);
    const first_worksheet = dt.Sheets[dt.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });

    const content = await contentModel.create({
      code: generateCode(),
      file_name: file.originalname,
      created_by: user.id,
    });

    for (let i = 1; i < data.length; i++) {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: data[i][1],
        temperature: 0,
        top_p: 1,
        n: 1,
      });
      const completion = response.data.choices[0].text;
      // console.log(
      //   "🚀 ~ file: content.js:33 ~ module.exports.uploadContent= ~ response:",
      //   response.data.choices,
      //   completion
      // );
      await contentDetailsModel.create({
        content: content._id,
        topic: data[i][0],
        prompt: data[i][1],
        article: completion,
      });
    }
    res.send({
      status: true,
      data: data,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getContents = async (req, res, next) => {
  try {
    const { query } = req;
    const { page, limit } = query;
    const pageNum = page ? parseInt(page, 10) : 1;
    const Limit = limit ? parseInt(limit, 10) : 10;
    const skip = Limit * (pageNum - 1);

    if (page) delete query.page;
    if (limit) delete query.limit;
    if (query.name) {
      query.name = { $regex: query.name, $options: "i" };
    }
    const contents = await contentModel
      .find({ ...req.query })
      .populate({ path: "created_by", select: "name -_id" })
      .limit(Limit)
      .skip(skip)
      .sort({ createdAt: "desc" });

    res.send({
      status: true,
      data: contents,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getContentById = async (req, res, next) => {
  try {
    const content = await contentModel
      .findOne({ _id: req.params.id })
      .populate({ path: "created_by", select: "name -_id" });

    if (!content) {
      throw new ErrorHandler("Content not found.", 404);
    }

    res.send({
      status: true,
      data: content,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.updateContentById = async (req, res, next) => {
  const { body, user, params } = req;
  if (body.content_id) delete body.content_id;
  if (body.created_by) delete body.created_by;
  try {
    const content = await contentModel
      .findOneAndUpdate(
        { _id: params.id },
        { ...body, updated_by: user.id },
        { new: true }
      )
      .populate({ path: "created_by", select: "name -_id" });
    if (!content) {
      throw new ErrorHandler("Content update failed.", 404);
    }
    res.send({
      status: true,
      data: content,
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.deleteContentById = async (req, res, next) => {
  try {
    await contentModel.findOneAndDelete({ _id: req.params.id });

    res.send({
      status: true,
      message: "Content deleted successfully.",
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};
