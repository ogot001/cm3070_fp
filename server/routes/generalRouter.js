import express from "express"; // Import the express framework
import { ObjectId } from "mongodb"; // Import ObjectId for MongoDB operations
import db from "../db/connection.js"; // Import database connection
import * as Yup from "yup"; // Import Yup for validation

// Function to create an Express router for a specific collection
export const createRouter = (collectionName, formFields) => {
  const router = express.Router(); // Create a new router instance

  // Function to generate Yup validation schema dynamically based on formFields
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

  // Generate the validation schema for the collection
  const validationSchema = Yup.object().shape(generateValidationSchema(formFields));

  // Function to generate a document object from request body based on formFields
  const generateDocumentFromFields = (body, fields) => {
    const document = {};
    fields.forEach(([, fieldName, type]) => {
      if (body[fieldName] !== undefined) {
        if (type === "join") {
          if (body[fieldName] === '' || body[fieldName] === null) {
            document[fieldName] = null;
          } else if (ObjectId.isValid(body[fieldName])) {
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

  // Function to generate the MongoDB aggregation pipeline for join fields
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
              preserveNullAndEmptyArrays: true, // Handle cases where there might not be a related document
            },
          }))
      );
  };

  // Route to fetch all records with join details
  router.get("/", async (req, res) => {
    try {
      const collection = db.collection(collectionName);
      const pipeline = generateJoinPipeline(formFields); // Generate the aggregation pipeline
      const results = await collection.aggregate(pipeline).toArray(); // Execute the aggregation query
      res.status(200).send(results); // Send the results back to the client
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });

  // Route to fetch a single record by ID with join details
  router.get("/:id", async (req, res) => {
    try {
      const collection = db.collection(collectionName);
      const pipeline = [
        { $match: { _id: new ObjectId(req.params.id) } }, // Match the record by ID
        ...generateJoinPipeline(formFields), // Add the join pipeline
      ];
      const result = await collection.aggregate(pipeline).toArray(); // Execute the aggregation query
      if (!result || result.length === 0) res.status(404).send("Not found");
      else res.status(200).send(result[0]); // Send the first result back to the client
    } catch (err) {
      console.error(`Error retrieving ${collectionName}:`, err);
      res.status(500).send(`Error retrieving ${collectionName}`);
    }
  });

  // Route to create a new record
  router.post("/", async (req, res) => {
    try {
      await validationSchema.validate(req.body, { abortEarly: false }); // Validate the request body

      const newDocument = generateDocumentFromFields(req.body, formFields); // Generate the document to insert

      let collection = await db.collection(collectionName);
      let result = await collection.insertOne(newDocument); // Insert the document into the collection
      res.status(201).send(result); // Send the result back to the client
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      if (err.name === 'ValidationError') {
        res.status(400).send({ errors: err.errors }); // Send validation errors back to the client
      } else {
        res.status(500).send(`Error adding to ${collectionName}`);
      }
    }
  });

  // Route to update a record by ID
  router.patch("/:id", async (req, res) => {
    try {
      await validationSchema.validate(req.body, { abortEarly: false }); // Validate the request body

      const query = { _id: new ObjectId(req.params.id) }; // Find the record by ID
      const updates = { $set: generateDocumentFromFields(req.body, formFields) }; // Prepare the updates

      let collection = await db.collection(collectionName);
      let result = await collection.updateOne(query, updates); // Update the record
      res.status(200).send(result); // Send the result back to the client
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      if (err.name === 'ValidationError') {
        res.status(400).send({ errors: err.errors }); // Send validation errors back to the client
      } else {
        res.status(500).send(`Error updating ${collectionName}`);
      }
    }
  });

  // Route to delete a record by ID
  router.delete("/:id", async (req, res) => {
    try {
      const query = { _id: new ObjectId(req.params.id) }; // Find the record by ID

      const collection = db.collection(collectionName);
      let result = await collection.deleteOne(query); // Delete the record

      res.status(200).send(result); // Send the result back to the client
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
      res.status(500).send(`Error deleting from ${collectionName}`);
    }
  });

  return router; // Return the configured router
};
