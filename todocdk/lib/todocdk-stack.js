const { Stack, Duration } = require('aws-cdk-lib');
// const sqs = require('aws-cdk-lib/aws-sqs');

class TodocdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'ToDoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'ToDoTable',
    });

    const createTodoFunction = new lambda.Function(this, 'CreateTodoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'todolambda.createTodo',
      code: lambda.Code.fromAsset('src/lambdas'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const listTodosFunction = new lambda.Function(this, 'ListTodosFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'todolambda.listTodos',
      code: lambda.Code.fromAsset('src/lambdas'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const updateTodoFunction = new lambda.Function(this, 'UpdateTodoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'todolambda.updateTodo',
      code: lambda.Code.fromAsset('src/lambdas'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });


    table.grantWriteData(createTodoFunction);
    table.grantReadData(listTodosFunction);
    table.grantReadWriteData(updateTodoFunction);
  

    const todoApi = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });


    const todos = todoApi.root.addResource('todos');
    todos.addMethod('POST', new apigateway.LambdaIntegration(createTodoFunction));
    todos.addMethod('GET', new apigateway.LambdaIntegration(listTodosFunction));

    const todo = todos.addResource('{id}');
    todo.addMethod('PUT', new apigateway.LambdaIntegration(updateTodoFunction));






  }
}

module.exports = { TodocdkStack }
