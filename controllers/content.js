const contentModel = require("../models/Content");
const contentDetailsModel = require("../models/ContentDetails");
const { ErrorHandler } = require("../utils/error");
const { generateCode } = require("../helpers/code_generator");
const XLSX = require("xlsx");
const openAI = require("openai");

const openai = new openAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.uploadContent = async (req, res, next) => {
  const { user } = req;
  console.log(user);
  const { content } = req.body;
  console.log("api called ");
  try {
    const contentData = await contentModel.create({
      code: generateCode(),
      total_content: content.length,
      created_by: user.id,
    });
    const promises = content.map((item) => {
      const totalToken = Math.floor(1.2 * item.length);
      console.log("total token", totalToken);
      return openai.completions
        .create({
          model: "gpt-3.5-turbo-instruct",
          prompt: item.title,
          max_tokens: totalToken,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        })
        .then((response) => {
          // console.log(`response done for item with title: ${item.title}`);
          return {
            status: "fulfilled",
            value: {
              content: contentData._id,
              title: item.title,
              value: response.choices[0].text,
            },
          };
        })
        .catch((err) => {
          // console.error(`error for item with title: ${item.title}`, err);
          return { status: "rejected", reason: err };
        });
    });

    const results = await Promise.allSettled(promises);
    // const finaloutput = [];
    const finaloutput = results.map((item) => {
      return item.value.value;
      // finaloutput.push(item.value.value);
    });

    // console.log("result ", results);
    console.log("final output ", finaloutput);
    await contentDetailsModel.create(finaloutput);

    res.send({
      status: true,
      data: true,
    });
  } catch (err) {
    console.log(err);
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
