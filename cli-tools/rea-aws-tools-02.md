REA AWS Tools
=============

## Authentication
- [rea-as](https://git.realestate.com.au/cowbell/rea-as)
  - tool for SAML login and STS Assume Role
- [aws-shortcuts](https://git.realestate.com.au/resi-lob/aws-shortcuts)
  - Aliases to all your SAML Roles (with tab completion)
- [aws-console-url](https://git.realestate.com.au/david-yeung/aws-console-url)
  - mouseless login to AWS Web Console from CLI


## demo: [rea-as](https://git.realestate.com.au/cowbell/rea-as)
```
rea-as
rea-as saml
rea-as saml arn:aws:iam::561534074837:role/REA-Training-User
rea-as saml REA-Training-User
export $(rea-as saml REA-Training-User)
```

## demo: [aws-shortcuts](https://git.realestate.com.au/resi-lob/aws-shortcuts)
```
git clone git@git.realestate.com.au:resi-lob/aws-shortcuts.git ~/.aws-shortcuts
rea-as saml > ~/.aws-shortcuts/iam-roles.txt
source ~/.aws-shortcuts/aws-shortcuts.sh
reauthenticate REA-Training-User
REA-Training-User
```

## demo: [aws-console-url](https://git.realestate.com.au/david-yeung/aws-console-url)
```
aws-console-url
open $(/usr/local/bin/aws-console-url)
alias console='open $(/usr/local/bin/aws-console-url)'
console
```
