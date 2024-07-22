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


exports.updateTodo = async (event) => {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    const updateExpressionParts = ['#lastUpdated = :lastUpdated'];
    const expressionAttributeNames = {
        '#lastUpdated': 'lastUpdated'
    };
    const expressionAttributeValues = {
        ':lastUpdated': timestamp
    };

    if (body.title) {
        updateExpressionParts.push('#title = :title');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeValues[':title'] = body.title;
    }

    if (body.description) {
        updateExpressionParts.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = body.description;
    }

    if (updateExpressionParts.length === 1) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'No fields to update' }),
        };
    }

    const params = {
        TableName: process.env.TABLE_NAME || 'ToDoTable',
        Key: marshall({ id }),
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues, { removeUndefinedValues: true }),
        ReturnValues: 'ALL_NEW',
    };

    try {
        const command = new UpdateItemCommand(params);
        const result = await client.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify(unmarshall(result.Attributes)),
        };
    } catch (error) {
        console.error('Error updating todo:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error updating todo", error: error.message }),
        };
    }
};