# API contract: web app and FastAPI

This is the agreement between the web app (`apps/web`) and the FastAPI backend (`apps/api`). The front end is built in small steps, one pull request each. Every step below lists exactly what it needs from the API, so the backend can build the same step in parallel.

Until an endpoint exists, the web app runs on demo data (mocks in `apps/web/src/features/*/api/mocks.ts`) that follow these same shapes. When the endpoint is live, the front end switches to it with no UI changes.

## Ground rules

- **Base URL.** The app calls `VITE_API_URL` (locally `http://localhost:8000`).
- **Sign-in and cookies.** FastAPI owns sign-in through WorkOS AuthKit and sets a session cookie. Every request from the browser includes that cookie, and the browser never sees WorkOS or Microsoft tokens.
- **CORS.** The app and API are on different origins, so allow exactly the app's origin (locally `http://localhost:5173`, never `*`) with `allow_credentials=True`, and answer `OPTIONS` preflights. Requests with a JSON body send `Content-Type: application/json` and are preflighted. GETs and body-less POSTs are not.
- **JSON field names are camelCase** (`receivedAt`, `draftReply`). With Pydantic, give every response and request model this base so Python code stays snake_case:

  ```python
  from pydantic import BaseModel, ConfigDict
  from pydantic.alias_generators import to_camel

  class ApiModel(BaseModel):
      model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
  ```

- **Dates** are ISO 8601 strings in UTC, for example `"2026-10-27T14:10:00Z"`.
- **Ids** are strings.
- **Errors** use the HTTP status code. The app relies on these:
  - `401` from `/auth/me` when signed out (the app shows the sign-in page).
  - `404` for an unknown id (the app shows "Not found").
  - `409` when trying to change or approve a draft that was already approved.
  - `422` for an invalid request body (FastAPI's default).
- **Empty responses** return `204 No Content`.
- **OpenAPI.** Keep `/openapi.json` on. The front end runs `npm run gen:api` against it to generate TypeScript types, so the names here should match the Pydantic models.

## Step 0: already in the app

| Method | Path                      | Returns                                      |
| ------ | ------------------------- | -------------------------------------------- |
| GET    | `/auth/me`                | `200` User, or `401` when signed out         |
| GET    | `/auth/login?return_to=…` | Redirect to WorkOS, then back to `return_to` |
| GET    | `/messages?priority=…`    | `200` MessageSummary[] (priority optional)   |
| GET    | `/messages/{id}`          | `200` Message, or `404`                      |
| POST   | `/messages/{id}/approve`  | `204`. Sends the reply and sets `approvedAt` |

`return_to` must be validated on the server: accept only a path on the app (one leading `/`, no `//`, no backslashes), otherwise use `/inbox`.

```jsonc
// User
{ "id": "u1", "name": "Maya Lee", "email": "maya@example.com" }
```

`priority` is one of `"high"`, `"medium"`, `"low"`. The app sorts by priority, then newest first, so the order the API returns doesn't matter.

**The approval rule:** nothing is ever sent except by `POST /messages/{id}/approve`, which only runs when the user clicks Approve & send.

## Step 1: a one-line summary on each email

Adds `summary` to every message: one plain sentence from the AI on what the sender wants. `null` until the AI has read the message. The inbox shows the raw `preview` until then.

```jsonc
// MessageSummary (GET /messages)
{
  "id": "m1",
  "from": "orders@brightline.example",
  "subject": "Quote for 40 units by Friday",
  "preview": "Hi, we'd like a quote for 40 units of the standard package…",
  "summary": "Wants a quote for 40 units, delivered to Austin by Nov 14. Needs it by Friday.",
  "receivedAt": "2026-10-27T14:10:00Z",
  "priority": "high"
}

// Message (GET /messages/{id}) = MessageSummary plus:
{
  "body": "Hi, we'd like a quote for 40 units…",
  "draftReply": "Hi Maya, thanks for reaching out…", // or null when there's no draft
  "approvedAt": null // set when the user approves
}
```

## Step 2: Materials (upload forms and templates)

The forms and templates the AI may pre-fill. Accepted files: PDF, Word (`.doc`, `.docx`) and Excel (`.xls`, `.xlsx`), up to 20 MB. The app checks this before uploading, and the API should check it too.

| Method | Path              | Request                                      | Returns                |
| ------ | ----------------- | -------------------------------------------- | ---------------------- |
| GET    | `/materials`      |                                              | `200` Material[]       |
| POST   | `/materials`      | `multipart/form-data` with one field, `file` | `201` the new Material |
| DELETE | `/materials/{id}` |                                              | `204`, or `404`        |

Use `413` for a file that's too large and `415` for a file type that isn't accepted.

```jsonc
// Material
{
  "id": "mat-quote",
  "name": "Quote form", // display name; the file name without its extension is fine
  "fileName": "quote-form.pdf",
  "sizeBytes": 184320,
  "uploadedAt": "2026-10-20T16:00:00Z",
}
```

## Step 3: a pre-filled form on the AI draft

When an incoming email calls for one of the user's materials, the AI picks it and fills it in, using **only the current email and the uploaded materials**. Adds `filledForm` to `Message` (`null` when no form fits). It's sent along with the reply on approval.

```jsonc
// Message.filledForm
{
  "materialId": "mat-quote",
  "name": "Quote form",
  "fields": [
    { "id": "customer", "label": "Customer", "value": "Brightline" },
    { "id": "quantity", "label": "Quantity", "value": "40" },
    { "id": "deliver-by", "label": "Deliver by", "value": "November 14, 2026" },
  ],
}
```

Field `id`s must be stable for a given form, since step 4 edits fields by id. A `value` the AI couldn't fill is an empty string, and the app shows it as "Not filled".

## Step 4: edit the reply and the form before approving

| Method | Path                   | Request     | Returns                                   |
| ------ | ---------------------- | ----------- | ----------------------------------------- |
| PATCH  | `/messages/{id}/draft` | DraftUpdate | `200` the updated Message, `404` or `409` |

```jsonc
// DraftUpdate
{
  "draftReply": "Hi Maya, the quote for 45 units is attached…",
  "formValues": { "quantity": "45" }, // optional; keyed by field id
}
```

Fields left out of `formValues` keep their value. Return `422` for a field id that isn't on the form and `409` if the draft was already approved. Saving never sends anything. Only `POST /messages/{id}/approve` sends.

## Step 5: connect Outlook and sign out

The Settings page lets the user connect their Outlook account, see that it's connected, and disconnect it, and has a Sign out button. Until an account is connected, the inbox shows a Connect Outlook prompt instead of the message list. Nothing in steps 0 to 4 changes.

| Method | Path                                     | Returns                                             |
| ------ | ---------------------------------------- | --------------------------------------------------- |
| GET    | `/connections`                           | `200` Connection[] (empty until the user connects)  |
| GET    | `/connections/outlook/start?return_to=…` | Redirect to Microsoft, then back to `return_to`     |
| DELETE | `/connections/{id}`                      | `204`, or `404`. Disconnects and deletes the tokens |
| POST   | `/auth/logout`                           | `204`. Clears the session cookie                    |

```jsonc
// Connection
{
  "id": "con-1",
  "provider": "outlook", // more providers later (Gmail, Slack…), so the app never assumes Outlook only
  "accountEmail": "maya@brightline.example",
  "status": "connected", // or "reconnect_needed" when Microsoft rejects the stored token
  "connectedAt": "2026-10-30T16:00:00Z",
  "lastSyncedAt": "2026-10-30T17:40:00Z", // null until the first sync finishes
}
```

**Connecting.** The app sends the browser (a full page load, not a fetch) to `/connections/outlook/start?return_to=/settings`, the same way sign-in works. FastAPI runs the Microsoft OAuth flow, keeps the tokens on the server, and redirects back to `return_to` with `?connection=connected`, or `?connection=failed` if the user cancelled or Microsoft refused. Validate `return_to` exactly like `/auth/login` (a path on the app, otherwise `/settings`). The browser never sees Microsoft tokens.

- **Permissions to ask Microsoft for:** `Mail.Read` (read the inbox), `Mail.Send` (send the reply only when the user clicks Approve & send), `User.Read` (the account's email address) and `offline_access` (keep syncing without asking again).
- **Before the user connects,** `GET /messages` returns `[]`, not an error. The app shows an empty inbox with a link to Settings.
- **`reconnect_needed`** tells the app to show a Reconnect button, which goes through the same `/start` link.

**Signing out.** `POST /auth/logout` clears the session cookie, and should also end the WorkOS session so the next sign-in asks again. It has no body, so the browser sends it without a CORS preflight. After it returns, the app clears its data and shows the sign-in page. Signing out does not disconnect Outlook.

## Step 6: a getting-started checklist

New users see three steps at the top of the inbox until they're done: connect Outlook, upload a form, approve a first draft. The first two come from `GET /connections` and `GET /materials`. For the third, and so the list can mark what's already been approved, each item in `GET /messages` also carries two fields:

```jsonc
// MessageSummary, two new fields
{
  "id": "m1",
  // …the fields from steps 0 and 1…
  "hasDraft": true, // true when the AI drafted a reply (draftReply isn't null), so the checklist links to one
  "approvedAt": null, // same value as on the full Message; set once the user approves
}
```

No new endpoints.

## Step 7: say why the AI ranked and filled things

So people can trust a draft before they approve it, the app shows why each message got its priority, and which words of the email each form value came from. Two new fields, no new endpoints:

```jsonc
// MessageSummary (in GET /messages and GET /messages/{id})
{
  // …the fields from earlier steps…
  "priorityReason": "A customer is asking for a quote with a Friday deadline.", // one line; null until ranked
}

// FormField (in filledForm.fields)
{
  "id": "quantity",
  "label": "Quantity",
  "value": "40",
  "source": "40 units", // the words in the email the value came from; null if it didn't come from the email
}
```

- **`source` is copied exactly** from the email body (or the sender's address), character for character, so the app can find and highlight it in the message. Don't paraphrase it.
- **`null` means the value didn't come from the email**: the AI worked it out (a total, say). The app tells the user to check those. Values taken from the user's own documents are covered in step 10.
- **When `PATCH /messages/{id}/draft` changes a field's value, set its `source` to `null`.** The user's own value no longer comes from the email.

## Step 8: time saved this week

Once the user has approved something, the inbox shows the last 7 days: drafts approved, forms filled, and an estimate of the time saved. The app works out the minutes itself (4 per reply, 6 per form, shown to the user as an estimate), so the backend only counts:

| Method | Path          | Returns           |
| ------ | ------------- | ----------------- |
| GET    | `/stats/week` | `200` WeeklyStats |

```jsonc
// WeeklyStats: the signed-in user's own approvals in the last 7 days
{
  "draftsApproved": 18,
  "formsApproved": 7, // approved drafts that came with a filled form
}
```

## Step 10: say which uploaded document a value came from

The AI fills forms from the email and from the user's own documents, like a unit price from their price list. Step 7 can only quote the email, so a value from a document looked like a guess. One new field on `FormField`, no new endpoints:

```jsonc
// FormField (in filledForm.fields)
{
  "id": "unit-price",
  "label": "Unit price",
  "value": "$42.00",
  "source": "Standard package: $42.00 per unit", // the words in the document named below
  "sourceMaterial": { "id": "mat-prices", "name": "Price list" }, // null when the value came from the email or was worked out
}
```

- **`sourceMaterial` names the uploaded material the value came from**, and `source` then holds the exact words from that document. The app quotes them under the value ("From Price list: …") and doesn't look for them in the email.
- **`sourceMaterial` is `null`** for a value from the email (`source` is the email's words, as in step 7) and for a value the AI worked out (`source` is `null` too).
- **Keep the name as it was when the form was filled**, so the value still says where it came from after the user deletes or renames that material.
- **When `PATCH /messages/{id}/draft` changes a field's value, set both `source` and `sourceMaterial` to `null`.**
- **Materials can be reference documents as well as forms**, such as a price list or a rate sheet. No change to `/materials`: the AI decides which uploads are forms to fill and which are documents to fill them from.
- An older response without `sourceMaterial` reads as `null`, so this can ship after the front end.

## Trying the app against the real API

Create `apps/web/.env.development.local` (it's gitignored):

```bash
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:8000
```

Then run `npm run dev` in `apps/web` and open `http://localhost:5173`. Use `.env.development.local` rather than `.env.local`, because `.env.development` turns the demo data on and wins over `.env.local` in dev mode.
