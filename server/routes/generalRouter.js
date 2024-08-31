import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/connection.js";
import * as Yup from "yup";

export const createRouter = (collectionName, formFields) => {
  const router = express.Router();

  // Generate Yup validation schema dynamically from formFields
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
          case "join":
            schema[fieldName] = Yup.string().required(`${label} is required`);
            break;
          default:
            break;
        }
      }
      return schema;
    }, {});
  };

  const validationSchema = Yup.object().shape(generateValidationSchema(formFields));

  // Helper function to generate document fields from formFields
  const generateDocumentFromFields = (body, fields) => {
    const document = {};
    fields.forEach(([, fieldName, type]) => {
      if (body[fieldName] !== undefined) {
        if (type === "join") {
          // Only convert to ObjectId if it's a valid 24-character hex string
          if (ObjectId.isValid(body[fieldName])) {
            document[fieldName] = new ObjectId(body[fieldName]);
          } else {
            throw new Error(`Invalid ObjectId: ${body[fieldName]}`);
          }
        } else {
          document[fieldName] = body[fieldName];
        }
      }
    });
    return document;
  };

  const generateJoinPipeline = (fields) => {
    return fields
      .filter(([, , type]) => type === "join")
      .map(([, fieldName, , , foreignCollection]) => {
        const [foreignCollectionName, displayField] = foreignCollection.split(";");
        return {
          $lookup: {
            from: foreignCollectionName,
            localField: fieldName,
            foreignField: "_id",
            as: fieldName + "Details",
          },
        };
      })
      .concat(
        fields
          .filter(([, , type]) => type === "join")
          .map(([, fieldName]) => ({
            $unwind: {
              path: `$${fieldName}Details`,
              preserveNullAndEmptyArrays: true, // To handle cases where there might not be a related document
            },
          }))
      );
  };
  
  // Fetch all records with joins
  router.get("/", async (req, res) => {
    try {
      const collection = db.collection(collectionName);
      const pipeline = generateJoinPipeline(formFields);
      const results = await collection.aggregate(pipeline).toArray();
      res.status(200).send(results);
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });
  
  // Fetch a single record with joins
  router.get("/:id", async (req, res) => {
    try {
      const collection = db.collection(collectionName);
      const pipeline = [
        { $match: { _id: new ObjectId(req.params.id) } },
        ...generateJoinPipeline(formFields),
      ];
      const result = await collection.aggregate(pipeline).toArray();
      if (!result || result.length === 0) res.status(404).send("Not found");
      else res.status(200).send(result[0]);
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });

  // Create a new record
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

  // Update a record by ID
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

  // Delete a record by ID
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
