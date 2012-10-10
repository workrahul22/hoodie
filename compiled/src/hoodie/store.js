// Generated by CoffeeScript 1.3.3

Hoodie.Store = (function() {

  function Store(hoodie) {
    this.hoodie = hoodie;
  }

  Store.prototype.save = function(type, id, object, options) {
    var defer;
    if (options == null) {
      options = {};
    }
    defer = this.hoodie.defer();
    if (typeof object !== 'object') {
      defer.reject(Hoodie.Errors.INVALID_ARGUMENTS("object is " + (typeof object)));
      return defer.promise();
    }
    if (id && !this._isValidId(id)) {
      return defer.reject(Hoodie.Errors.INVALID_KEY({
        id: id
      })).promise();
    }
    if (!this._isValidType(type)) {
      return defer.reject(Hoodie.Errors.INVALID_KEY({
        type: type
      })).promise();
    }
    return defer;
  };

  Store.prototype.create = function(type, object, options) {
    if (object == null) {
      object = {};
    }
    if (options == null) {
      options = {};
    }
    return this.save(type, object.id, object);
  };

  Store.prototype.update = function(type, id, objectUpdate, options) {
    var defer, _loadPromise,
      _this = this;
    defer = this.hoodie.defer();
    _loadPromise = this.find(type, id).pipe(function(currentObj) {
      var changedProperties, key, value;
      if (typeof objectUpdate === 'function') {
        objectUpdate = objectUpdate($.extend({}, currentObj));
      }
      if (!objectUpdate) {
        return defer.resolve(currentObj);
      }
      changedProperties = (function() {
        var _results;
        _results = [];
        for (key in objectUpdate) {
          value = objectUpdate[key];
          if (!(currentObj[key] !== value)) {
            continue;
          }
          currentObj[key] = value;
          _results.push(key);
        }
        return _results;
      })();
      if (!(changedProperties.length || options)) {
        return defer.resolve(currentObj);
      }
      return _this.save(type, id, currentObj, options).then(defer.resolve, defer.reject);
    });
    _loadPromise.fail(function() {
      return _this.save(type, id, objectUpdate, options).then(defer.resolve, defer.reject);
    });
    return defer.promise();
  };

  Store.prototype.updateAll = function(filterOrObjects, objectUpdate, options) {
    var promise,
      _this = this;
    if (options == null) {
      options = {};
    }
    switch (true) {
      case typeof filterOrObjects === 'string':
        promise = this.findAll(filterOrObjects);
        break;
      case this.hoodie.isPromise(filterOrObjects):
        promise = filterOrObjects;
        break;
      case $.isArray(filterOrObjects):
        promise = this.hoodie.defer().resolve(filterOrObjects).promise();
        break;
      default:
        promise = this.findAll();
    }
    return promise.pipe(function(objects) {
      var defer, object, _updatePromises;
      defer = _this.hoodie.defer();
      _updatePromises = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = objects.length; _i < _len; _i++) {
          object = objects[_i];
          _results.push(this.update(object.$type, object.id, objectUpdate, options));
        }
        return _results;
      }).call(_this);
      $.when.apply(null, _updatePromises).then(defer.resolve);
      return defer.promise();
    });
  };

  Store.prototype.find = function(type, id) {
    var defer;
    defer = this.hoodie.defer();
    if (!(typeof type === 'string' && typeof id === 'string')) {
      return defer.reject(Hoodie.Errors.INVALID_ARGUMENTS("type & id are required")).promise();
    }
    return defer;
  };

  Store.prototype.findOrCreate = function(type, id, attributes) {
    var defer,
      _this = this;
    if (attributes == null) {
      attributes = {};
    }
    defer = this.hoodie.defer();
    this.find(type, id).done(defer.resolve).fail(function() {
      var newAttributes;
      newAttributes = $.extend({
        id: id
      }, attributes);
      return _this.create(type, newAttributes).then(defer.resolve, defer.reject);
    });
    return defer.promise();
  };

  Store.prototype.findAll = function() {
    return this.hoodie.defer();
  };

  Store.prototype.loadAll = function() {
    return this.findAll.apply(this, arguments);
  };

  Store.prototype.destroy = function(type, id, options) {
    var defer;
    if (options == null) {
      options = {};
    }
    defer = this.hoodie.defer();
    if (!(typeof type === 'string' && typeof id === 'string')) {
      return defer.reject(Hoodie.Errors.INVALID_ARGUMENTS("type & id are required")).promise();
    }
    return defer;
  };

  Store.prototype["delete"] = function() {
    return this.destroy.apply(this, arguments);
  };

  Store.prototype.destroyAll = function(type, options) {
    var _this = this;
    if (options == null) {
      options = {};
    }
    return this.findAll(type).pipe(function(objects) {
      var object, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        _results.push(_this.destroy(object.$type, object.id, options));
      }
      return _results;
    });
  };

  Store.prototype.uuid = function(len) {
    var chars, i, radix;
    if (len == null) {
      len = 7;
    }
    chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    radix = chars.length;
    return ((function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
        _results.push(chars[0 | Math.random() * radix]);
      }
      return _results;
    })()).join('');
  };

  Store.prototype._now = function() {
    return new Date;
  };

  Store.prototype._isValidId = function(key) {
    return /^[a-z0-9\-]+$/.test(key);
  };

  Store.prototype._isValidType = function(key) {
    return /^[a-z$][a-z0-9]+$/.test(key);
  };

  return Store;

})();
