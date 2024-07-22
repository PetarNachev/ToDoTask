const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const crypto = require('crypto');


const client = new DynamoDBClient();

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

const currentTimestamp = new Date().toISOString();


exports.createTodo = async (event) => {

    const id = generateId();

    let body = JSON.parse(event.body)
    const params = {
        TableName: 'ToDoTable',
        Item: marshall({
            id,
            title: body.title,
            description: body.description,
            lastUpdated: currentTimestamp,
        }),
    };

    const command = new PutItemCommand(params);

    try {
        const result = await client.send(command);
        console.log('DynamoDB result:', JSON.stringify(result))

        const item = result.Item ? unmarshall(result.Item) : null;

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Todo created successfully', item }),
        };

    } catch (error) {
        console.error(error)

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error creating todo" })
        }

    }
};

exports.listTodos = async () => {
    const params = {
        TableName: 'ToDoTable'
    };

    const command = new ScanCommand(params);

    try {
        const result = await client.send(command);
        const todos = result.Items ? result.Items.map(item => unmarshall(item)) : [];

        todos.sort((a, b) => {
            if (!a.lastUpdated) return 1;
            if (!b.lastUpdated) return -1;
            return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        });

        return {
            statusCode: 200,
            body: JSON.stringify(todos),
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error listing todos" })
        };
    }
};