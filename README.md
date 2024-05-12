# NestJs Starter Template With Authentication

Welcome to the NestJs Starter Template With Authentication! This template provides a solid foundation for building web applications with NestJs, incorporating various authentication mechanisms to suit different use cases. Along with that Logger is implemented for the purpose of recording important information, warnings, and errors that occur during runtime.

## Authentication Strategy Implemented
- **Email/Password Authentication:** Implements a secure authentication flow using email and password, including refresh token functionality for enhanced security. RolesGaurd is also added for authorization.
- **Web3 Wallet Authentication:** Enables authentication using Web3 wallets, providing a decentralized authentication option with refresh token support.
- **Auth0 Gmail Login Flow:** Integrates with Auth0 for authentication using Gmail accounts, offering a seamless login experience for users.

## Features

- **Swagger Documentation:** All endpoints are documented using Swagger, making it easy to understand and interact with the API.
- **Authentication & Authorization:** The implemented authentication strategy not only ensures secure user access through various methods such as email/password, Web3 wallets, and Auth0 Gmail login but also seamlessly integrates authorization functionality through RolesGuard
- **Logger:** The Logger module within this project serves the purpose of recording important information, warnings, and errors that occur during runtime. This facilitates easier debugging and monitoring of the application. Log can be recorded in 3 ways:
    - **Console Output:** Additionally, logging messages can be displayed directly in the console for real-time monitoring during development and testing phases.
    - **Logging to File:** In non-production environments, the Logger logs data to a file specified in the configuration.
    - **CloudWatch Integration:** When the application is deployed in a production environment, the Logger seamlessly integrates with **AWS CloudWatch** for centralized logging and monitoring.

  Please update the env file to configure the logger.

## Getting Started

To get started with the NestJs Starter Template With Authentication, follow these steps:

1. Clone this repository to your local machine.
2. Install dependencies using `npm install`.
3. Configure environment variables according to your requirements.
4. Start the application using `npm run start:local`.
5. Explore the API documentation available at `/swagger` endpoint in your browser. Current `username: user` & `password: password`. You can update in env.

## Usage

You can use this template in two ways:

1. **Full Template:** Utilize all the authentication mechanisms provided in this template to build your application.
2. **Customize:** Pick and choose the authentication mechanism(s) that best fit your requirements and integrate them into your existing project.

## BreakDown of Authentication Mechanism

**1. Email/Password Authentication**
   
   ![image](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/c94689b9-9136-43de-9ad0-b3df713ca42f)

  Email and password authentication mechanism is pretty simple. It uses JWT (JSON Web Token) authentication. It starts with a familiar process: users register using their email and password. Upon successful registration, they receive two essential tokens:
- **Access Token:** This token grants access to protected resources and has a short lifespan to enhance security.
- **Refresh Token:** The refresh token is long-lived and is used to obtain a new access token once the current one expires.

After initially logging in, user can use their access token to access resources without repeatedly entering their credentials. When the access token expires, they can use the refresh token to obtain a new one, avoiding the need to log in again with their email and password.

**2. Web3 Wallet Authentication:**

   ![image](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/24ea8e24-b26f-47fc-b444-fbb32f0ef7b9)

Now with these endpoints, we can login using web3 wallet. The login mechanism begins with the initiation of the login process `/wallet-auth/init`. It will return an unique message. This message serves as a verification step and is pivotal for the subsequent authentication process.

To authenticate their identity, users are required to sign the generated message using their Metamask wallet. This signature serves as proof of identity and ensures the integrity of the login process. For testing this signature step, I used this code snippet. Here is the [link](https://codesandbox.io/s/ibuxj?file=/src/SignMessage.js).  

Then with signature, we call `/wallet-auth/login` endpoint. The system verifies the signature's authenticity. If the signature is correct, the user is successfully authenticated, and in return, is issued a JWT token. This token comprises both an access token and a refresh token, granting the user access to the platform's resources.

The access token, elevated short-lived for security purposes, can be effortlessly refreshed using the `/wallet-auth/refresh_token` endpoint. This endpoint allows users to prolong their session without the hassle of repeated logins.

**3. Auth0 Gmail Login Flow:**
Auth0's Gmail login process simplifies the journey to accessing your favorite apps. When you choose "Login with Gmail," you're seamlessly taken to Gmail's familiar login page. After entering your credentials, Auth0 swiftly verifies your identity and brings you back to the app. You're then issued a JWT token, your key to continued access. Plus, for longer sessions, there's an option to refresh your access. With Auth0, it's not just about security; it's about making your login experience smooth and hassle-free, all while reflecting the app's unique style.

![image](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/27bab7b2-7ba7-48c0-90ee-6b5917fba45c)

This login endpoint takes `code` as payload. To generate `code` we need to call auth0 api from client and pass that code as payload. You can use this [code]() for generating `code`. Please update your credentials with your auth0 credentials. For getting credentials you can follow the steps given below:



**Create a new tenant**

![Create a new tenant](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/f6dcb4bb-0074-4122-a9b3-654ac62dc01e)



**Create new application**

![Create new application](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/afbba798-2cf9-405b-b769-4fc0a9082ebf)




**Configure application**

![Configure application](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/6d833592-9770-4744-82cc-680420f55137)




**Create API/Audience**

![Create API/Audience](https://github.com/nayeemahmed24/nestjs-starter-template-with-authentication/assets/42116405/661936ca-5009-42c9-a689-e94a365b43b3)


## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
