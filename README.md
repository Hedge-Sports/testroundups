# Test Round-ups

[For viewing the full solution, please review our documentation](https://hedge-pay.stoplight.io/docs/api-hedge/ZG9jOjQ2MTg1MTcz-overview-started)

In order for a given app (e.g. crypto exchange A) to integrated spare change round-up depositing into their product suite, they must tackle these maajor steps in order:

1. Obtain token (from Hedge)
2. Register user (with Hedge, Finicity/Plaid, and Dwolla)
3. Activate Round ups (for User)


## Our solution is configurable in two different ways, as you can see in the documentation and information below. The following two endpoints help confirm the users: 

  /users/complete-activation
  /users


When the user (ex. Bob Smith) activates their round-ups through your round-up front-end, our API will perform the registration in [Finicity][finicity.com] and its founding source in [Dwolla][dwolla.com] and the indicated multiplier will be saved.


##### How to activate a user
- After attaining open banking and ACH verification, the next steps will include adding users (e.g. consumers) who will be able to connect their round-ups to your wallets.
- Once the roundups action in the Hedge API will be activated (and if the activation was successful) you can use the following endpoint /users/add-bank-account 
- For add account bank use follow endpoint /users/${rel_user_client}/add-bank-account
- Connecting this enpoint will prompt the user to enter their bank account, while saving the credentials upon a successful connection
- User may connect more than one bank account (e.g. round-up funding source) 


Since we aim to make round-ups compatible with a client's current payment tech stack, we have made it possible for a user to connect their bank account through either Finicity or Dwolla

## *If you, as a client, would like to track bank accounts with Finicity*
  > In the frontend you will have to open the URL that enables such a the user can enter their bank, and choose the account he wants to add for account tracking

## Use credentials for test in environment FINICITY and use bank Finbank

![image](https://user-images.githubusercontent.com/91908033/180818105-fc785440-a766-4552-ac3f-2711e23a5e85.png)


```
username: profile_02
password: profile_02

Use type account savings or checking for bank *FinBank A*
``` 
> Open Url response in the popup

```
window.open(
  url,
  "popUpWindow",
  "height=500,width=900,left=50,top=50,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes"
)
```

## *If you, as a client, would like to track bank accounts with Finicity*
  > After using the /users/add-bank-account endpoint or activating a user's roundups you must use a similar code in your frontend to open the iframe that allows you to link the accounts to our API

### Use credentials for test in environment PLAID

```
CDN Plaid
<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>

username: user_good
password: pass_good
```
```
const handler = Plaid.create({
  token: resp.data.link_token,
  onSuccess: (public_token, metadate) => {
    console.log("success ", public_token) // public token of user
    console.log("metadate ", metadate) // data of plaid JSON 
    // metadate.institution
    // metadate.account
  },
  onLoad: () => {
    console.log("onload ")
  },
  onExit: (err, metadata) => {
    console.log("exit ", err)
  },
  onEvent: (eventName, metadata) => {
    console.log("onevent ", eventName)
  },
})
handler.open()
```

