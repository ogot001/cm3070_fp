// import express from "express";
// import cors from "cors";
// import records from "./routes/record.js";

// const PORT = process.env.PORT || 5050;
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use("/record", records);

// // start the Express server
// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

// server.js

import express from "express";
import cors from "cors";
import { createRouter } from './routes/generalRouter.js';
import { collections } from '../formFields.mjs'; // Adjust the path based on your file structure

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// Loop through collections and create routes dynamically
collections.forEach(collection => {
  app.use(`/${collection.name}`, createRouter(collection.name, collection.fields));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
