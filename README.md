# Gallery_API_DB
API for image gallery using MySQL

1. Navigate into this directory
2. In this directory install packages -> `npm install`
3. Install MySQL -> `sudo apt install mysql-server`
4. Create user root -> `sudo mysql -u root -p` -> `drop user 'root'@'localhost';` -> `create user 'root'@'localhost' identified by '#Abc1234';`
5. Grant privileges to root -> grant all privileges on *.* to 'root'@'localhost' with grant option; -> flush privileges;
6. Exit MySQL and log in as root -> `mysql -u root -p` and password `#Abc1234`
7. Create database imageGallery -> `CREATE DATABASE imageGallery;`
8. Initiate file index.js -> `node index.js`
9. Make a request
