const nodemailer = require('nodemailer')

const send = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.PASS_ADMIN
    }
})

const sendPin = (email, pin, name) => {
    const showName = name === null || name === '' ? 'somebody' : name
    return new Promise((resolve, reject) => {
        const msg = {
            from: process.env.EMAIL_ADMIN,
            to: email,
            subject: 'Forgot Password Vehicle Rental',
            html:
                `
                <!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                        header {
                            background-color: #FFCD61;
                            width: auto;
                        }
                
                        header h1 {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                            text-align: center;
                        }
                
                        main p {
                            font-family: Verdana, Geneva, Tahoma, sans-serif;
                        }
                    </style>
                </head>
                
                <body>
                    <header>
                        <h1>Hello ${showName}</h1>
                    </header>
                    <main>
                        <p>
                            We have received a request to change your VEHICLE RENTAL account password.
                            Please enter code when resetting password
                        </p>
                        <p>your Pin is : ${pin}</p>
                    </main>

                </body>
                
                </html>
                `
        }

        send.sendMail(msg, (err, result) => {
            if (err) return reject(err)

            resolve(result)
        })
    })
}

module.exports = {
    sendPin
}