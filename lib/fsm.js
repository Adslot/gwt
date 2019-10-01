// Generated by CoffeeScript 1.9.3
(function() {
  var Q, actionMapper, assert, generateActions, generators, playbackActions, runTests, stepActionGenerator;

  assert = require('assert');

  Q = require('q');

  generators = require('jsquickcheck').generators;

  stepActionGenerator = function(arg) {
    var actionMap, model;
    actionMap = arg.actionMap, model = arg.model;
    if (actionMap.length === 1) {
      return actionMap[0];
    }
    return actionMap[generators.integer(0, actionMap.length - 1)()];
  };

  actionMapper = function(arg) {
    var actions, model;
    model = arg.model, actions = arg.actions;
    return actions.filter(function(actionGen) {
      return actionGen.preCondition({
        model: model
      });
    }).map(function(actionGen) {
      return actionGen.getActions({
        model: model
      });
    }).reduce(function(actions, nextActions) {
      return actions.concat(nextActions);
    }, []);
  };

  generateActions = function(arg) {
    var Model, actionMap, actions, getActionMap, i, j, lastAction, model, tries;
    Model = arg.Model, getActionMap = arg.getActionMap;
    model = Model();
    assert(model, 'model from Model()');
    actions = [];
    lastAction = null;
    for (i = j = 0; j <= 100; i = ++j) {
      lastAction = null;
      tries = 100;
      while (tries-- > 0 && (!lastAction)) {
        actionMap = actionMapper({
          model: model,
          actions: getActionMap({
            model: model
          })
        });
        lastAction = stepActionGenerator({
          actionMap: actionMap,
          model: model
        });
      }
      if (lastAction) {
        actions.push(lastAction);
        model = lastAction.modelFn({
          model: model
        }).model;
        assert(model, 'Model from modelFn');
      }
    }
    return actions;
  };

  playbackActions = function(arg) {
    var actions, deferred, spec;
    spec = arg.spec, actions = arg.actions;
    deferred = Q.defer();
    deferred.resolve({
      actual: spec.Actual(),
      model: spec.Model()
    });
    return actions.reduce(function(promise, action) {
      return promise.then(function(arg1) {
        var actual, model;
        actual = arg1.actual, model = arg1.model;
        return Q(action.fn({
          actual: actual
        })).then(function(arg2) {
          var actual;
          actual = arg2.actual;
          return Q(action.modelFn({
            model: model
          })).then(function(arg3) {
            var model, next;
            model = arg3.model;
            next = {
              actual: actual,
              model: model
            };
            assert(action.postCondition(next));
            return next;
          });
        });
      });
    }, deferred.promise);
  };

  runTests = function(spec) {
    var deferred;
    deferred = Q.defer();
    deferred.resolve();
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(function(promise, i) {
      return promise.then(function() {
        return playbackActions({
          actions: generateActions(spec),
          spec: spec
        });
      });
    }, deferred.promise);
  };

  module.exports = {
    runTests: runTests
  };

}).call(this);