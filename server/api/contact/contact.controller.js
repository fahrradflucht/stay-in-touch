/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/contacts              ->  index
 * POST    /api/contacts              ->  create
 * GET     /api/contacts/:id          ->  show
 * PUT     /api/contacts/:id          ->  update
 * DELETE  /api/contacts/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Contact from './contact.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
  };
}

function addInteraction(interaction) {
  return function(entity) {
    var updated = _.merge(entity, entity.interactions.push(interaction));
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeInteraction(interactionId) {
  return function(entity) {
    var updated = _.merge(entity, entity.interactions.pull({_id: interactionId}));
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function handleUnauthorized(req, res) {
  return function(entity) {
    if(!entity) {
      return null;
    }
    if(entity.user.toString() !== req.user._id.toString()){
      res.send(403).end();
      return null;
    }
    return entity;
  }
}

// Gets a list of Contacts
export function index(req, res) {
  return Contact.find({ user: req.user }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Contact from the DB
export function show(req, res) {
  return Contact.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Contact in the DB
export function create(req, res) {
  req.body.user = req.user;
  return Contact.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Contact in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Contact.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Contact from the DB
export function destroy(req, res) {
  return Contact.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function createInteraction(req, res) {
  return Contact.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res))
    .then(addInteraction(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function destroyInteraction(req, res) {
  return Contact.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(handleUnauthorized(req, res))
    .then(removeInteraction(req.params.interactionId))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
