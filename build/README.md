# Settlement Insights (72)

Build a modern fintech support dashboard called "SettlementAI".

The application is an AI-powered Settlement Q&A Agent that helps payment-platform support teams investigate why a transaction was or was not settled.

IMPORTANT:

* Build the frontend only initially.

* Do not create fake backend logic.

* Do not hardcode transaction results.

* The backend will later be connected through an n8n webhook.

* Keep the frontend components and data structures easy to connect to a REST API.

CORE USER FLOW:

1. User enters a transaction ID such as TXN1001.

2. User clicks "Trace Transaction".

3. Frontend sends the transaction ID to an n8n webhook.

4. n8n returns structured settlement analysis.

5. Frontend displays the result.

MAIN DASHBOARD:

Create a professional fintech SaaS dashboard with:

* Sidebar navigation

* Main dashboard

* Transaction search

* Settlement status card

* Transaction amount

* Gateway status

* Bank settlement status

* Ledger status

* Transaction timeline

* Root-cause explanation

* AI-generated explanation

* Confidence indicator

* Exception list

* Reconciliation status

SIDEBAR:

Logo:

SettlementAI

Navigation:

* Settlement Investigation

* Transactions

* Analytics

* Exceptions

For the MVP, only Settlement Investigation needs to be functional. The other pages can be visually present but marked as coming soon.

SEARCH AREA:

Create a prominent search card containing:

Label:

"Investigate a transaction"

Input:

"Enter transaction ID"

Placeholder:

"e.g. TXN1001"

Button:

"Trace Transaction"

Also provide a secondary date-search option labeled:

"Search by settlement date"

RESULT HEADER:

When a transaction is investigated, show:

Transaction ID

Settlement Status

Amount

Currency

Confidence Score

Use clear status badges:

SETTLED

PROCESSING

SETTLEMENT_FAILED

PAYMENT_FAILED

UNKNOWN

SYSTEM TRACE:

Create three cards side by side:

1. Payment Gateway

2. Bank Settlement

3. Internal Ledger

Each card should display:

* Status

* Amount

* Timestamp

* Reference ID when available

* Failure reason when available

TIMELINE:

Create a chronological transaction timeline.

Example:

Payment initiated

↓

Gateway processed

↓

Settlement initiated

↓

Bank response

↓

Ledger update

The timeline should be populated dynamically from the API response.

AI EXPLANATION:

Create a large card titled:

"AI Settlement Explanation"

Display:

* What happened

* Likely reason

* Recommended next step

Do not make the UI claim certainty if the backend returns low confidence.

CONFIDENCE:

Display a confidence indicator with:

* High

* Medium

* Low

Also display the numerical confidence percentage if returned by the backend.

EXCEPTIONS:

Create a clearly visible "Exceptions & Missing Information" section.

Each exception should be displayed as a warning item.

Examples:

* Bank record missing

* Ledger record missing

* Amount mismatch

* Settlement reason unavailable

* Conflicting system statuses

If there are no exceptions, display:

"No exceptions detected. All available records are consistent."

RECONCILIATION:

Display:

Gateway Amount

Bank Amount

Ledger Amount

and show:

✓ Amounts reconciled

or

⚠ Amount mismatch detected

LOADING STATE:

When Trace Transaction is clicked:

* Disable the button

* Show a loading spinner

* Display "Tracing transaction across financial systems..."

ERROR STATES:

If the transaction is not found:

"Transaction not found. Please verify the transaction ID."

If the API fails:

"Unable to reach the settlement investigation service. Please try again."

If the response is incomplete:

"Some financial records are unavailable. See the Exceptions section."

RESPONSIVE DESIGN:

Make the application responsive for desktop and tablet.

VISUAL STYLE:

Use a premium fintech SaaS aesthetic:

* Clean

* Professional

* Minimal

* Trustworthy

* Dashboard-oriented

* Subtle borders

* Cards

* Good spacing

* Clear typography

* Professional status badges

* Avoid excessive gradients

* Avoid cartoonish AI visuals

Use icons where appropriate.

IMPORTANT DATA CONTRACT:

The frontend should expect the n8n API to eventually return JSON approximately in this structure:

{

"transaction_id": "TXN1001",

"amount": 5000,

"currency": "INR",

"status": "SETTLED",

"confidence": 0.98,

"gateway": {},

"bank": {},

"ledger": {},

"reconciliation": {},

"timeline": [],

"analysis": {},

"exceptions": [],

"ai_explanation": ""

}

Create clean TypeScript interfaces/types for this response.

Keep the application ready for an API endpoint such as:

POST /webhook/settlement-investigation

Request body:

{

"transaction_id": "TXN1001"

}

Do not implement authentication yet.

Do not create payments.

Do not use real financial data.

This is a hackathon prototype using mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54f78083-1b81-43db-a80d-cc7b5c85f034).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
