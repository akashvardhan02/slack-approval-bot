// Import the App class from the Slack Bolt package
const { App } = require('@slack/bolt');
// Load environment variables from the .env file
require('dotenv').config();

// Initialize the Slack Bolt app with necessary configurations
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,           // Bot token for authentication
    signingSecret: process.env.SLACK_SIGNING_SECRET,  // Signing secret to verify requests
    appToken: process.env.SLACK_APP_TOKEN,        // App-level token for connecting over WebSocket
    socketMode: true,                             // Enables Socket Mode for the app
});

// Define the /hello command, which greets the user
app.command('/hello', async ({ command, ack, say }) => {
    await ack(); // Acknowledge the command request
    await say(`Hello, <@${command.user_id}>`); // Respond with a greeting message
});

// Define the /say_name command, which echoes the user's name
app.command('/say_name', async ({ command, ack, say }) => {
    await ack(); // Acknowledge the command request
    const name = command.text; // Get the user's name from the command text
    await say(`Your name is ${name}`); // Respond with the name
});

// Define the /approval-test command, which triggers an approval request modal
app.command('/approval-test', async ({ command, ack, client }) => {
    await ack(); // Acknowledge the command request

    // Open a modal with a dropdown to select an approver and a text input for the approval request
    try {
        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'approval_request_modal',  // ID to identify the modal's submission
                title: {
                    type: 'plain_text',
                    text: 'Request Approval',
                },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'approver_block',  // Block for approver selection
                        label: {
                            type: 'plain_text',
                            text: 'Select Approver',
                        },
                        element: {
                            type: 'users_select', // Dropdown to select an approver
                            action_id: 'approver',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'approval_text_block', // Block for approval text
                        label: {
                            type: 'plain_text',
                            text: 'Approval Text',
                        },
                        element: {
                            type: 'plain_text_input', // Text area for entering the approval request
                            action_id: 'approval_text',
                            multiline: true,
                        },
                    },
                ],
                submit: {
                    type: 'plain_text',
                    text: 'Submit',
                },
            },
        });
    } catch (error) {
        console.error('Error opening modal:', error);
    }
});

// Handle modal submission when the approver and text are submitted
app.view('approval_request_modal', async ({ ack, body, view, client }) => {
    await ack(); // Acknowledge the modal submission

    // Retrieve approver, approval text, and requester ID from modal submission data
    const approverId = view.state.values.approver_block.approver.selected_user;
    const approvalText = view.state.values.approval_text_block.approval_text.value;
    const requesterId = body.user.id;

    // Send the approval request to the selected approver with Approve and Reject buttons
    try {
        await client.chat.postMessage({
            channel: approverId,
            text: `Approval request from <@${requesterId}>: ${approvalText}`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Approval Request from <@${requesterId}>*\n\n${approvalText}`,
                    },
                },
                {
                    type: 'actions',
                    block_id: 'approval_actions', // Block ID for actions (Approve/Reject buttons)
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Approve',
                            },
                            style: 'primary',   // Button style for approve
                            value: `${requesterId}`, // Send requester ID with action
                            action_id: 'approve_request',
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Reject',
                            },
                            style: 'danger',    // Button style for reject
                            value: `${requesterId}`, // Send requester ID with action
                            action_id: 'reject_request',
                        },
                    ],
                },
            ],
        });
    } catch (error) {
        console.error('Error sending approval request:', error);
    }
});

// Handle Approve button click
app.action('approve_request', async ({ ack, body, client }) => {
    await ack(); // Acknowledge the button action
    const requesterId = body.actions[0].value; // Get the requester ID from button action

    // Notify the requester that the approval has been granted
    await client.chat.postMessage({
        channel: requesterId,
        text: `Your approval request has been *approved* by <@${body.user.id}>.`,
    });
});

// Handle Reject button click
app.action('reject_request', async ({ ack, body, client }) => {
    await ack(); // Acknowledge the button action
    const requesterId = body.actions[0].value; // Get the requester ID from button action

    // Notify the requester that the approval has been rejected
    await client.chat.postMessage({
        channel: requesterId,
        text: `Your approval request has been *rejected* by <@${body.user.id}>.`,
    });
});

// Start the app and listen on the defined port (default is 3000)
(async () => {
    await app.start(process.env.PORT || 3000);
    console.log(`Bot app is running on port ${process.env.PORT || 3000}!`);
})();
