# Vehicle Rental Backend (With Node.js) <img src='./assets/img/vehicleRentalIcon.png' height='50' align='center' />

<div style="text-align:center;position:relative; bottom:43px" align="center">
<img src='./assets/gif/vehicleRentalLoading.gif' width='auto' />

[![express](https://img.shields.io/npm/v/express?label=express)](https://www.npmjs.com/package/express)
[![mysql2](https://img.shields.io/npm/v/mysql2?label=mysql2)](https://www.npmjs.com/package/mysql2)
[![jsonwebtoken](https://img.shields.io/npm/v/jsonwebtoken?label=jsonwebtoken)](https://www.npmjs.com/package/jsonwebtoken)
[![bcrypt](https://img.shields.io/npm/v/bcrypt?label=bcrypt)](https://www.npmjs.com/package/bcrypt)
[![cors](https://img.shields.io/npm/v/cors?label=cors)](https://www.npmjs.com/package/morgan)
[![morgan](https://img.shields.io/npm/v/morgan?label=morgan)](https://www.npmjs.com/package/cors)
[![multer](https://img.shields.io/npm/v/multer?label=multer)](https://www.npmjs.com/package/multer)
[![dotenv](https://img.shields.io/npm/v/dotenv?label=dotenv)](https://www.npmjs.com/package/dotenv)
[![moment](https://img.shields.io/npm/v/moment?label=moment)](https://www.npmjs.com/package/moment)
[![nodemailer](https://img.shields.io/npm/v/nodemailer?label=nodemailer)](https://www.npmjs.com/package/nodemailer)

vehicle rental backend is a API (Application Programming Interface) to perform rental service features on customers.

</div>

# Features

## There are several features of this API and End Point, as below :

### Public

<ul>
<li>Register</li>
<li>Login</li>
<li>Forgot Password</li>
<li>List Vehicle along with search, filter, sort and pagination features</li>
<li>Vehicle Detail</li>
<li>Reservation (but can't make a reservation with the vehicle you rent)</li>
<li>Reservation history</li>
</ul>

### Tenant

<ul>
<li>Add Vehicle</li>
<li>Edit Vehicle</li>
<li>Delete Vehicle</li>
</ul>

### Admin

<ul>
<li>Handle about user</li>
</ul>

# Requirements

## Node js

For development you need to download node js app to run server-side,
You can download it [official Node.js website](https://nodejs.org/)

## MySQL Workbench

For the database here using mysql workbench, can be downloaded [official Mysql website](https://www.mysql.com/products/workbench/)

## POSTMAN

To do the test, you can go through the Postman application, you can download it [official Postman website](https://www.postman.com/downloads/)

# How to Run the Application

## 1 Clone Repository

### Clone this repository by running the following command :

```
git clone <this repo url>
```

## 2 Install dependencies Package

### Install the dependencies package inside the application folder by running this command :

```
npm install
```

OR

```
npm i
```

## 3 Setups Project

<ul>
<li>Setups MySQL</li>
if you have downloaded and installed MySQL you can download the SQL file here : <a href="https://onedrive.live.com/?authkey=%21AFFw3XyNUlEVlwo&cid=0E1E12EDC9AC577C&id=E1E12EDC9AC577C%21404680&parId=E1E12EDC9AC577C%21404679&o=OneUp">vehicle-rental.sql</a> 
<p>import files in your localhost database</p>
<li>Setups Postman</li>
if you have downloaded and installed Postman you can look the Documentation file here : <a href="https://documenter.getpostman.com/view/18051667/2s7Yzzo5sp">vehicle-rental postman Documentation</a>
<p>Setups Environment : Create Environment from postman, fill in variable and value</p>
<table border=2>
<tr>
<td>HOST</td>
<td>http://localhost:8000 or your ipv4 ip address/virtual host. expample : http://192.168.56.258:8000</td>
</tr>
<tr>
<td>TOKEN</td>
<td>just leave the initial value blank, it can be filled in after the login feature</td>
</tr>
</table>
<li>Setups Environment File</li>
Create file name .env on the folder project
Create an .env file name in the project folder, then fill in the variables like this :
<table border=2>
<tr>
<td>DB</td>
<td>The name of the database you created earlier</td>
</tr>
<tr>
<td>HOST</td>
<td>localhost or your Hostname</td>
</tr>
<tr>
<td>UNAME</rd>
<td>root or your username</td>
</tr>
<tr>
<td>PASS</td>
<td>your password</td>
</tr>
<tr>
<td>SECRET_KEY</td>
<td>fill anything you want, example : vehicle-rental</td>
</tr>
<tr>
<td>ISSUER</td>
<td>fill anything you want, example : Haz</td>
</tr>
<tr>
<td>URL_HOST</td>
<td>http://localhost:8000 or your ipv4/virtual host, example : http://192.168.56.258:8000</td>
</tr>
<tr>
<td>URL_WEBSITE</td>
<td>localhost frontend example : http://localhost:3000 "source: <a href="https://github.com/Hazgn/vehicle-rental-react">Vehicle Rental Frontend (With React Js)</a>"</td>
</tr>
<tr>
<td>EMAIL_ADMIN</td>
<td>Fill your real email account on gmail, for feature forgot password</td>
</tr>
<tr>
<td>PASS_ADMIN</td>
<td>Fill your real password account on gmail, for feature forgot password</td>
</tr>
</table>
</ul>

## 4 Run Project

Run the app in development mode. with a command like the following :

```
npm start
```

OR

```
npm run dev
```

Open http://localhost:8000 or your ipv4/virtual host, example : http://192.168.56.258:8000 to view it in your browser.

# Related Projects

### `Vehicle Rental - Frontend` <https://github.com/Hazgn/vehicle-rental-react>

### `Vehicle Rental - Mobile` <https://github.com/Hazgn/vehicle-rental-react-native>
