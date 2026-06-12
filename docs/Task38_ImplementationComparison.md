# Task 38: Compare Two Implementation Approaches — Offline Data Storage

**Decision:** Should the mobile app use PouchDB or AsyncStorage for local certificate storage?  
**AI usage:** AI used to generate the pros/cons table. Final recommendation made manually.

---

## Context

The mobile app needs to store certificate data locally on the device so operators can work offline. Two options were considered:

**Option A — PouchDB** (what we implemented)  
A full document database that runs in the app, with built-in sync to CouchDB/compatible servers.

**Option B — AsyncStorage + manual sync**  
React Native's built-in key-value store, with a custom sync layer built on top.

---

## Comparison

| Factor | PouchDB | AsyncStorage + manual sync |
|---|---|---|
| **Setup complexity** | Medium — needs PouchDB plugin setup | Low — built into React Native |
| **Querying** | Good — has `pouchdb-find` for filtering | Poor — must load all data and filter in JS |
| **Conflict resolution** | Built-in — handles concurrent offline edits automatically | Manual — must write conflict detection yourself |
| **Sync to server** | Built-in with CouchDB | Manual — must write entire sync layer |
| **Data size limits** | Large — designed for documents | Small — not suitable for large datasets |
| **TypeScript support** | Good — typed with `@types/pouchdb` | Good — built-in |
| **Testing** | Good — in-memory adapter for tests | Good — can mock easily |
| **Offline-first design** | Core feature — designed for this | Possible but requires significant extra work |
| **Learning curve** | Medium — new API to learn | Low — simple get/set API |
| **Production readiness** | High — used in enterprise offline apps | Low for complex data — suited to simple preferences |
| **Bundle size** | Larger (~200kb) | Minimal — already included in RN |
| **Community/maintenance** | Active but older ecosystem | Backed by React Native core team |

---

## Recommendation: PouchDB

For a weighbridge certificate system, **PouchDB is the right choice** for these reasons:

**1. Conflict resolution is a hard requirement.**  
Multiple operators may be working on the same site with the same certificates. Without built-in conflict resolution, building a reliable sync layer with AsyncStorage would take weeks and would still be less robust than PouchDB's proven implementation.

**2. Querying is essential.**  
The certificate list needs to filter by company, site, status, and dirty flag. With AsyncStorage you'd have to load every certificate into memory and filter in JavaScript — which won't scale once a site has hundreds of certificates.

**3. The certificate schema is complex.**  
A certificate document has nested objects (tenant, workflow, readings, computed). Serialising and deserialising this to a flat key-value store manually is error-prone and makes the code harder to maintain.

**The only scenario where AsyncStorage would be better** is if the data was simple preferences (user settings, UI state) rather than domain data. For a complex, synced, queryable document store, PouchDB is the appropriate tool.

---

## What I would do differently

If starting again I would evaluate **WatermelonDB** as a third option — it's a newer React Native database with better performance for large datasets and a cleaner API than PouchDB. It wasn't considered here because PouchDB was already specified in the Task 8 schema design, but WatermelonDB would be worth evaluating for a production version of this app.
