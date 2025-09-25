import { ParsedResult } from '../domain/types';

export interface ParseRequest { id: string; fileName: string; arrayBuffer: ArrayBuffer; mime: string | undefined }
export interface ParseResponseOk { id: string; status: 'ok'; data: ParsedResult }
export interface ParseResponseErr { id: string; status: 'error'; error: string }
export type ParseResponse = ParseResponseOk | ParseResponseErr;
