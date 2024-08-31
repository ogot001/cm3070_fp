import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/connection.js";
import formFields from '../../formFields.mjs'; // Adjust the path based on your file structure
import * as Yup from "yup";

const router = express.Router();

// Generate Yup validation schema dynamically from formFields.mjs
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

// Create the validation schema from formFields.mjs
const validationSchema = Yup.object().shape(generateValidationSchema(formFields));

// Helper function to generate document fields from formFields.mjs
const generateDocumentFromFields = (body) => {
  const document = {};
  formFields.forEach(([, fieldName]) => {
    if (body[fieldName] !== undefined) {
      document[fieldName] = body[fieldName];
    }
  });
  return document;
};

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  try {
    let collection = await db.collection("records");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error("Error retrieving records:", err);
    res.status(500).send("Error retrieving records");
  }
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("records");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.status(404).send("Not found");
    else res.status(200).send(result);
  } catch (err) {
    console.error("Error retrieving record:", err);
    res.status(500).send("Error retrieving record");
  }
});

// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    // Validate the incoming request data using the schema
    await validationSchema.validate(req.body, { abortEarly: false });

    // Generate the new document dynamically from formFields.mjs
    const newDocument = generateDocumentFromFields(req.body);

    let collection = await db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error adding record:", err);
    if (err.name === 'ValidationError') {
      res.status(400).send({ errors: err.errors });
    } else {
      res.status(500).send("Error adding record");
    }
  }
});

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    // Validate the incoming request data using the schema
    await validationSchema.validate(req.body, { abortEarly: false });

    const query = { _id: new ObjectId(req.params.id) };

    // Generate the updated document dynamically from formFields.mjs
    const updates = { $set: generateDocumentFromFields(req.body) };

    let collection = await db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error updating record:", err);
    if (err.name === 'ValidationError') {
      res.status(400).send({ errors: err.errors });
    } else {
      res.status(500).send("Error updating record");
    }
  }
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("records");
    let result = await collection.deleteOne(query);

    res.status(200).send(result);
  } catch (err) {
    console.error("Error deleting record:", err);
    res.status(500).send("Error deleting record");
  }
});

export default router;
