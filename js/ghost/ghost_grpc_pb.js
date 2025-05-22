// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var ghost_ghost_pb = require('../ghost/ghost_pb.js');

function serialize_ghost_MatchInfoRequest(arg) {
  if (!(arg instanceof ghost_ghost_pb.MatchInfoRequest)) {
    throw new Error('Expected argument of type ghost.MatchInfoRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ghost_MatchInfoRequest(buffer_arg) {
  return ghost_ghost_pb.MatchInfoRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ghost_MatchInfoResponse(arg) {
  if (!(arg instanceof ghost_ghost_pb.MatchInfoResponse)) {
    throw new Error('Expected argument of type ghost.MatchInfoResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ghost_MatchInfoResponse(buffer_arg) {
  return ghost_ghost_pb.MatchInfoResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ghost_MatchStatusRequest(arg) {
  if (!(arg instanceof ghost_ghost_pb.MatchStatusRequest)) {
    throw new Error('Expected argument of type ghost.MatchStatusRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ghost_MatchStatusRequest(buffer_arg) {
  return ghost_ghost_pb.MatchStatusRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ghost_MatchStatusResponse(arg) {
  if (!(arg instanceof ghost_ghost_pb.MatchStatusResponse)) {
    throw new Error('Expected argument of type ghost.MatchStatusResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_ghost_MatchStatusResponse(buffer_arg) {
  return ghost_ghost_pb.MatchStatusResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var GhostService = exports.GhostService = {
  // Used to retrieve info about the match specific to the sport
getMatchInfo: {
    path: '/ghost.Ghost/GetMatchInfo',
    requestStream: false,
    responseStream: false,
    requestType: ghost_ghost_pb.MatchInfoRequest,
    responseType: ghost_ghost_pb.MatchInfoResponse,
    requestSerialize: serialize_ghost_MatchInfoRequest,
    requestDeserialize: deserialize_ghost_MatchInfoRequest,
    responseSerialize: serialize_ghost_MatchInfoResponse,
    responseDeserialize: deserialize_ghost_MatchInfoResponse,
  },
  // Used to check the availability of the match for Ghost
getMatchStatus: {
    path: '/ghost.Ghost/GetMatchStatus',
    requestStream: false,
    responseStream: false,
    requestType: ghost_ghost_pb.MatchStatusRequest,
    responseType: ghost_ghost_pb.MatchStatusResponse,
    requestSerialize: serialize_ghost_MatchStatusRequest,
    requestDeserialize: deserialize_ghost_MatchStatusRequest,
    responseSerialize: serialize_ghost_MatchStatusResponse,
    responseDeserialize: deserialize_ghost_MatchStatusResponse,
  },
};

exports.GhostClient = grpc.makeGenericClientConstructor(GhostService, 'Ghost');
