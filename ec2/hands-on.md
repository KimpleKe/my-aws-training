# EC2 hands-on exercise 1

* Create an SSH keypair via the EC2 console. Name it uniquely for you. Put it in your $HOME/.ssh
    * Make sure the permissions are secure (0600, or chmod go-rwx ...)

* Create an EC2 instance via the console 
    * Make sure you have AWS allocate a public IP for the instance
    * You don't need to adjust the storage
    * Use the launch wizard to create a new security group:
        * name the security group `<my-name>-ec2-hands-on`
        * permit ONLY TCP port 22 (SSH) from everywhere (0.0.0.0/0)
    * Review and launch the instance
    * specify the keypair you created above

* If you click on the instance ID, it'll take you to the EC2 instances
  console with your instance selected; you can copy the public hostname
  or IP address of the instance from there.

* Log in to the instance using the SSH key you generated above
    ```
    myhost$ ssh -i $HOME/.ssh/my-ssh-key-pair-name.pem ec2-user@instance-hostname-or-ip-address
    ```
    for ubuntu instances, please use `ubuntu@instance` instead of `ec2-user@instance`

* Install a webserver:

    ```
    instance$ sudo yum install -y httpd
    ```

* Copy index.html to the instance:

    ```
    myhost$ scp -i $HOME/.ssh/my-ssh-key-pair-name.pem index.html ec2-user@instance-name-or-ip-address:/var/tmp
    ```

* log in to the instance and copy index.html to the webserver root

    ```
    instance$ sudo cp /var/tmp/index.html /var/www/html/
    ```

* Start the webserver and enable it so that it restarts on boot:

    ```
    instance$ sudo service httpd start
    instance$ sudo chkconfig httpd on
    ```

* Find the public IP and hostname of the instance from the console (you
  did this before when you logged in to it)

* Attempt to browse to the page:

    ```
    http://instance-name-or-ip-address/
    ```

* Verify that it times out (unless you've read ahead)

* Change the security group created by the launch wizard to 
  permit TCP port 80 (HTTP) from anywhere (0.0.0.0/0) -- you can
  navigate to the security group by clicking on its name in the
  EC2 web console once you've selected your instance.

* Reload the web page from your instance

* Stop the instance -- don't terminate it!

* Verify that browsing to the instance in a browser times out

* Restart the instance -- check its public IP/hostname now 
  (it may have changed)

* Verify content is still there (same instance!)

* DO NOT terminate the instance -- we'll use it in the next hands-on
