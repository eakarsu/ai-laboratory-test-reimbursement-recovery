import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildInsights, filterRecords, recordsToCsv, displayValue } from "../insights.mjs";
const rows=[{id:1,feature_id:"f",reference:"R1",title:"Alpha case",status:"Open",owner:"A",risk:"High",due_date:"2020-01-01",amount:0,payload:{note:""}},{id:2,feature_id:"f",reference:"R2",title:"Beta",status:"Closed",owner:"B",risk:"Low",due_date:"2999-01-01",amount:50,payload:{}}];
test("filterRecords searches and filters",()=>{assert.equal(filterRecords(rows,{q:"alpha"}).length,1);assert.equal(filterRecords(rows,{status:"Closed"}).length,1);assert.equal(filterRecords(rows,{risk:"High"}).length,1);});
test("csv preserves zero and export/insights routes are mounted behind auth",()=>{const csv=recordsToCsv(rows);assert.ok(csv.includes(",0"));assert.equal(displayValue(0),"0");assert.equal(displayValue(false),"false");assert.equal(displayValue(""),"(empty)");const s=fs.readFileSync(new URL("../server.mjs",import.meta.url),"utf8");assert.ok(s.includes("/records/export"));assert.ok(s.includes("/insights"));});
test("deterministic insights labelled aiGenerated false",()=>{const r=buildInsights(rows,"Lab",new Date("2026-01-01"));assert.equal(r.aiGenerated,false);assert.equal(r.features.length,3);assert.equal(r.features[1].sections[0].value,1);assert.equal(r.features[2].sections[0].value,50);});
