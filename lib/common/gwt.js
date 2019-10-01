// Generated by CoffeeScript 1.9.3
(function() {
  var I, Keyword, Q, Result, _, assert, buildGwt, clearObjectProperties, hasNestedResults, hideAttributes, objKeys, proxyOnSelf, uuid, withContext,
    slice = [].slice;

  Q = require('q');

  _ = require('lodash');

  assert = require('assert');

  I = require('immutable');

  uuid = require('node-uuid');

  objKeys = function(thing) {
    if (typeof thing === 'object') {
      return Object.keys(thing);
    }
    console.log('Object.keys error. Argument:', thing);
    console.log({
      'Stack': new Error().stack
    });
    throw new Error('Oh no. Object.keys error.');
  };

  hideAttributes = function() {
    var attributes, keys, object;
    object = arguments[0], keys = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    attributes = {};
    return keys.forEach(function(attr) {
      if (!Object.getOwnPropertyDescriptor(object, attr)) {
        return Object.defineProperty(object, attr, {
          get: function() {
            return attributes[attr];
          },
          set: function(value) {
            return attributes[attr] = value;
          }
        });
      }
    });
  };

  Keyword = function() {
    var id;
    id = uuid.v4();
    return {
      get: function(object) {
        hideAttributes(object, id);
        return object[id];
      },
      set: function(object, value) {
        hideAttributes(object, id);
        return object[id] = value;
      }
    };
  };

  withContext = function(object, keyword, fn) {
    if (!keyword.get(object)) {
      keyword.set(object, {});
    }
    return fn.apply(keyword.get(object));
  };

  proxyOnSelf = function(container, object) {
    var keys;
    keys = objKeys(object);
    keys.forEach(function(key) {
      return Object.defineProperty(container, key, {
        get: function() {
          return object[key];
        },
        enumerable: true,
        configurable: true
      });
    });
    return keys;
  };

  clearObjectProperties = function(container, keys) {
    var j, key, len, results1;
    results1 = [];
    for (j = 0, len = keys.length; j < len; j++) {
      key = keys[j];
      results1.push(delete container[key]);
    }
    return results1;
  };

  Result = (function() {
    Result.kwContext = Keyword();

    function Result(id, options) {
      if (options == null) {
        options = {};
      }
      withContext(this, Result.kwContext, function() {
        this.proxyResult = options.proxyResult;
        this.id = id;
        assert(this.id, 'Result id not given');
        return this.value = null;
      });
    }

    Result.prototype.getFromContext = function(context) {
      return withContext(this, Result.kwContext, function() {
        if (this.overriden) {
          return this.value;
        } else {
          return context[this.id];
        }
      });
    };

    Result.prototype.setInContext = function(context, value) {
      var self;
      self = this;
      return withContext(this, Result.kwContext, function() {
        context[this.id] = value;
        if (this.proxyResult) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            if (this.proxyAttributeKeys) {
              clearObjectProperties(self, this.proxyAttributeKeys);
            }
            return this.proxyAttributeKeys = proxyOnSelf(self, value);
          }
        }
      });
    };

    Result.prototype.set = function(value) {
      return withContext(this, Result.kwContext, function() {
        this.value = value;
        return this.overriden = true;
      });
    };

    return Result;

  })();

  hasNestedResults = function(result) {
    var r, rkey;
    for (rkey in result) {
      r = result[rkey];
      if (r instanceof Result) {
        return true;
      }
    }
    return false;
  };

  buildGwt = function(arg) {
    var buildDescription, configOptions, crossCombineResults, describeScenario, exports, getCounts, interpolate, isRunner, lastResult, makeResult, options, resolveResultArray, resolveResultObject;
    options = arg.options;
    exports = {};
    assert(options, 'Options object required');
    configOptions = options;
    exports.configure = function(arg1) {
      var bddIt, proxyResult, ref;
      bddIt = arg1.it, proxyResult = arg1.proxyResult;
      return buildGwt({
        options: _.extend({}, configOptions, {
          proxyResult: proxyResult != null ? proxyResult : configOptions.proxyResult,
          bddIt: (ref = configOptions.bddIt) != null ? ref : bddIt
        })
      });
    };
    exports.result = makeResult = function(id) {
      if (id == null) {
        id = uuid.v4();
      }
      return new Result(id, {
        proxyResult: configOptions.proxyResult
      });
    };
    exports.combine = function() {
      var leftRunner, ref, rest, rightRunner;
      leftRunner = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      assert(leftRunner, 'left runner not defined');
      return (!rest.length ? leftRunner : ((ref = rest, rightRunner = ref[0], rest = 2 <= ref.length ? slice.call(ref, 1) : [], ref), assert(rightRunner, 'right runner not defined'), exports.combine.apply(exports, [leftRunner.combine(rightRunner)].concat(slice.call(rest)))));
    };
    exports.steps = function(spec) {
      return exports.accordingTo(function() {
        return spec;
      }).getRunner();
    };
    exports.accordingTo = function(spec) {
      var _getRunner;
      assert.equal(typeof spec, 'function', 'Spec must be a function');
      _getRunner = function(arg1) {
        var counts, only;
        only = (arg1 != null ? arg1 : {}).only;
        counts = getCounts(spec());
        return {
          only: !only ? _getRunner({
            only: true
          }) : void 0,
          given: function() {
            var ref;
            return (ref = describeScenario(spec(), {
              only: only,
              counts: counts
            })).given.apply(ref, arguments);
          },
          when: function() {
            var ref;
            return (ref = describeScenario(spec(), {
              only: only,
              counts: counts
            })).when.apply(ref, arguments);
          },
          then: function() {
            var ref;
            return (ref = describeScenario(spec(), {
              only: only,
              counts: counts
            })).then.apply(ref, arguments);
          },
          tap: function() {
            var ref;
            return (ref = describeScenario(spec(), {
              only: only,
              counts: counts
            })).tap.apply(ref, arguments);
          },
          call: function() {
            var ref;
            return (ref = describeScenario(spec(), {
              only: only,
              counts: counts
            })).call.apply(ref, arguments);
          },
          verifySpecHasBeenCovered: function() {
            return it('Verify that all descriptions in the specification have been covered', function() {
              var description, hasUncalled, j, k, l, len, len1, len2, ref, ref1, ref2, uncovered;
              uncovered = counts.getUncovered();
              ref = uncovered.GIVEN;
              for (j = 0, len = ref.length; j < len; j++) {
                description = ref[j];
                console.error('Uncovered GIVEN:', description);
              }
              ref1 = counts.getUncovered().WHEN;
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                description = ref1[k];
                console.error('Uncovered WHEN:', description);
              }
              ref2 = counts.getUncovered().THEN;
              for (l = 0, len2 = ref2.length; l < len2; l++) {
                description = ref2[l];
                console.error('Uncovered THEN:', description);
              }
              hasUncalled = uncovered.GIVEN.length > 0 || uncovered.WHEN.length > 0 || uncovered.THEN.length > 0;
              return assert(!hasUncalled, "Has uncovered descriptions in specification. " + (JSON.stringify(uncovered)));
            });
          }
        };
      };
      return {
        getRunner: function() {
          return _getRunner();
        }
      };
    };
    getCounts = function(spec) {
      var counts, keys;
      keys = {
        GIVEN: objKeys(spec.GIVEN || {}),
        THEN: objKeys(spec.THEN || {}),
        WHEN: objKeys(spec.WHEN || {}),
        TAP: objKeys(spec.TAP || {}),
        CALL: objKeys(spec.TAP || {})
      };
      counts = {
        GIVEN: {},
        WHEN: {},
        THEN: {},
        TAP: {}
      };
      return {
        GIVEN: {
          called: function(description) {
            var base;
            if ((base = counts.GIVEN)[description] == null) {
              base[description] = 0;
            }
            return counts.GIVEN[description]++;
          }
        },
        WHEN: {
          called: function(description) {
            var base;
            if ((base = counts.WHEN)[description] == null) {
              base[description] = 0;
            }
            return counts.WHEN[description]++;
          }
        },
        THEN: {
          called: function(description) {
            var base;
            if ((base = counts.THEN)[description] == null) {
              base[description] = 0;
            }
            return counts.THEN[description]++;
          }
        },
        TAP: {
          called: function(description) {
            var base;
            if ((base = counts.TAP)[description] == null) {
              base[description] = 0;
            }
            return counts.TAP[description]++;
          }
        },
        CALL: {
          called: function(description) {
            var base;
            if ((base = counts.TAP)[description] == null) {
              base[description] = 0;
            }
            return counts.TAP[description]++;
          }
        },
        getUncovered: function() {
          return {
            GIVEN: keys.GIVEN.filter(function(description) {
              return !counts.GIVEN[description];
            }),
            WHEN: keys.WHEN.filter(function(description) {
              return !counts.WHEN[description];
            }),
            THEN: keys.THEN.filter(function(description) {
              return !counts.THEN[description];
            })
          };
        }
      };
    };
    isRunner = function(fn) {
      return fn != null ? fn._isRunner : void 0;
    };
    buildDescription = function(fullDescription) {
      if (fullDescription == null) {
        fullDescription = '';
      }
      return {
        given: function(rest, args) {
          if (fullDescription) {
            return buildDescription(fullDescription + ", and " + (interpolate(rest, args)));
          } else {
            return buildDescription("Given " + (interpolate(rest, args)));
          }
        },
        when: function(rest, args) {
          return buildDescription(fullDescription + ", when " + (interpolate(rest, args)));
        },
        then: function(rest, args) {
          return buildDescription(fullDescription + ", then " + (interpolate(rest, args)));
        },
        get: function() {
          return fullDescription;
        },
        combine: function(nextDescription) {
          return buildDescription("" + fullDescription + (nextDescription.get()));
        }
      };
    };
    resolveResultArray = function(context, args) {
      var argsCopy, i, j, ref;
      argsCopy = _.clone(args);
      for (i = j = 0, ref = argsCopy.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        argsCopy[i] = resolveResultObject(context, argsCopy[i]);
      }
      return argsCopy;
    };
    resolveResultObject = function(context, object) {
      var key, objectCopy, result;
      return ((function() {
        if (object instanceof Result) {
          return object.getFromContext(context);
        } else if (!object) {
          return object;
        } else if (typeof object !== 'object') {
          return object;
        } else if (object instanceof Date) {
          return object;
        } else if (object instanceof RegExp) {
          return object;
        } else if (Array.isArray(object)) {
          return resolveResultArray(context, object);
        } else {
          objectCopy = _.clone(object);
          for (key in objectCopy) {
            result = objectCopy[key];
            objectCopy[key] = resolveResultObject(context, result);
          }
          return objectCopy;
        }
      })());
    };
    crossCombineResults = makeResult();
    lastResult = makeResult();
    describeScenario = function(spec, arg1) {
      var DONE, GIVEN, THEN, WHEN, bdd, buildContext, buildPromiseChain, counts, getGiven, getTap, getThen, getWhen, handlers, only, promiseBuilderFactory, stepRunnerFactory;
      only = arg1.only, counts = arg1.counts;
      GIVEN = spec.GIVEN, WHEN = spec.WHEN, THEN = spec.THEN, DONE = spec.DONE;
      stepRunnerFactory = function(name, collection) {
        return function(description) {
          var fn;
          fn = typeof description !== 'function' ? collection[description] : description;
          if (!fn) {
            throw new Error("'" + name + "' doesn't contain '" + description + "'");
          }
          if (isRunner(fn)) {
            return fn;
          }
          return function(context, extraContext, args) {
            var newContext, ref, resultToUnwrap, resultWrapped;
            if (!configOptions.sharedContext) {
              newContext = _.extend({}, context, extraContext);
              newContext.updateContext();
            } else {
              newContext = _.extend(context, extraContext);
            }
            resultWrapped = fn.apply(newContext, resolveResultArray((ref = crossCombineResults.getFromContext(context)) != null ? ref : {}, args));
            resultToUnwrap = isRunner(resultWrapped) ? {
              _runner: resultWrapped
            } : resultWrapped;
            return Q(resultToUnwrap).then(function(thenResult) {
              var nextStep, result;
              result = (thenResult != null ? thenResult._runner : void 0) ? thenResult._runner : thenResult;
              nextStep = function(result) {
                lastResult.setInContext(newContext, result);
                counts[name].called(description);
                return newContext;
              };
              if (isRunner(result)) {
                return result.run({
                  world: newContext
                }).then(nextStep);
              } else if (typeof result === 'function') {
                return Q.denodeify(result)().then(nextStep);
              } else {
                return nextStep(result);
              }
            });
          };
        };
      };
      getGiven = stepRunnerFactory('GIVEN', GIVEN);
      getWhen = stepRunnerFactory('WHEN', WHEN);
      getThen = stepRunnerFactory('THEN', THEN);
      getTap = stepRunnerFactory('TAP');
      buildContext = function() {
        var currentContext, updateContext;
        if (configOptions.sharedContext) {
          return {};
        }
        currentContext = null;
        updateContext = function() {
          return currentContext = this;
        };
        return {
          getContext: (function() {
            return currentContext;
          }),
          updateContext: updateContext
        };
      };
      handlers = function(done) {
        return {
          finish: function() {
            return typeof done === "function" ? done() : void 0;
          },
          fail: function(err) {
            if (done) {
              return done(err);
            }
            throw err;
          }
        };
      };
      buildPromiseChain = function(arg2) {
        var bddIt, chain, chains, currentChain, descriptionBuilder, multipleIt, promise, ref;
        descriptionBuilder = arg2.descriptionBuilder, promise = arg2.promise, chain = arg2.chain, multipleIt = arg2.multipleIt, bddIt = arg2.bddIt;
        if (bddIt) {
          if (multipleIt) {
            ref = chain.reduce(function(arg3, arg4) {
              var chains, currentChain, description, previousDescription, thenFn;
              chains = arg3[0], currentChain = arg3[1], previousDescription = arg3[2];
              thenFn = arg4.thenFn, description = arg4.description;
              assert.equal(typeof thenFn, 'function');
              if (description && previousDescription) {
                chains = chains.concat([currentChain]);
                currentChain = [];
              }
              currentChain = currentChain.concat([
                {
                  thenFn: thenFn,
                  description: description
                }
              ]);
              return [chains, currentChain, previousDescription || description];
            }, [[], []]), chains = ref[0], currentChain = ref[1];
            if (currentChain.length) {
              chains = chains.concat([currentChain]);
            }
            if (chains.length) {
              chains[chains.length - 1].push({
                thenFn: function() {
                  return typeof spec.done === "function" ? spec.done() : void 0;
                }
              });
            } else {
              chains = chains.concat([
                [
                  {
                    thenFn: function() {
                      return typeof spec.done === "function" ? spec.done() : void 0;
                    }
                  }
                ]
              ]);
            }
            return chains.forEach(function(chain, chainsIndex) {
              var ref1, ref2;
              return bddIt("" + ((ref1 = (ref2 = _.find(chain, function(c) {
                return c.description;
              })) != null ? ref2.description : void 0) != null ? ref1 : ''), function(done) {
                chain.forEach(function(arg3) {
                  var thenFn;
                  thenFn = arg3.thenFn;
                  return promise = promise.then(thenFn);
                });
                promise.then(function() {
                  return done();
                }).fail(done);
              });
            });
          } else {
            assert(descriptionBuilder);
            return bddIt(descriptionBuilder.get(), function(done) {
              var fail, finish, ref1;
              chain.forEach(function(arg3) {
                var thenFn;
                thenFn = arg3.thenFn;
                return promise = promise.then(thenFn);
              });
              ref1 = handlers(done), finish = ref1.finish, fail = ref1.fail;
              promise.then(function() {
                return typeof spec.done === "function" ? spec.done() : void 0;
              }).then(finish).fail(function(err) {
                if (typeof spec.done === "function") {
                  spec.done();
                }
                return fail(err);
              }).fail(fail);
            });
          }
        } else {
          chain.forEach(function(arg3) {
            var thenFn;
            thenFn = arg3.thenFn;
            return promise = promise.then(thenFn);
          });
          promise = promise.then(function() {
            return typeof spec.done === "function" ? spec.done() : void 0;
          }).fail(function(err) {
            if (typeof spec.done === "function") {
              spec.done();
            }
            throw err;
          });
          return promise;
        }
      };
      promiseBuilderFactory = function(arg2) {
        var chain;
        chain = (arg2 != null ? arg2 : {
          chain: I.List()
        }).chain;
        return {
          then: function(arg3) {
            var description, thenFn;
            thenFn = arg3.thenFn, description = arg3.description;
            return promiseBuilderFactory({
              chain: chain.push({
                thenFn: thenFn,
                description: description
              })
            });
          },
          chain: chain,
          combine: function(arg3) {
            var descriptionBuilder, rightPromiseBuilder, thenFn;
            descriptionBuilder = arg3.descriptionBuilder, rightPromiseBuilder = arg3.promiseBuilder;
            thenFn = function(context) {
              var newContext;
              if (configOptions.sharedContext) {
                return context;
              }
              newContext = buildContext();
              crossCombineResults.setInContext(newContext, crossCombineResults.getFromContext(context));
              return newContext;
            };
            return promiseBuilderFactory({
              chain: chain.push({
                thenFn: thenFn
              }).concat(rightPromiseBuilder.chain)
            });
          },
          resolve: function(arg3, context) {
            var bddIt, bodyFn, descriptionBuilder, multipleIt;
            descriptionBuilder = arg3.descriptionBuilder, bddIt = arg3.bddIt, multipleIt = arg3.multipleIt;
            bodyFn = function() {
              var deferred;
              assert(descriptionBuilder);
              deferred = Q.defer();
              deferred.resolve(context);
              return buildPromiseChain({
                promise: deferred.promise,
                chain: chain,
                descriptionBuilder: descriptionBuilder,
                bddIt: bddIt,
                multipleIt: multipleIt
              });
            };
            return bodyFn();
          }
        };
      };
      bdd = function(descriptionBuilder, promiseBuilder, options) {
        var run, skippedUntilHere;
        assert(options, 'Must call bdd with options');
        assert(promiseBuilder, 'bdd required promiseBuilder');
        skippedUntilHere = options.skippedUntilHere;
        run = function(options, done) {
          var bddIt, fail, finish, multipleIt, ref, ref1, ref2, runResult, testBodyFn, world;
          assert(!done || typeof done === 'function', 'Done isnt a function');
          ref = options != null ? options : {}, bddIt = ref.bddIt, multipleIt = ref.multipleIt, world = ref.world;
          if (bddIt == null) {
            bddIt = configOptions.bddIt;
          }
          if (multipleIt == null) {
            multipleIt = (ref1 = configOptions.defaults) != null ? ref1.multipleIt : void 0;
          }
          testBodyFn = function() {
            return promiseBuilder.resolve({
              descriptionBuilder: descriptionBuilder,
              bddIt: bddIt,
              multipleIt: multipleIt
            }, world != null ? world : buildContext());
          };
          if (bddIt) {
            assert(descriptionBuilder, '`bddIt` requires descriptionBuilder');
            assert(!done, 'Done cannot be provided for `bddIt`');
            testBodyFn();
          } else {
            ref2 = handlers(done), finish = ref2.finish, fail = ref2.fail;
            runResult = testBodyFn().then(finish).then(function() {
              return typeof spec.done === "function" ? spec.done() : void 0;
            }).fail(fail);
            return runResult;
          }
        };
        return {
          _isRunner: true,
          promiseBuilder: promiseBuilder,
          descriptionBuilder: descriptionBuilder,
          skippedUntilHere: skippedUntilHere,
          run: function() {
            var args, cb;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            assert(!cb || typeof cb === 'function', 'Cb is not a function');
            options = {};
            cb = null;
            if (typeof args[0] === 'function') {
              cb = args[0];
            } else {
              options = args[0], cb = args[1];
            }
            return run(options, cb);
          },
          resultTo: function(result) {
            return bdd(descriptionBuilder, promiseBuilder.then({
              description: '',
              thenFn: function(context) {
                var j, key, lastResultValue, len, r, ref, ref1, results, rkey;
                results = (ref = crossCombineResults.getFromContext(context)) != null ? ref : {};
                lastResultValue = lastResult.getFromContext(context);
                if (result instanceof Result) {
                  assert(result instanceof Result, 'Result must be created with bdd.result()');
                  result.setInContext(results, lastResultValue);
                } else if (hasNestedResults(result)) {
                  for (rkey in result) {
                    r = result[rkey];
                    assert(r instanceof Result, 'Subresult isnt bdd.result()');
                    r.setInContext(results, lastResultValue[rkey]);
                  }
                } else {
                  ref1 = objKeys(result);
                  for (j = 0, len = ref1.length; j < len; j++) {
                    key = ref1[j];
                    delete result[key];
                  }
                  _.extend(result, lastResultValue);
                }
                crossCombineResults.setInContext(context, results);
                return context;
              }
            }), options);
          },
          given: function() {
            var args, description, expandedDescription, given;
            description = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            expandedDescription = interpolate(description, args);
            given = getGiven(description);
            if (isRunner(given)) {
              return this.combine(given);
            }
            return bdd(descriptionBuilder.given(description, args), promiseBuilder.then({
              description: "Given " + expandedDescription,
              thenFn: function(context) {
                return given(context, {
                  description: expandedDescription
                }, args);
              }
            }), options);
          },
          when: function() {
            var args, description, expandedDescription, whenFn;
            description = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            expandedDescription = interpolate(description, args);
            whenFn = getWhen(description);
            if (isRunner(whenFn)) {
              return this.combine(whenFn);
            }
            return bdd(descriptionBuilder.when(description, args), promiseBuilder.then({
              description: "when " + expandedDescription,
              thenFn: function(context) {
                return whenFn(context, {
                  description: expandedDescription
                }, args);
              }
            }), options);
          },
          then: function() {
            var args, description, expandedDescription, thenFn;
            description = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            expandedDescription = interpolate(description, args);
            thenFn = getThen(description);
            if (isRunner(thenFn)) {
              return this.combine(thenFn);
            }
            return bdd(descriptionBuilder.then(description, args), promiseBuilder.then({
              description: "then " + expandedDescription,
              thenFn: function(context) {
                return thenFn(context, {
                  description: expandedDescription
                }, args);
              }
            }), options);
          },
          call: function() {
            var args, fn;
            fn = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return bdd(descriptionBuilder, promiseBuilder.then({
              description: '',
              thenFn: function(context) {
                return getTap(fn)(context, {}, args);
              }
            }), options);
          },
          tap: function() {
            var args, fn;
            fn = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            return bdd(descriptionBuilder, promiseBuilder.then({
              description: '',
              thenFn: function(context) {
                return getTap(fn)(context, {}, args);
              }
            }), options);
          },
          combine: function(rightBdd) {
            var newDescriptionBuilder;
            assert(rightBdd, 'right bdd not defined');
            if (rightBdd.skippedUntilHere) {
              return rightBdd;
            }
            newDescriptionBuilder = descriptionBuilder.combine(rightBdd.descriptionBuilder);
            return bdd(newDescriptionBuilder, promiseBuilder.combine({
              descriptionBuilder: newDescriptionBuilder,
              promiseBuilder: rightBdd.promiseBuilder
            }), options);
          },
          skipUntilHere: function() {
            return bdd(buildDescription(), promiseBuilderFactory(), _.extend({}, options, {
              skippedUntilHere: true
            }));
          },
          done: function(arg2) {
            var bddIt, multipleIt, ref, ref1, world;
            ref = arg2 != null ? arg2 : {}, multipleIt = ref.multipleIt, world = ref.world, bddIt = ref.it;
            if (bddIt == null) {
              bddIt = (ref1 = configOptions.bddIt) != null ? ref1 : global.it;
            }
            bddIt = only ? bddIt.only.bind(bddIt) : bddIt;
            return run({
              descriptionBuilder: descriptionBuilder,
              bddIt: bddIt,
              multipleIt: multipleIt,
              world: world
            });
          }
        };
      };
      return bdd(buildDescription(), promiseBuilderFactory(), {});
    };
    interpolate = function(description, args) {
      var kw;
      kw = _.last(args);
      return description.replace(/[$]{([^}]*)}/g, function(fullMatch, name, position, currentDescription) {
        assert(kw, "Keyword arguments not passed to spec description '" + description + "'");
        return kw[name];
      });
    };
    return exports;
  };

  module.exports = function(options) {
    return buildGwt({
      options: options
    });
  };

}).call(this);