# REA AWS Training - IAM Hands On

## Exercise
* You'll need to know your EC2 instance ID from the previous module
    * If you don't have one, follow the instructions in ../ec2/hands-on.md to
      create an EC2 instance

* Using the console, create a new IAM user (name it something unique to you)
    * Create a new access key for this user
    * be sure to save the access key ID and secret access key before you close the popup:

    ```
    $ export AWS_ACCESS_KEY_ID=AKIAKSHDGLKDFGSDFDSG
    $ export AWS_SECRET_ACCESS_KEY=ClkjdfgSCFKJsdflgkjasdcSDFGKJSDfg==
    $ export AWS_DEFAULT_REGION=ap-southeast-2
    ```
**Once you have exported those values, do not use `authenticate` or `rea-as`
again, or you'll overwrite your current user with the REA-Training-User.**

* Run the following command on your laptop:

    ```
    aws ec2 describe-instances
    ```

  What happen?

* Using the console (or command-line), attach the pre-existing managed
  policy called `example-user-1` to the user
    * In the console:
        * IAM -> Users -> `your_user` -> Permissions -> Attach Policy
    * On the command-line (authenticated as the REA-Training-User):
        ```
        host$ aws iam list-policies --scope Local
        (( ... find the ARN for the 'example-user-1" policy ... ))
        host$ aws iam attach-user-policy --user-name <your_user> --policy-arn <ARN>
        ```

* verify that this user (in the same shell) can:
    * `aws ec2 describe-instances`
    * `aws ec2 stop-instances --instance-ids <your instance ID>`

* Verify that this user (in the same shell) cannot:
    * `aws iam create-user --user-name <something>`
    * `aws ec2 terminate-instances --instance-ids <your instance ID>`

* Using the console, attach the pre-existing managed policy
  called `example-user-2` to your user

* Verify that this user can now terminate your instance
    * is it just your instances that you can terminate?

* Try attaching one of the AWS pre-defined policies,
  like `AdministratorAccess` -- can you?

* Using the console, disable this user's access keys
    * Can you run `aws ec2 describe-instances` any more?

* Delete the user -- you won't need it any more

## Further investigation
* When you authenticate as `REA-Training-User`, what IAM policies are applied to you?
