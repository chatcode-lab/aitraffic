import {defineConfig} from '@playwright/test';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
const localLibs=resolve('artifacts/browser-deps/root/usr/lib/x86_64-linux-gnu');
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,workers:1,timeout:30_000,
 use:{baseURL:'http://127.0.0.1:8788',extraHTTPHeaders:{'X-AITraffic-Test':'1'},trace:'off',screenshot:'off',launchOptions:existsSync(localLibs)?{env:{...process.env,LD_LIBRARY_PATH:localLibs+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'')}}:{}},
 webServer:{command:'npx wrangler dev --config wrangler.test.jsonc --port 8788 --ip 127.0.0.1 --log-level error --persist-to .wrangler/test-state',url:'http://127.0.0.1:8788/api/v1/stats',reuseExistingServer:false,timeout:60_000},
 reporter:[['list']],
});
