# KMS Hands On

*Note:* Most functionality of KMS is not available through the console, so you will have
to do this using the command line.

## Objectives

* Demonstrate and gain familiarity with encrypting and decrypting data using KMS
* Understand use of key policies and grants to permit/deny various
  cryptographic actions on keys and ciphertexts
* Understand how encryption contexts coupled with grants can provide very
  fine-grained access control even when using a single key

## Part 1 - Examining keys

1. Look for keys in the training account in the `ap-southeast-2 (Sydney)`
   region. Find the key with the alias `alias/Training-Key`.

    ```
    localhost$ export AWS_DEFAULT_REGION=ap-southeast-2
    localhost$ aws kms list-aliases
    ```

1. Find the target key ID and examine the key and the policies associated with
   it. Note that the key is "Enabled", meaning that it can be used for
   encryption/decryption. (Annoyingly, `list-key-policies` cannot use a key alias at
   this time)

    ```
    localhost$ aws kms describe-key --key-id alias/Training-Key
    ...
    ```

1. Set an environment variable to hold the key ID -- we'll use this later

    ```
    localhost$ KEY_ID=$( aws kms describe-key --key-id alias/Training-Key \
        --query 'KeyMetadata.KeyId' --output text )
    ```

1. Examine the key policy. Note that it permits the account itself (which maps to
   all IAM users) to encrypt, but it does not permit decryption.
   Note also that it does not explicitly _deny_ decryption.

    ```
    localhost$ aws kms list-key-policies --key-id $KEY_ID
    ...
    localhost$ aws kms get-key-policy --key-id $KEY_ID \
        --policy-name default \
        --query Policy \
        --output text
    ```

1. Examine any grants on the key -- initially, there should be none (unless there is stuff left over from the last session)

    ```
    localhost$ aws kms list-grants --key-id $KEY_ID
    ```

## Part 2 - Encryption

1. Create a text file with a secret message in it, called `my-plaintext-file`.
   This is your "plaintext".
   This file will be viewed by someone else in the class, chosen at random,
   so make it something that we don't have to get HR involved
   with. Also, make the file smaller than 4k -- we'll be encrypting directly,
   instead of via a data key, so there are size limits. In context, this could be
   a username/password pair to be used by an application to access a database.
1. Think of an encryption context; this is a key-value pair, and will be used to
   tag your encrypted text so that only certain people can decrypt it. An easy
   one to think of is `username:<my_network_username>`, for example
   `username:cmp` or `username:bobby.tables`. Remember this for later.
1. Pull an ARN out of the hat -- this is the ARN of a federated user in the class 
   (it'll be of the form `arn:aws:sts::561534074837:assumed-role/REA-Training-User/ldap_username`), 
   and you'll be encrypting your secret message so that only they can read
   it.
1. Create a grant on the training key so that the ARN you received can decrypt
   the ciphertext:

    ```
    localhost$ aws kms create-grant --key-id $KEY_ID \
        --grantee-principal <ARN-you-chose> \
        --operations Decrypt \
        --constraints '{"EncryptionContextEquals":{"username":"<your_username>"}}'
    ```

1. Encrypt the plaintext using the training key -- make sure you specify the
   encryption context, and that it's the same one you attached to the grant:

    ```
    localhost$ aws kms encrypt --key-id alias/Training-Key \
        --plaintext file://my-plaintext-file \
        --encryption-context username=<my_username>
    ```

    Notice how you get a JSON data structure back. Unforutnately, because of the
    way the CLI works at the moment, we can only decrypt the _binary_ version of
    the ciphertext, so we do an additional dance to save that instead:

    ```
    localhost$ aws kms encrypt --key-id alias/Training-Key \
        --plaintext file://my-plaintext-file \
        --encryption-context username=<my_username> \
        --output text --query CiphertextBlob | base64 --decode > <MY_USERNAME>_CIPHERTEXT
    ```

1. Upload the ciphertext file to S3:

    ```
    localhost$ aws s3 cp <my-username>-ciphertext s3://rea-training-data/kms/
    ```

## Part 3 - Decryption

1. Once everyone has encrypted and uploaded their ciphertexts, copy them all down
   to a local folder:

    ```
    localhost$ aws s3 cp --recursive s3://rea-training-data/kms/ ciphers/
    download: s3://rea-training-data/kms/... to ciphers/...
    ```

1. Find the person for whose ARN you created the grant and tell them the name of
   the file that you uploaded, and verify what the encryption context was.
1. When you're told the name of the file that was uploaded for you, decrypt it:

    ```
    localhost$ aws kms decrypt --ciphertext-blob fileb://ciphers/<name>-ciphertext \
        --encryption-context username=<name>
    ```

   Note if this fails, the grant has likely not taken effect yet (or been done wrong)

   Note that the decrypted data comes out as a JSON structure again -- the
   plaintext is actually base64 encoded (again), so you'll have to decode it:

    ```
    localhost$ aws kms decrypt --ciphertext-blob fileb://ciphers/<name>-ciphertext \
        --encryption-context username=<name> \
        --query Plaintext \
        --output text | base64 --decode > <name>-plaintext

    localhost$ cat <name>-plaintext
    ```

1. Try decrypting one of the other files using the same encryption context
1. Find out what the encryption context actually is for the other files, and try
   decrypting them -- if the grant was created properly, you should not be able
   to.

## Part 4 - Clean up

1. Find the grant that you created:

    ```
    localhost$ aws kms list-grants --key-id $KEY_ID
    ...
    ```
   
   Look for the encryption context that you created, and copy the GrantId.
1. Retire the grant:

    ```
    localhost$ aws kms retire-grant --key-id $KEY_ID --grant-id <grant-id>
    ```

   *Note:* There's a bug in the AWS CLI at present which prevents it using the
   globally-unique key Id (the UUID) for retiring grants; you will have to
   specify the entire ARN, which you can get from `aws kms describe-key --key-id
   $KEY_ID`
1. Normally, you would `retire` grants; if there's an active compromise in process
   and you *must* deny access via the grant as rapidly as possible, use `revoke`.

## References

* AWS has a good paper on [KMS Cryptographic
Details](https://d0.awsstatic.com/whitepapers/KMS-Cryptographic-Details.pdf)
* Amazon's [KMS Documentation](http://aws.amazon.com/documentation/kms/)
