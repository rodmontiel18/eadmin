# Expenses Administrator

This project was build to help you to have a better control of your income and expenses, you can do the next things:
- Add/remove/edit categories for both income and expenses
- Add payment methods for your expenses
- You can create periods to add both incomes and expenses between a range of dates
- You can create group of expenses in order to add them faster to a period
- You have some charts into each period, so you can view a general overview of you balance

## Features/Technologies
- The application was build with ReactJS, TypeScript and AntDesign as design system
- Uses Firestore database
- Uses Firebase authentication
- Uses Redux Toolkit for state management and React Router for routing
- Was built with create-react-app
- Uses ESLint

***Nota:*** *This project has disabled Signup, so it requires to add a user manually*

## How to run it

### Prerequisites
1. You need a firebase account, if you don't have one, you can create it [here](https://firebase.google.com/)
2. You'll need to create a new project, and add a firestore database in ***test mode***, you can follow [this](https://firebase.google.com/docs/firestore/quickstart) quick start
3. Create a Web Application into ***Project Settings***
4. You'll need to add the authentication module and add ***Email/Password*** provider
   - Add a user, set email and password

### Instructions
1. Checkout the repository
2. From your firebase project settings/ App get the required data from SDK configuration and add it into ***.env*** file, for the next vars:
   - REACT_APP_API_KEY
   - REACT_APP_AUTH_DOMAIN
   - REACT_APP_PROJECT_ID
   - REACT_APP_MESSAGING_SENDER_ID
   - REACT_APP_APP_ID
3. Install dependencies with ***yarn*** or ***npm i***
4. Run start script with ***yarn start*** or ***npm run start***, the application should launch your browser on https://localhost:3000, otherwise, you can go manually
5. Enter email and password of the user created on the 4th prerequisites step
6. Enjoy it!
