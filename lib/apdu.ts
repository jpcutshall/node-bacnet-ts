'use strict';

import * as baAsn1   from './asn1';
import * as baEnum   from './enum';
import { InternalBuffer } from './types';

const debug       = require('debug')('bacnet:apdu:debug');
const trace       = require('debug')('bacnet:apdu:trace');

export const getDecodedType = (buffer: Buffer, offset: number) => {
  return buffer[offset];
};

export const setDecodedType = (buffer: Buffer, offset: number, type) => {
  buffer[offset] = type;
};

export const getDecodedInvokeId = (buffer: Buffer, offset: number) => {
  const type = getDecodedType(buffer, offset);
  switch (type & baEnum.PDU_TYPE_MASK) {
    case baEnum.PduType.SIMPLE_ACK:
    case baEnum.PduType.COMPLEX_ACK:
    case baEnum.PduType.ERROR:
    case baEnum.PduType.REJECT:
    case baEnum.PduType.ABORT:
      return buffer[offset + 1];
    case baEnum.PduType.CONFIRMED_REQUEST:
      return buffer[offset + 2];
    default:
      return undefined;
  }
};

export const encodeConfirmedServiceRequest = (buffer: InternalBuffer, type: number, service: number, maxSegments: number, maxApdu: number, invokeId: number, sequencenumber: number, proposedWindowSize: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = maxSegments | maxApdu;
  buffer.buffer[buffer.offset++] = invokeId;
  if ((type & baEnum.PduConReqBit.SEGMENTED_MESSAGE) > 0) {
    buffer.buffer[buffer.offset++] = sequencenumber;
    buffer.buffer[buffer.offset++] = proposedWindowSize;
  }
  buffer.buffer[buffer.offset++] = service;
};

export const decodeConfirmedServiceRequest = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const maxSegments = buffer[offset] & 0xF0;
  const maxApdu = buffer[offset++] & 0x0F;
  const invokeId = buffer[offset++];
  let sequencenumber = 0;
  let proposedWindowNumber = 0;
  if ((type & baEnum.PduConReqBit.SEGMENTED_MESSAGE) > 0) {
    sequencenumber = buffer[offset++];
    proposedWindowNumber = buffer[offset++];
  }
  const service = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    service,
    maxSegments,
    maxApdu,
    invokeId,
    sequencenumber,
    proposedWindowNumber
  };
};

export const encodeUnconfirmedServiceRequest = (buffer: InternalBuffer, type: number, service: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = service;
};

export const decodeUnconfirmedServiceRequest = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const service = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    service
  };
};

export const encodeSimpleAck = (buffer: InternalBuffer, type: number, service: number, invokeId: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = invokeId;
  buffer.buffer[buffer.offset++] = service;
};

export const decodeSimpleAck = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const invokeId = buffer[offset++];
  const service = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    service,
    invokeId
  };
};

export const encodeComplexAck = (buffer: InternalBuffer, type: number, service: number, invokeId: number, sequencenumber: number, proposedWindowNumber: number) => {
  let len = 3;
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = invokeId;
  if ((type & baEnum.PduConReqBit.SEGMENTED_MESSAGE) > 0) {
    buffer.buffer[buffer.offset++] = sequencenumber;
    buffer.buffer[buffer.offset++] = proposedWindowNumber;
    len += 2;
  }
  buffer.buffer[buffer.offset++] = service;
  return len;
};

export const decodeComplexAck = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const invokeId = buffer[offset++];
  let sequencenumber = 0;
  let proposedWindowNumber = 0;
  if ((type & baEnum.PduConReqBit.SEGMENTED_MESSAGE) > 0) {
    sequencenumber = buffer[offset++];
    proposedWindowNumber = buffer[offset++];
  }
  const service = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    service,
    invokeId,
    sequencenumber,
    proposedWindowNumber
  };
};

export const encodeSegmentAck = (buffer: InternalBuffer, type: number, originalInvokeId: number, sequencenumber: number, actualWindowSize: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = originalInvokeId;
  buffer.buffer[buffer.offset++] = sequencenumber;
  buffer.buffer[buffer.offset++] = actualWindowSize;
};

export const decodeSegmentAck = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const originalInvokeId = buffer[offset++];
  const sequencenumber = buffer[offset++];
  const actualWindowSize = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    originalInvokeId,
    sequencenumber,
    actualWindowSize
  };
};

export const encodeResult = (buffer: InternalBuffer, /* BvlcResultFormat */ resultCode: number) => {
  baAsn1.encodeUnsigned(buffer, resultCode, 2);
};

export const decodeResult = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const decode = baAsn1.decodeUnsigned(buffer, offset, 2);
  offset += decode.len;
  return {
    len: offset - orgOffset,
    resultCode: decode.value, // BvlcResultFormat
  };
};

export const encodeError = (buffer: InternalBuffer, type: number, service: number, invokeId: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = invokeId;
  buffer.buffer[buffer.offset++] = service;
};

export const decodeError = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const invokeId = buffer[offset++];
  const service = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    service,
    invokeId
  };
};

export const encodeAbort = (buffer: InternalBuffer, type: number, invokeId: number, reason: number) => {
  buffer.buffer[buffer.offset++] = type;
  buffer.buffer[buffer.offset++] = invokeId;
  buffer.buffer[buffer.offset++] = reason;
};

export const decodeAbort = (buffer: Buffer, offset: number) => {
  const orgOffset = offset;
  const type = buffer[offset++];
  const invokeId = buffer[offset++];
  const reason = buffer[offset++];
  return {
    len: offset - orgOffset,
    type,
    invokeId,
    reason
  };
};
