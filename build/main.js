require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pino = __webpack_require__(14);

var _pino2 = _interopRequireDefault(_pino);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const l = (0, _pino2.default)({
  name: process.env.APP_ID,
  level: process.env.LOG_LEVEL
});

exports.default = l;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(5);

var _server = __webpack_require__(7);

var _server2 = _interopRequireDefault(_server);

var _routes = __webpack_require__(15);

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _server2.default().router(_routes2.default).listen(process.env.PORT);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _dotenv = __webpack_require__(6);

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var _express2 = _interopRequireDefault(_express);

var _path = __webpack_require__(2);

var path = _interopRequireWildcard(_path);

var _bodyParser = __webpack_require__(8);

var bodyParser = _interopRequireWildcard(_bodyParser);

var _http = __webpack_require__(9);

var http = _interopRequireWildcard(_http);

var _os = __webpack_require__(10);

var os = _interopRequireWildcard(_os);

var _cookieParser = __webpack_require__(11);

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _swagger = __webpack_require__(12);

var _swagger2 = _interopRequireDefault(_swagger);

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = new _express2.default();

class ExpressServer {
  constructor() {
    const root = path.normalize(`${__dirname}/../..`);
    app.set('appPath', `${root}client`);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use((0, _cookieParser2.default)(process.env.SESSION_SECRET));
    app.use(_express2.default.static(`${root}/public`));
  }

  router(routes) {
    (0, _swagger2.default)(app, routes);
    return this;
  }

  listen(port = process.env.PORT) {
    const welcome = p => () => _logger2.default.info(`up and running in ${"development" || 'development'} @: ${os.hostname()} on port: ${p}}`);
    http.createServer(app).listen(port, welcome(port));
    return app;
  }
}
exports.default = ExpressServer;
/* WEBPACK VAR INJECTION */}.call(exports, "server\\common"))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, routes) {
  (0, _swaggerExpressMiddleware2.default)(path.join(__dirname, 'Api.yaml'), app, (err, mw) => {
    // Enable Express' case-sensitive and strict options
    // (so "/entities", "/Entities", and "/Entities/" are all different)
    app.enable('case sensitive routing');
    app.enable('strict routing');

    app.use(mw.metadata());
    app.use(mw.files({
      // Override the Express App's case-sensitive 
      // and strict-routing settings for the Files middleware.
      caseSensitive: false,
      strict: false
    }, {
      useBasePath: true,
      apiPath: process.env.SWAGGER_API_SPEC
      // Disable serving the "Api.yaml" file
      // rawFilesPath: false
    }));

    app.use(mw.parseRequest({
      // Configure the cookie parser to use secure cookies
      cookie: {
        secret: process.env.SESSION_SECRET
      },
      // Don't allow JSON content over 100kb (default is 1mb)
      json: {
        limit: process.env.REQUEST_LIMIT
      }
    }));

    // These two middleware don't have any options (yet)
    app.use(mw.CORS(), mw.validateRequest());

    // Error handler to display the validation error as HTML
    app.use((err, req, res, next) => {
      // eslint-disable-line no-unused-vars, no-shadow
      res.status(err.status || 500);
      res.send(`<h1>${err.status || 500} Error</h1>` + `<pre>${err.message}</pre>`);
    });

    routes(app);
  });
};

var _swaggerExpressMiddleware = __webpack_require__(13);

var _swaggerExpressMiddleware2 = _interopRequireDefault(_swaggerExpressMiddleware);

var _path = __webpack_require__(2);

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* WEBPACK VAR INJECTION */}.call(exports, "server\\common\\swagger"))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("swagger-express-middleware");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("pino");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;

var _router = __webpack_require__(16);

var _router2 = _interopRequireDefault(_router);

var _router3 = __webpack_require__(20);

var _router4 = _interopRequireDefault(_router3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function routes(app) {
  app.use('/api/v1/examples', _router2.default);
  app.use('/api/v1/recipes', _router4.default);
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var express = _interopRequireWildcard(_express);

var _controller = __webpack_require__(17);

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = express.Router().post('/', _controller2.default.create).get('/', _controller2.default.all).get('/:id', _controller2.default.byId);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = undefined;

var _examples = __webpack_require__(18);

var _examples2 = _interopRequireDefault(_examples);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Controller {
  all(req, res) {
    _examples2.default.all().then(r => res.json(r));
  }

  byId(req, res) {
    _examples2.default.byId(req.params.id).then(r => {
      if (r) res.json(r);else res.status(404).end();
    });
  }

  create(req, res) {
    _examples2.default.create(req.body.name).then(r => res.status(201).location(`/api/v1/examples/${r.id}`).json(r));
  }
}
exports.Controller = Controller;
exports.default = new Controller();

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

var _examplesDb = __webpack_require__(19);

var _examplesDb2 = _interopRequireDefault(_examplesDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ExamplesService {
  all() {
    _logger2.default.info(`${this.constructor.name}.all()`);
    return _examplesDb2.default.all();
  }

  byId(id) {
    _logger2.default.info(`${this.constructor.name}.byId(${id})`);
    return _examplesDb2.default.byId(id);
  }

  create(name) {
    return _examplesDb2.default.insert(name);
  }
}

exports.default = new ExamplesService();

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
class ExamplesDatabase {
  constructor() {
    this._data = [];
    this._counter = 0;

    this.insert('example 0');
    this.insert('example 1');
  }

  all() {
    return Promise.resolve(this._data);
  }

  byId(id) {
    return Promise.resolve(this._data[id]);
  }

  insert(name) {
    const record = {
      id: this._counter,
      name
    };

    this._counter += 1;
    this._data.push(record);

    return Promise.resolve(record);
  }
}

exports.default = new ExamplesDatabase();

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = __webpack_require__(1);

var express = _interopRequireWildcard(_express);

var _controller = __webpack_require__(21);

var _controller2 = _interopRequireDefault(_controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = express.Router().get('/:id', _controller2.default.byId);

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Controller = undefined;

var _service = __webpack_require__(22);

var _service2 = _interopRequireDefault(_service);

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Controller {

  query(req, res) {}

  byId(req, res) {
    _service2.default.byId(req.params.id).then(r => {
      if (r) res.json(r);else res.status(404).end();
    }).catch(err => {
      _logger2.default.error(err);
      res.status(500).end();
    });
  }

  create(req, res) {}

  update(req, res) {}

  delete(req, res) {}

}
exports.Controller = Controller;
exports.default = new Controller();

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _logger = __webpack_require__(0);

var _logger2 = _interopRequireDefault(_logger);

var _dbDriver = __webpack_require__(23);

var _dbDriver2 = _interopRequireDefault(_dbDriver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RecipesService {

  formatRecipeResponse(record) {
    return _extends({}, record.get('recipe').properties, {
      ingredients: record.get('ingredients'),
      categories: record.get('categories'),
      author: record.get('author'),
      interactions: record.get('interactions'),
      loves: record.get('loves')
    });
  }

  byId(id, user) {
    _logger2.default.info(`${this.constructor.name}.byId(${id})`);
    const session = _dbDriver2.default.session();
    const params = {
      recipeCuid: id,
      beholderCuid: user || null
    };
    return session.run(`
      MATCH (recipe:Recipe {cuid: {recipeCuid}})
      WITH recipe
      MATCH (recipe)-[:IS]->(c:Category)
      WITH recipe, COLLECT({name: c.name}) as categories
      MATCH (recipe)-[a:CONTAINS]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, amount: a.amount}) as ingredients
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)    
      OPTIONAL MATCH (recipe)<-[:AUTHORED]-(u:User)
      OPTIONAL MATCH (recipe)<-[reaction:REACTS]-(beholder:User {cuid: {beholderCuid}})
      RETURN recipe,
      {username: u.username, cuid: u.cuid} AS author,
      COUNT(reactions) AS loves,
      {love: reaction.love, favorite: reaction.favorite} AS interactions,
      ingredients,
      categories
    `, params).then(res => {
      session.close();
      return { recipe: res.records.map(this.formatRecipeResponse)[0] };
    });
  }
}

exports.default = new RecipesService();

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _neo4jDriver = __webpack_require__(24);

exports.default = _neo4jDriver.v1.driver(process.env.GRAPHENEDB_BOLT_URL, _neo4jDriver.v1.auth.basic(process.env.GRAPHENEDB_BOLT_USER, process.env.GRAPHENEDB_BOLT_PASSWORD));

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("neo4j-driver");

/***/ })
/******/ ]);
//# sourceMappingURL=main.map