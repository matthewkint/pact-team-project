const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');

const port = 5000;
const addr = '127.0.0.1';

let products = [];
let productsJSON;
let users = {};
let lastUserId = 0;

// Mime types are content types
const mimeTypes = {
  ".html":    "text/html",
  ".css":     "text/css",
  ".js":      "text/javascript",
  ".jpeg":    "image/jpeg",
  ".jpg":     "image/jpeg",
  ".png":     "image/png",
  '.ico':     'image/x-icon'
}

// Create connection to db
const conn = mysql.createConnection({
  host: 'sql.wpc-is.online',
  user: 'afedotov',
  password: 'afed6289',
  database: 'db_test_TeamA08'
});

// Connect to the db
conn.connect((err) => {
  if (err) {
    console.error('Error connecting to DB: ' + err.stack);
    return;
  }
  console.log('Connected to DB as ' + conn.threadId);
});

/* Query the db to get all the products and push into products array that is going to be sent to users
 Reason for a doing so: SQL server terminates the connection after some time, throwing an error, handling is required.
 Other possible solutions: 
  * connect to db on each request, pull data, close connection. BUT this will possibly overflow 
    the SQL server with connection requests
  * On disconnect, try to reconnect to SQL. Not sure what the behavior is during the reconnect when users are sending requests
  * Ideal solution: store the data in cache/memory like we do right now, and pull from db every other hour or whatever
*/
conn.query('SELECT * FROM ProductService', (err, results, fields) => {
  if (err) throw err;
  for (let i = 0; i < fields.length; i++) {
    products.push({id: results[i].ID, name: results[i].Name, description: results[i].Description, cost: results[i].Cost, img: results[i].ImgRef});
  }
  productsJSON = JSON.stringify(products);
});

// Close conenction 
conn.end();

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  let filename;
  let userId;

  if (req.method === 'GET') {
      if (isFile(req.url)) {
        const pathData = path.parse(req.url);
        filename = path.join(pathData.dir, pathData.base);
      } else {
        // We check if the connected client has a cookie, if yes, we assing userId to the value of it.
        if (req.headers.cookie) {
          userId = req.headers.cookie.split('=')[1];
        } else {
          // If a new user, we take the new incremented id and assign it to user's cookie (id=n)
          userId = lastUserId;
          console.log(`New user connected with ID: ${userId}`);
          res.setHeader('Set-Cookie', [`id=${userId}`]);
          lastUserId++;
        } 
        // Standard logic for paths
        switch (pathname) {
          case '/':
            filename = 'www/index.html';
            break;
          case '/contact':
            filename = 'www/contact.html';
            break;
          case '/menu':
            filename = 'www/menu.html';
            break;
          case '/order':
            filename = 'www/items.html';
            break;
          case '/about':
            filename = 'www/aboutus.html';
            break;
          case '/api/products':
            // call to api/products returns a json, with contents from sql request
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(productsJSON);
            return;
          case '/api/user':
            // call to api/user responds with users items in cart based on the user id
            if (userId in users) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(users[userId]));
            } else {
              res.end();
            }
            return;
          default:
            // We have a 404 page if no available path is found
            filename = 'www/404.html';
            break;
        }
      }
  } else if (req.method === 'POST') {
    // Post request to api/user is used when user updates its cart, the body of this request hold the cart array as JSON
    if (pathname === '/api/user') {
      if (req.headers.cookie) {
        userId = req.headers.cookie.split('=')[1];
        let body = [];
        let dataJSON;
        // Parse the body of post request and assign it to user in users dictionary
        req.on('data', (data) => {
          body.push(data);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          dataJSON = JSON.parse(body);
          users[userId] = dataJSON;
        });
        res.statusCode = 200;
      }
    } else {
      // any other requests will return 404
      res.statusCode = 404;
    }
    res.end();
    return;
  }

  filename = path.join(process.cwd() + '/public/', filename);
  // Serve files
  try {
    fs.accessSync(filename, fs.F_OK);
    let fileStream = fs.createReadStream(filename);
    const typeAttribute = mimeTypes[path.extname(filename)];

    res.writeHead(200, {'Content-Type': typeAttribute});
    fileStream.pipe(res);
    return;
  } catch(err) {
    console.error(err);
    // if there is any error with file. i.e. not found, we redirect user to /404 page
    res.writeHead(302, {'Location': '/404'});
  }
  res.end();  
});

/**
 * Checks whether the req.url is a file (has extension)
 */
const isFile = (pathname) => {
  return (path.parse(pathname).ext === '') ? false : true;
}

server.listen(port, addr, () => {
  console.log(`Starting server. Listening on ${addr}:${port}`);
});
