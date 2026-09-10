import type {Category} from '../src/lib/classify';
import type {Challenge} from './challenge';
export interface Env {
 ASSETS: Fetcher;
 LAB: DurableObjectNamespace;
 RETENTION_DAYS: string;
 FEEDBACK_RETENTION_DAYS: string;
 TOKEN_TTL_SECONDS: string;
 LAB_ADMIN_KEY?: string;
}
export interface Counts {ai:number;human:number;bot:number;unknown:number;total:number}
export interface PeriodStats {
 from:string;to:string;counts:Counts;
 pages:{id:string;requests:number}[];
 agents:{label:string;requests:number}[];
 statuses:{status:number;requests:number}[];
 formats:{format:string;requests:number}[];
 trend:{from:string;to:string;requests:number}[];
 feedback:{count:number;average:number|null;items:{id:string;page:string;agent:string;rating:number;comment:string;updatedAt:string;verification:string}[]};
}
export interface Snapshot {schemaVersion:1;classifierVersion:string;scope:string;collectedSince:string;asOf:string;periods:{'24h':PeriodStats;'30d':PeriodStats}}
export interface Invitation {token:string;expiresAt:string;page:string;agent:string;test:boolean;challenge:Challenge}
export interface ContextResult {snapshot:Snapshot;invitation?:Invitation;invitationUnavailable?:boolean}
export interface RequestEvent {page:string;category:Category;agent:string;status:number;format:'html'|'markdown'}
