var _                     = require("lodash");
var Promise               = require('bluebird');
var Bcrypt                = Promise.promisifyAll(require("bcryptjs"));
var Checkit               = require('checkit');
var Crypto                = require('crypto');
if(!process.env.CIPHER_KEY) { throw new Error('CIPHER_KEY env variable is not set') }
var cipherKey             = process.env.CIPHER_KEY;

function encryptPassword(password) {
  return Bcrypt.hashAsync(password, 10);
};

module.exports = function(Bookshelf, app) {
  var query   = Bookshelf.knex;
  var User    = Bookshelf.Model.extend({
    tableName: "users",

    idAttrs: ["email"],

    validations: {
      email: ['required', 'email', function(email) {
        var _this = this.target;
        return User.forge({email: email}).fetch().then(function(user) {
          // Only throw if the user is different than the current user.
          if (user && user.id != _this.id) {
            throw new Error("Email already registered");
          }
        });
      }],
      name: ['required'],
      password: ['required', 'minLength:6']
    },

    initialize: function () {
      this.on("created", this.createDefaultProject);
      this.on('saving', this.validate, this);
      this.on('saving', this.hashPassword, this);
    },

    createDefaultProject: function() {
      return app.Models.Project.forge({ownerId: this.id, name: 'Sandbox', description: 'Sandbox'})
      .save()
    },

    hashPassword: function(model) {
      return encryptPassword(model.get('password'))
        .then(function(hash) {
          return model.set({ password: hash });
        })
    },

    projects: function(id) {
      return this.hasMany(app.Models.Project, 'owner_id')
    },

    notebooks: function(id) {
      return this.hasMany(app.Models.Notebook)
    },

    subscriptions: function() {
      return this.hasMany(app.Models.Subscription);
    },

    publications: function() {
      return this.hasMany(app.Models.Publication, 'user_id').through(app.Models.Notebook, 'notebook_id');
    },

    beakerClaim: function() {
      return this.hasOne(app.Models.BeakerClaim, 'user_id')
    },

    addSubscription: function(indexName, dataSetId) {
      return app.Models.Subscription.forge({
        indexName: indexName,
        dataSetId: dataSetId,
        userId: this.id
      }).save()
    },

    removeSubscription: function(indexName, dataSetId) {
      return app.Models.Subscription.forge({
        indexName: indexName,
        dataSetId: dataSetId,
        userId: this.id
      })
      .fetch()
      .then(function(subscription) {
        return subscription.destroy();
      })
    },

    subscriptionsWithDatasets: function() {
      return this.subscriptions()
      .fetch()
      .then(function(subscriptions) {
        var ids = _.invoke(subscriptions.models, 'get', 'dataSetId');
        return app.Models.DataSet.findByIds({ids: ids, index: '*'})
        .then(function(datasets) {
          // inject datasets into subscriptions
          return _.map(subscriptions.toJSON(), function(s) {
            var dataSet = _.findWhere(datasets,
                                      {id: s.dataSetId, index: s.indexName});
            return _.extend(s, {dataSet: dataSet});
          })
        })
      })
    },

    validate: function (model, attrs, options) {
      return new Checkit(this.validations).run(this.attributes);
    },

    setToken: function () {
      var u      = _.pick(this.attributes, 'id', 'name', 'email'),
          cipher = Crypto.createCipher('blowfish', cipherKey),
          token  = cipher.update(this.attributes.id.toString(), 'utf-8', 'base64') + cipher.final('base64');
      return _.extend(u, {token: token})
    },

    update: function(attrs) {
      var _this = this;
      return User.forge({email: this.attributes.email}).fetch()
        .then(function(user) {
          return Bcrypt.compareAsync(attrs.currentPassword, user.attributes.password)
            .then(function(match) {
              if (!match) { throw new Error('Wrong Password')}
              var password = attrs.newPassword ? attrs.newPassword : attrs.currentPassword;
              attrs = _.omit(attrs, 'currentPassword', 'newPassword');
              _.extend(attrs, { password: password })
              return _this.save(attrs)
                .then(User.sanitize)
            })
        })
    }
  });

  User = _.extend(User, {
    checkToken: function(token) {
      var decipher = Crypto.createDecipher('blowfish', cipherKey),
          id       = parseInt(decipher.update(token, 'base64', 'utf-8') + decipher.final('utf-8'));
      return new User({id: id}).fetch({ require: true })
        .then(function (user) {
          user.attributes = _.omit(user.attributes, 'password');
          user._previousAttributes = _.omit(user._previousAttributes, 'password')
          return user;
        })
    },

    findOneWhere: function(attrs) {
      return User.forge(attrs)
      .fetch()
    },

    sanitize: function(user) {
      return _.pick(user.attributes, 'name', 'email', 'id');
    },

    signUp: function(attrs) {
      return new User(attrs).save()
        .then(function(user) {
          return user.setToken();
        })
    },

    signIn: function(attrs) {
      var userEmail = _.pick(attrs, "email");

      return User.forge(userEmail).fetch()
        .then(function(user) {
          if(!user) { throw new Error("Email not registered"); }
          return Bcrypt.compareAsync(attrs.password, user.attributes.password)
            .then(function(match) {
              if(!match) { throw new Error('Wrong password'); }
              return user.setToken();
            });
        });
    }
  });

  return {
    name: "User",
    model: User
  };
};
