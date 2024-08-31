import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/connection.js";
import * as Yup from "yup";

export const createRouter = (collectionName, formFields) => {
  const router = express.Router();

  const generateValidationSchema = (fields) => {
    return fields.reduce((schema, field) => {
      const [label, fieldName, type, compulsory, options] = field;

      if (compulsory) {
        switch (type) {
          case "text":
            schema[fieldName] = Yup.string().required(`${label} is required`);
            break;
          case "email":
            schema[fieldName] = Yup.string()
              .email("Invalid email address")
              .required(`${label} is required`);
            break;
          case "date":
            schema[fieldName] = Yup.date().required(`${label} is required`).nullable();
            break;
          case "phone":
            schema[fieldName] = Yup.string()
              .matches(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number")
              .required(`${label} is required`);
            break;
          case "dropdown":
            schema[fieldName] = Yup.string()
              .oneOf(options, `Invalid ${label.toLowerCase()}`)
              .required(`${label} is required`);
            break;
          default:
            break;
        }
      }
      return schema;
    }, {});
  };

  const validationSchema = Yup.object().shape(generateValidationSchema(formFields));

  const generateDocumentFromFields = (body, fields) => {
    const document = {};
    fields.forEach(([, fieldName, type]) => {
      if (body[fieldName] !== undefined) {
        document[fieldName] = type === "join" ? new ObjectId(body[fieldName]) : body[fieldName];
      }
    });
    return document;
  };

  const generateJoinPipeline = (fields) => {
    return fields
      .filter(([, , type]) => type === "join")
      .map(([, fieldName, , , foreignCollection]) => ({
        $lookup: {
          from: foreignCollection,
          localField: fieldName,
          foreignField: "_id",
          as: fieldName + "Details",
        }
      }))
      .concat(fields.filter(([, , type]) => type === "join").map(([, fieldName]) => ({
        $unwind: `$${fieldName}Details`
      })));
  };

  router.get("/", async (req, res) => {
    try {
      let collection = db.collection(collectionName);
      let pipeline = generateJoinPipeline(formFields);
      let results = await collection.aggregate(pipeline).toArray();
      res.status(200).send(results);
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      let collection = db.collection(collectionName);
      let pipeline = [
        { $match: { _id: new ObjectId(req.params.id) } },
        ...generateJoinPipeline(formFields)
      ];
      let result = await collection.aggregate(pipeline).toArray();

      if (!result || result.length === 0) res.status(404).send("Not found");
      else res.status(200).send(result[0]);
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });

  router.post("/", async (req, res) => {
    try {
      await validationSchema.validate(req.body, { abortEarly: false });

      const newDocument = generateDocumentFromFields(req.body, formFields);

      let collection = await db.collection(collectionName);
      let result = await collection.insertOne(newDocument);
      res.status(201).send(result);
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      if (err.name === 'ValidationError') {
        res.status(400).send({ errors: err.errors });
      } else {
        res.status(500).send(`Error adding to ${collectionName}`);
      }
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      await validationSchema.validate(req.body, { abortEarly: false });

      const query = { _id: new ObjectId(req.params.id) };
      const updates = { $set: generateDocumentFromFields(req.body, formFields) };

      let collection = await db.collection(collectionName);
      let result = await collection.updateOne(query, updates);
      res.status(200).send(result);
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      if (err.name === 'ValidationError') {
        res.status(400).send({ errors: err.errors });
      } else {
        res.status(500).send(`Error updating ${collectionName}`);
      }
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const query = { _id: new ObjectId(req.params.id) };

      const collection = db.collection(collectionName);
      let result = await collection.deleteOne(query);

      res.status(200).send(result);
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
      res.status(500).send(`Error deleting from ${collectionName}`);
    }
  });

  return router;
};
