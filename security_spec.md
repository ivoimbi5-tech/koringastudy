# Security Specification for KORINGA.Study

## 1. Data Invariants
- A user can only access their own profile.
- Subjects, Sessions, Tasks, and Cards are sub-resources of a User and must inherit ownership.
- XP and Level can only be incremented, never decremented by the client.
- `createdAt` and `userId` are immutable after creation.
- Tasks must have a title and default to `completed: false`.

## 2. The "Dirty Dozen" Payloads (Denial Expected)
1. **Identity Theft**: User A tries to read User B's profile.
2. **Orphaned Subject**: Creating a subject with a `userId` field that doesn't match the path.
3. **Stat Spoofing**: Updating `xp` to a negative value or jumping 10 levels at once.
4. **Time Travel**: Setting `createdAt` to a future date.
5. **Universal Access**: Querying `/users/{any}/subjects` without a specific UID filter.
6. **Task Hijacking**: User A tries to complete User B's task.
7. **Schema Poisoning**: Adding a 1MB junk string to a subject name.
8. **Resource Exhaustion**: Creating 10,000 flashcards in a single batch.
9. **Role Escalation**: Trying to add an `isAdmin: true` field to the profile.
10. **Malicious ID**: Using `../evil/path` as a document ID.
11. **Session Forgery**: Creating a study session for a subject that doesn't exist.
12. **Streak Hacking**: Manually updating the `streak` count without an actual study session.

## 3. Test Runner (Conceptual)
All tests should verify `PERMISSION_DENIED` for the above payloads.
[Rules implementation follows]
