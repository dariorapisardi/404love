---
"@404love/next": patch
---

Restore the `next` peer range to `^16.2.6`. 0.4.0 shipped with `^16.4.1` after an automated dependency bump, which made `npm install` fail with ERESOLVE on Next 16.2 and 16.3. The SDK works on Next 16.2.6 and later.
