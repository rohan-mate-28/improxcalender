import {getStore} from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";
const store=getStore("improx-calendar");
const isNetlify=process.env.NETLIFY==="true"||!!process.env.NETLIFY_BLOBS_CONTEXT;
async function localRead<T>(file:string,fallback:T):Promise<T>{try{return JSON.parse(await fs.readFile(path.join(process.cwd(),"data",file),"utf8")) as T}catch{return fallback}}
async function localWrite<T>(file:string,value:T){await fs.mkdir(path.join(process.cwd(),"data"),{recursive:true});await fs.writeFile(path.join(process.cwd(),"data",file),JSON.stringify(value,null,2),"utf8")}
export async function readJson<T>(key:string,fallback:T):Promise<T>{if(isNetlify){const v=await store.get(key,{type:"json"});return (v as T|null)??fallback}return localRead(key==="events"?"events.json":"calendars.json",fallback)}
export async function writeJson<T>(key:string,value:T){if(isNetlify){await store.setJSON(key,value);return}await localWrite(key==="events"?"events.json":"calendars.json",value)}