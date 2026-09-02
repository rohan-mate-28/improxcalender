import {NextResponse} from "next";
import {readJson} from "@/lib/storage";
import type {Calendar} from "@/lib/types";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const calendars=await readJson<Calendar[]>("calendars",[]);const c=calendars.find(x=>x.id===id);if(!c)return NextResponse.json({error:"Calendar not found."},{status:404});return NextResponse.json(c)}catch(e){console.error(e);return NextResponse.json({error:"Unable to load calendar."},{status:500})}}