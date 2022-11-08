## Unofficial Seattle Metro api SPA Site
[The unofficial seattle metro api](https://github.com/walimorris/unofficial-seattle-metro-api) is an application programming interface designed to gain Seattle 
metro schedule insights on the go, utilizing serverless technologies for intelligent text extraction with Natural Language Processing services such as: 
* [AWS Textract](https://aws.amazon.com/textract/)
* [AWS Comprehend](https://aws.amazon.com/comprehend/)

This project is the website for the unofficial seattle metro api and used to allow users to register and obtain permissions to utilize the api using Amazon Cognito
user pools as authorizer. 

* [Amazon Cognito](https://aws.amazon.com/cognito/)

The registration process will be designed for ease and upon signing in users will be able to reference documentation that clearly shows various use-cases for the 
unofficial seattle metro api. The project is currently being built, but opensource contributions are welcome. Please review Contribution docs within this project's 
repository. 

## Preview

![Sneak Peak](https://u-sea-metro.s3.us-west-2.amazonaws.com/unofficial-seattle-metro-login.png)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run Tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
