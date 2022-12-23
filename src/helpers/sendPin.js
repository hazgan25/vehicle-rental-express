const nodemailer = require("nodemailer");

const send = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.PASS_ADMIN,
  },
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
});

const sendPinForgotPass = (email, pin, name) => {
  const showName = name === null || name === "" ? email : name;
  return new Promise((resolve, reject) => {
    const msg = {
      from: process.env.EMAIL_ADMIN,
      to: email,
      subject: "Forgot Password Vehicle Rental",
      html: `
                <!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                    body{
                        padding: 23px;
                    }
                        header {
                            background-color: #FFCD61;
                            width: auto;
                        }
                
                        header h1 {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                            text-align: center;
                        }
                        header h3{
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                            text-align: center;
                        padding-bottom:23px;
                        }
                
                        main p {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                        }
                        .otp{
                        font-weight:bold;
                        font-size:53px;
                        text-align:center;
                        }
                    </style>
                </head>
                
                <body>
                    <header>
                        <h1>Hello</h1>
                        <h3>${showName}</h2>
                    </header>
                    <main>
                        <p>
                            We have received a request to change your VEHICLE RENTAL account password.
                            Please enter code when resetting password, your OTP :
                        </p>
                        <p class='otp'>${pin}</p>
                    </main>

                </body>
                
                </html>
                `,
    };

    send.sendMail(msg, (err, result) => {
      if (err) return reject(err);

      resolve(result);
    });
  });
};

const sendPinVerifyRegister = (name, email, pin) => {
  const showName = name === null || name === "" ? email : name;
  return new Promise((resolve, reject) => {
    const msg = {
      from: process.env.EMAIL_ADMIN,
      to: email,
      subject: "Email Verification",
      html: `
            <!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                    body{
                        padding: 23px;
                    }
                        header {
                            background-color: #FFCD61;
                            width: auto;
                        }
                
                        header h1 {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                            text-align: center;
                        }
                        header h3{
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                            text-align: center;
                        padding-bottom:23px;
                        }
                
                        main p {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                        }
                    .flex-center{
                        display:flex;
                        justify-content:center;
                    }
                        button{
                            font-style: normal;
                            font-weight: 900;
                            font-size: 24px;
                            line-height: 33px;

                            color: #FFCD61;
                            background: #393939;
                            box-shadow: 0px 0px 20px rgba(218, 218, 218, 0.25);
                            border-radius: 10px;
                            border-radius: 10px;
                            width: 100%;
                            height: 42px;
                        }
                    </style>
                </head>
                
                <body>
                    <header>
                        <h1>Hello</h1>
                        <h3>${showName}</h2>
                    </header>
                    <main>
                        <p>
                        Hi ${showName},
                        Thanks for register and welcome to the Vehicle Rental!

                        Your account has been successfully added and you can now login to our web or app mobile and start exploring.
                        <a href='${process.env.URL_WEBSITE}/auth/verify/${pin}'>Click here</a> to verify your Email.
                        </p>
                    </main>

                </body>
                
                </html> `,
    };
    send.sendMail(msg, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  sendPinVerifyRegister,
  sendPinForgotPass,
};
