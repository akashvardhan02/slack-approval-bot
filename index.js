const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
});

// /hello command
app.command('/hello', async ({ command, ack, say }) => {
    await ack();
    await say(`Hello, <@${command.user_id}>`);
});

// /say_name command
app.command('/say_name', async ({ command, ack, say }) => {
    await ack();
    const name = command.text;
    await say(`Your name is ${name}`);
});

// /approval-test command
app.command('/approval-test', async ({ command, ack, client }) => {
    await ack();

    // Open a modal with dropdown for approver selection, text input for approval message
    try {
        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'approval_request_modal',
                title: {
                    type: 'plain_text',
                    text: 'Request Approval',
                },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'approver_block',
                        label: {
                            type: 'plain_text',
                            text: 'Select Approver',
                        },
                        element: {
                            type: 'users_select',
                            action_id: 'approver',
                        },
                    },
                    {
                        type: 'input',
                        block_id: 'approval_text_block',
                        label: {
                            type: 'plain_text',
                            text: 'Approval Text',
                        },
                        element: {
                            type: 'plain_text_input',
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

// Handle modal submission
app.view('approval_request_modal', async ({ ack, body, view, client }) => {
    await ack();

    const approverId = view.state.values.approver_block.approver.selected_user;
    const approvalText = view.state.values.approval_text_block.approval_text.value;
    const requesterId = body.user.id;

    // Send the approval request to the approver with Approve and Reject buttons
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
                    block_id: 'approval_actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Approve',
                            },
                            style: 'primary',
                            value: `${requesterId}`,
                            action_id: 'approve_request',
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Reject',
                            },
                            style: 'danger',
                            value: `${requesterId}`,
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
    await ack();
    const requesterId = body.actions[0].value;

    // Notify requester of approval
    await client.chat.postMessage({
        channel: requesterId,
        text: `Your approval request has been *approved* by <@${body.user.id}>.`,
    });
});

// Handle Reject button click
app.action('reject_request', async ({ ack, body, client }) => {
    await ack();
    const requesterId = body.actions[0].value;

    // Notify requester of rejection
    await client.chat.postMessage({
        channel: requesterId,
        text: `Your approval request has been *rejected* by <@${body.user.id}>.`,
    });
});

// Start your app
(async () => {
    await app.start(process.env.PORT || 3000);
    console.log(`Bot app is running on port ${process.env.PORT || 3000}!`);
})();
