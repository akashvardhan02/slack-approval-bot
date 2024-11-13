
# Slack Approval Bot

This Slack bot enables an organizational approval system within Slack. Users can request approvals from designated approvers, and approvers can approve or reject these requests directly in Slack. The requester is notified of the outcome.

## Features
- **Slash Command**: `/approval-test` opens a modal for requesting approval.
- **Modal Input**: Requester can select an approver, enter an approval message, and submit.
- **Approval Actions**: Approvers receive the request with "Approve" and "Reject" buttons.
- **Notifications**: Requester is notified of the approver's decision (approved or rejected).

## Requirements
- Node.js and npm
- A Slack workspace with a bot configured
- Environment variables set for Slack API tokens

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/akashvardhan02/slack-approval-bot
   cd slack-approval-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```plaintext
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_SIGNING_SECRET=your-slack-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-level-token
   PORT=3000
   ```

   - Replace `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, and `SLACK_APP_TOKEN` with the values from your Slack app settings.
   - Optionally, change `PORT` if you prefer a different port.

4. **Set up Slack App**
   - Go to your [Slack API Apps](https://api.slack.com/apps).
   - Create a new app, add a bot, and enable **Socket Mode**.
   - Enable **Slash Commands** in the app features, and add the following commands:
     - `/approval-test` - to initiate an approval request.
   - Enable **Interactivity & Shortcuts** to allow the bot to use modals.

5. **Run the bot**
   ```bash
   node app.js
   ```

   The bot should start and log a message indicating it is running.

## Usage

1. **Triggering Approval Requests**
   - In Slack, type `/approval-test` to open the approval request modal.
   - Select the approver, enter the approval message, and submit.

2. **Approval Process**
   - The approver will receive a message with "Approve" and "Reject" buttons.
   - Upon clicking either button, the requester is notified of the outcome.

## Code Overview

- **app.command('/approval-test')**: Triggers a modal with a dropdown to select an approver and a text area for approval details.
- **app.view('approval_request_modal')**: Handles modal submission, sending the approval request to the selected approver.
- **app.action('approve_request')**: Approves the request and notifies the requester.
- **app.action('reject_request')**: Rejects the request and notifies the requester.

## Testing

This bot can be tested in a development Slack workspace. You can add unit tests in the `test/` directory (not provided by default) to test individual functionalities.

## Architecture

The bot is built using the [Slack Bolt SDK](https://slack.dev/bolt-js/), utilizing Socket Mode for real-time interactions.

## Future Improvements
- Add unit tests to cover the main features.
- Improve error handling.
- Add options for multiple approvers.

## License
This project is licensed under the MIT License.
```

