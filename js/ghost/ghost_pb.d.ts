// package: ghost
// file: ghost/ghost.proto

import * as jspb from "google-protobuf";

export class MatchInfoRequest extends jspb.Message {
  getMatchUrn(): string;
  setMatchUrn(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchInfoRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MatchInfoRequest): MatchInfoRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchInfoRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchInfoRequest;
  static deserializeBinaryFromReader(message: MatchInfoRequest, reader: jspb.BinaryReader): MatchInfoRequest;
}

export namespace MatchInfoRequest {
  export type AsObject = {
    matchUrn: string,
  }
}

export class MatchInfoResponse extends jspb.Message {
  hasCs2(): boolean;
  clearCs2(): void;
  getCs2(): CS2MatchInfoResponse | undefined;
  setCs2(value?: CS2MatchInfoResponse): void;

  hasDota2(): boolean;
  clearDota2(): void;
  getDota2(): Dota2MatchInfoResponse | undefined;
  setDota2(value?: Dota2MatchInfoResponse): void;

  getMatchInfoCase(): MatchInfoResponse.MatchInfoCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MatchInfoResponse): MatchInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchInfoResponse;
  static deserializeBinaryFromReader(message: MatchInfoResponse, reader: jspb.BinaryReader): MatchInfoResponse;
}

export namespace MatchInfoResponse {
  export type AsObject = {
    cs2?: CS2MatchInfoResponse.AsObject,
    dota2?: Dota2MatchInfoResponse.AsObject,
  }

  export enum MatchInfoCase {
    MATCH_INFO_NOT_SET = 0,
    CS2 = 1,
    DOTA2 = 2,
  }
}

export class CS2MatchInfoResponse extends jspb.Message {
  getMapName(): string;
  setMapName(value: string): void;

  getMapAssetName(): string;
  setMapAssetName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CS2MatchInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CS2MatchInfoResponse): CS2MatchInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CS2MatchInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CS2MatchInfoResponse;
  static deserializeBinaryFromReader(message: CS2MatchInfoResponse, reader: jspb.BinaryReader): CS2MatchInfoResponse;
}

export namespace CS2MatchInfoResponse {
  export type AsObject = {
    mapName: string,
    mapAssetName: string,
  }
}

export class Dota2MatchInfoResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Dota2MatchInfoResponse.AsObject;
  static toObject(includeInstance: boolean, msg: Dota2MatchInfoResponse): Dota2MatchInfoResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Dota2MatchInfoResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Dota2MatchInfoResponse;
  static deserializeBinaryFromReader(message: Dota2MatchInfoResponse, reader: jspb.BinaryReader): Dota2MatchInfoResponse;
}

export namespace Dota2MatchInfoResponse {
  export type AsObject = {
  }
}

export class MatchStatusRequest extends jspb.Message {
  getMatchUrn(): string;
  setMatchUrn(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MatchStatusRequest): MatchStatusRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchStatusRequest;
  static deserializeBinaryFromReader(message: MatchStatusRequest, reader: jspb.BinaryReader): MatchStatusRequest;
}

export namespace MatchStatusRequest {
  export type AsObject = {
    matchUrn: string,
  }
}

export class MatchStatusResponse extends jspb.Message {
  getMatchStatus(): MatchStatusMap[keyof MatchStatusMap];
  setMatchStatus(value: MatchStatusMap[keyof MatchStatusMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MatchStatusResponse): MatchStatusResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatchStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchStatusResponse;
  static deserializeBinaryFromReader(message: MatchStatusResponse, reader: jspb.BinaryReader): MatchStatusResponse;
}

export namespace MatchStatusResponse {
  export type AsObject = {
    matchStatus: MatchStatusMap[keyof MatchStatusMap],
  }
}

export interface MatchStatusMap {
  MATCH_STATUS_UNDEFINED: 0;
  MATCH_STATUS_AVAILABLE: 1;
  MATCH_STATUS_UNAVAILABLE: 2;
}

export const MatchStatus: MatchStatusMap;

