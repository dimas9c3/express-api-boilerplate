import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

/*
  body-parser: Parse incoming request bodies in a middleware before your handlers, 
  available under the req.body property.
*/

const routeFiles = fs
  .readdirSync(__dirname + "/../routes/")
  .filter(
    (file) => file.endsWith(".js")
  );

let server;
let routes = [];

const expressService = {
  init: async () => {
    try {
      /*
        Loading routes automatically
      */
      for (const file of routeFiles) {
        const route = await import(`../routes/${file}`);
        const routeName = Object.keys(route)[0];
        routes.push(route[routeName]);
      }

      server = express();
      server.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
      });

      server.use(bodyParser.json());
      server.use(routes);

      server.use(function (req, res, next) {
        res.status(404);

        // respond with json
        if (req.accepts('json')) {
          res.json({ 'status': false, 'code': 404, message: 'Not found' });
          return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
      });

      server.listen(process.env.SERVER_PORT);
      console.log("[EXPRESS] Express initialized");
    } catch (error) {
      console.log("[EXPRESS] Error during express service initialization");
      throw error;
    }
  },
};

export default expressService;
